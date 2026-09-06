import { Types } from "mongoose";
import { OrderStatus } from "../enums/order.enum";

export interface OrderItemInput {
    productId: string;
    quantity: number;
    selectedSize?: string;
    selectedColor?: string;
}

export interface OrderItem {
    _id: Types.ObjectId;
    productId: Types.ObjectId;
    productName: string;
    productImage?: string;
    quantity: number;
    unitPrice: number;
    selectedSize?: string;
    selectedColor?: string;
}

export interface Order {
    _id: Types.ObjectId;
    memberId: Types.ObjectId;
    orderStatus: OrderStatus;
    orderSubtotal: number;
    orderShippingFee: number;
    orderTotal: number;
    shippingAddress: string;
    orderItems: OrderItem[];
    createdAt: Date;
    updatedAt: Date;
}

export interface OrderUpdateInput {
    orderId: string;
    orderStatus: OrderStatus;
}
