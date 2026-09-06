import mongoose, { Schema } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";
import { Order } from "../libs/types/order";

const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    productName: { type: String, required: true },
    productImage: String,
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    selectedSize: String,
    selectedColor: String,
});

const OrderSchema = new Schema<Order>({
    memberId: { type: Schema.Types.ObjectId, ref: "Members", required: true, index: true },
    orderStatus: { type: String, enum: OrderStatus, default: OrderStatus.PENDING, index: true },
    orderSubtotal: { type: Number, required: true, min: 0 },
    orderShippingFee: { type: Number, required: true, min: 0 },
    orderTotal: { type: Number, required: true, min: 0 },
    refundedAmount: { type: Number, default: 0, min: 0 },
    shippingAddress: { type: String, required: true },
    orderItems: { type: [OrderItemSchema], required: true },
}, { timestamps: true });

OrderSchema.index({ memberId: 1, createdAt: -1 });

export default mongoose.model<Order>("Order", OrderSchema);
