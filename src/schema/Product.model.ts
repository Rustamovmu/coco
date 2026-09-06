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
        },

        productShoeSize: {
            type: String,
            enum: ProductShoeSize,
        },

        productSizes: {
            type: [String],
            enum: [...Object.values(ProductSize), ...Object.values(ProductShoeSize)],
            default: [],
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

        productViewedBy: {
            type: [{ type: Schema.Types.ObjectId, ref: "Members" }],
            default: [],
            select: false,
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
