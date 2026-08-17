import mongoose, { Schema } from "mongoose";
import { ProductCollection, ProductSize, ProductStatus, ProductShoeSize } from "../libs/enums/product.enum";

const productShema = new Schema(
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
            type: Number,
            enum: ProductShoeSize,
            default: ProductShoeSize.EU_40,
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
    },
    { timestamps: true }
);

productShema.index(
    { productName: 1, productSize: 1, ProductShoeSize: 1 },
    { unique: true }
);

export default mongoose.model("Product", productShema)