import type { NextFunction, Request, Response } from "express";
import type { Types } from "mongoose";
import * as orderService from "../services/order.services.js";

interface AuthUser {
    _id: Types.ObjectId;
    role: string;
}


// create order for user
export const _createOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const order = await orderService.createOrder(user._id, req.body);

        return res.status(201).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
};


// get All my orders
export const _getMyOrders = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const orders = await orderService.getMyOrders(user._id);

        return res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        next(error);
    }
};
