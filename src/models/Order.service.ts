import { Types } from "mongoose";
import { OrderStatus } from "../libs/enums/order.enum";
import Errors, { HttpCode, Message } from "../libs/Errors";
import { AuthMember } from "../libs/types/member";
import { Order, OrderItemInput, OrderUpdateInput } from "../libs/types/order";
import MemberModel from "../schema/Member.model";
import OrderModel from "../schema/Order.model";
import ProductModel from "../schema/Product.model";
import { ProductStatus } from "../libs/enums/product.enum";

const objectIdPattern = /^[a-f\d]{24}$/i;

class OrderService {
    public async createOrder(member: AuthMember | undefined, input: unknown): Promise<Order> {
        if (!member) throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHORIZED);
        if (!Array.isArray(input) || input.length < 1 || input.length > 50) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER);
        }

        const items = input as OrderItemInput[];
        for (const item of items) {
            if (!item || typeof item !== "object" || !objectIdPattern.test(item.productId)
                || !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 20
                || (item.selectedSize !== undefined && (typeof item.selectedSize !== "string" || item.selectedSize.length > 30))
                || (item.selectedColor !== undefined && (typeof item.selectedColor !== "string" || item.selectedColor.length > 50))) {
                throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER);
            }
        }

        const productIds = [...new Set(items.map(item => item.productId))];
        const products = await ProductModel.find({
            _id: { $in: productIds.map(id => new Types.ObjectId(id)) },
            productStatus: ProductStatus.PROCESS,
        }).lean().exec();
        if (products.length !== productIds.length) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER);
        }

        const memberProfile = await MemberModel.findById(member._id).select("memberAddress").lean().exec();
        const shippingAddress = memberProfile?.memberAddress?.trim();
        if (!shippingAddress) throw new Errors(HttpCode.BAD_REQUEST, Message.DELIVERY_ADDRESS_REQUIRED);

        const productMap = new Map(products.map(product => [String(product._id), product]));
        const quantities = new Map<string, number>();
        for (const item of items) quantities.set(item.productId, (quantities.get(item.productId) ?? 0) + item.quantity);

        const orderItems = items.map(item => {
            const product = productMap.get(item.productId)!;
            return {
                productId: product._id,
                productName: product.productName,
                productImage: product.productImages[0],
                quantity: item.quantity,
                unitPrice: product.productPrice,
                selectedSize: item.selectedSize?.trim(),
                selectedColor: item.selectedColor?.trim(),
            };
        });
        const orderSubtotal = orderItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);
        const orderShippingFee = orderSubtotal >= 150 ? 0 : 10;
        const decremented: Array<{ productId: string; quantity: number }> = [];

        try {
            for (const [productId, quantity] of quantities) {
                const product = await ProductModel.findOneAndUpdate(
                    { _id: productId, productStatus: ProductStatus.PROCESS, productLeftCount: { $gte: quantity } },
                    { $inc: { productLeftCount: -quantity } },
                    { new: true }
                ).exec();
                if (!product) throw new Errors(HttpCode.BAD_REQUEST, Message.INSUFFICIENT_STOCK);
                decremented.push({ productId, quantity });
            }

            const order = await OrderModel.create({
                memberId: member._id,
                orderStatus: OrderStatus.PENDING,
                orderSubtotal,
                orderShippingFee,
                orderTotal: orderSubtotal + orderShippingFee,
                shippingAddress,
                orderItems,
            });
            return order.toObject() as unknown as Order;
        } catch (error) {
            if (decremented.length) {
                await ProductModel.bulkWrite(decremented.map(item => ({
                    updateOne: { filter: { _id: item.productId }, update: { $inc: { productLeftCount: item.quantity } } },
                })) as any).catch(rollbackError => console.error("Order stock rollback failed:", rollbackError));
            }
            throw error;
        }
    }

    public async getMyOrders(member: AuthMember | undefined, inquiry: Record<string, unknown>): Promise<Order[]> {
        if (!member) throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHORIZED);
        const page = Number(inquiry.page ?? 1);
        const limit = Number(inquiry.limit ?? 50);
        const status = inquiry.orderStatus;
        if (!Number.isSafeInteger(page) || page < 1 || !Number.isSafeInteger(limit) || limit < 1 || limit > 100
            || (status !== undefined && (typeof status !== "string" || !Object.values(OrderStatus).includes(status as OrderStatus)))) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER);
        }
        const filter: { memberId: Types.ObjectId; orderStatus?: OrderStatus } = { memberId: member._id };
        if (status) filter.orderStatus = status as OrderStatus;
        return OrderModel.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean().exec();
    }

    public async updateOrder(member: AuthMember | undefined, input: OrderUpdateInput): Promise<Order> {
        if (!member) throw new Errors(HttpCode.UNAUTHORIZED, Message.NOT_AUTHORIZED);
        if (!input || !objectIdPattern.test(input.orderId) || input.orderStatus !== OrderStatus.CANCELLED) {
            throw new Errors(HttpCode.BAD_REQUEST, Message.INVALID_ORDER);
        }
        const result = await OrderModel.findOneAndUpdate(
            { _id: input.orderId, memberId: member._id, orderStatus: OrderStatus.PENDING },
            { $set: { orderStatus: OrderStatus.CANCELLED } },
            { new: true }
        ).lean().exec();
        if (!result) throw new Errors(HttpCode.NOT_FOUND, Message.NO_DATA_FOUND);
        await ProductModel.bulkWrite(result.orderItems.map(item => ({
            updateOne: { filter: { _id: item.productId }, update: { $inc: { productLeftCount: item.quantity } } },
        })) as any);
        return result;
    }
}

export default OrderService;
