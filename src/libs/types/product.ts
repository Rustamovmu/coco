import { ObjectId, Types } from "mongoose";
import { ProductCollection, ProductShoeSize, ProductSize, ProductStatus } from "../enums/product.enum";

export interface Product {
    _id: ObjectId;
    productStatus: ProductStatus;
    productCollection: ProductCollection;
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productSize: ProductSize;
    productShoeSize: ProductShoeSize;
    productDesc?: string;
    productImages: string[];
    productViews: number;
    productLikedBy: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

export type ProductResponse = Omit<Product, "productLikedBy"> & {
    productLikes: number;
    isLiked: boolean;
};

export interface ProductInquiry {
    order: string;
    page: number;
    limit: number;
    productCollection?: ProductCollection;
    search?: string;
}

export interface ProductInput {
    productStatus?: ProductStatus;
    productCollection: ProductCollection;
    productName: string;
    productPrice: number;
    productLeftCount: number;
    productSize?: ProductSize;
    productShoeSize?: ProductShoeSize;
    productDesc?: string;
    productImages?: string[];
    productViews?: number;
}

export interface ProductUpdateInput {
    _id: Types.ObjectId;
    productStatus?: ProductStatus;
    productCollection?: ProductCollection;
    productName?: string;
    productPrice?: number;
    productLeftCount?: number;
    productSize?: ProductSize;
    productShoeSize?: ProductShoeSize;
    productDesc?: string;
    productImages?: string[];
    productViews?: number;
}
