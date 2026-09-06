import mongoose, { Schema } from "mongoose";
import { ProductCollection, ProductSize, ProductStatus, ProductShoeSize } from "../libs/enums/product.enum";
import { Product } from "../libs/types/product";

const productShema = new Schema<Product>(
    {
        productStatus: {
            type: String,
            enum: ProductStatus,
            default: ProductStatus.PAUSE,
        },

        productCollection: {
            type: String,
            enum: ProductCollection,
            required: true
        },

        productName: {
            type: String,
            required: true,
        },

        productPrice: {
            type: Number,
            required: true,
        },

        productLeftCount: {
            type: Number,
            required: true,
        },

        productSize: {
            type: String,
            enum: ProductSize,
            default: ProductSize.M,
        },

        productShoeSize: {
            type: String,
            enum: ProductShoeSize,
        },

        productDesc: {
            type: String,
        },

        productImages: {
            type: [String],
            default: [],
        },

        productViews: {
            type: Number,
            default: 0,
        },

        productLikedBy: {
            type: [{ type: Schema.Types.ObjectId, ref: "Members" }],
            default: [],
        },
    },
    { timestamps: true }
);

productShema.index(
    { productName: 1, productSize: 1, productShoeSize: 1 },
    { unique: true }
);

export default mongoose.model<Product>("Product", productShema)
