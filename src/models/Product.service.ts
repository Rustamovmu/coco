import { shapeIntoMongooseObjectid } from "../libs/config";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { Product, ProductInput, ProductUpdateInput } from "../libs/types/product";
import ProductModel from "../schema/Product.model";
import { FilterQuery } from "mongoose";
import { ProductCollection, ProductShoeSize, ProductSize, ProductStatus } from "../libs/enums/product.enum";

class ProductService {
    private readonly productModel;

    constructor() {
        this.productModel = ProductModel;
 
    }


    /** SPA */

    public async getProducts(inquiry: Record<string, unknown>): Promise<Product[]> {
        const getString = (name: string, fallback = ""): string => {
            const value = inquiry[name];
            if (value === undefined) return fallback;
            if (typeof value !== "string") throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
            return value;
        };
        const getInteger = (name: string, fallback: string, max: number): number => {
            const value = getString(name, fallback);
            const number = Number(value);
            if (!/^\d+$/.test(value) || !Number.isSafeInteger(number) || number < 1 || number > max) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
            }
            return number;
        };
        const page = getInteger("page", "1", 1000000);
        const limit = getInteger("limit", "9", 100);
        const order = getString("order", "createdAt");
        const sort = getString("sort", order === "productPrice" ? "asc" : "desc");
        const collection = getString("productCollection");
        const search = getString("search").trim();
        const status = getString("productStatus", ProductStatus.PROCESS);
        const size = getString("size");
        if (!["createdAt", "productViews", "productPrice"].includes(order)
            || !["asc", "desc"].includes(sort)
            || (collection && !Object.values(ProductCollection).includes(collection as ProductCollection))
            || status !== ProductStatus.PROCESS || search.length > 100 || getString("color")) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
        }
        const filter: FilterQuery<Product> = { productStatus: ProductStatus.PROCESS };
        if (collection) filter.productCollection = collection;
        if (search) filter.productName = { $regex: search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
        if (size) {
            if (Object.values(ProductShoeSize).includes(size as ProductShoeSize)) {
                filter.productShoeSize = size;
                filter.$and = [{ productCollection: ProductCollection.SHOES }];
            } else if (Object.values(ProductSize).includes(size as ProductSize)) {
                filter.productSize = size;
                filter.$and = [{ productCollection: { $ne: ProductCollection.SHOES } }];
            } else {
                throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
            }
        }
        return this.productModel.find(filter)
            .select("-__v")
            .sort({ [order]: sort === "asc" ? 1 : -1, _id: 1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean()
            .exec();
    }

    public async getProduct(id: string): Promise<Product> {
        if (!/^[a-f\d]{24}$/i.test(id)) throw new Errors(HttpCode.BAD_REQUEST, Message.NO_DATA_FOUND);
        const result = await this.productModel
            .findOne({ _id: id, productStatus: ProductStatus.PROCESS })
            .select("-__v")
            .lean()
            .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        return result;
    }

    /** SSR */

    public async getAllProducts(): Promise<Product[]> {
        const result = await this.productModel
        .find()
        .exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);

        return result;
    }

    public async createNewProduct(input: ProductInput): Promise<Product> {
        try {
            return await this.productModel.create(input);
        } catch (err) {
            console.error("Error, model:createNewProduct:", err);
            throw new Errors(HttpCode.BAD_REQUEST, Message.CREATE_FAILED)
        }
    }


    public async updateChosenProduct(id: string | string[], input: ProductUpdateInput): Promise<Product> {
        id = shapeIntoMongooseObjectid(id);
        const result = await this.productModel
        .findOneAndUpdate({ _id: id}, input, { new: true})
        .exec();
        if (!result) throw new Errors(HttpCode.NOT_MODIFIED, Message.UPDATE_FAILED);

        return result;
    }
}

export default ProductService;
