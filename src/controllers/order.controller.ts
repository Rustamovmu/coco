import { Response } from "express";
import Errors, { HttpCode } from "../libs/Errors";
import { T } from "../libs/types/common";
import { ExtendedRequest } from "../libs/types/member";
import OrderService from "../models/Order.service";

const orderService = new OrderService();
const orderController: T = {};

orderController.createOrder = async (req: ExtendedRequest, res: Response) => {
    try {
        res.status(HttpCode.CREATED).json(await orderService.createOrder(req.member, req.body));
    } catch (err) {
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};

orderController.getMyOrders = async (req: ExtendedRequest, res: Response) => {
    try {
        res.status(HttpCode.OK).json(await orderService.getMyOrders(req.member, req.query));
    } catch (err) {
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};

orderController.updateOrder = async (req: ExtendedRequest, res: Response) => {
    try {
        res.status(HttpCode.OK).json(await orderService.updateOrder(req.member, req.body));
    } catch (err) {
        if (err instanceof Errors) res.status(err.code).json(err);
        else res.status(Errors.standart.code).json(Errors.standart);
    }
};

export default orderController;
