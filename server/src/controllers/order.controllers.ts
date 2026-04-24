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


// rate delivered order
export const _updateOrderRatings = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const { orderId } = req.params;

        if (!orderId || Array.isArray(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing orderId.",
            });
        }

        const order = await orderService.updateOrderRatings(
            user._id,
            orderId,
            req.body
        );

        return res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
};


// get PLACED orders for restaurant manager
export const _getMyPlacedOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const status =
            typeof req.query.status === "string" ? req.query.status : undefined;
        const orders = await orderService.getMyPlacedOrder(user._id, status);

        return res.status(200).json({
            success: true,
            orders,
        });
    } catch (error) {
        next(error);
    }
};


// status change to ACCEPTED for PLACED order
export const _acceptPlacedOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const { orderId } = req.params;

        if (!orderId || Array.isArray(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing orderId.",
            });
        }

        const order = await orderService.acceptPlacedOrder(
            user._id,
            orderId
        );

        return res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
};


// status change to REJECTED for PLACED order
export const _rejectPlacedOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const { orderId } = req.params;

        if (!orderId || Array.isArray(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing orderId.",
            });
        }

        const order = await orderService.rejectPlacedOrder(
            user._id,
            orderId
        );

        return res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
};


// status change to READY for ACCEPTED order
export const _readyAcceptedOrder = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const { orderId } = req.params;

        if (!orderId || Array.isArray(orderId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing orderId.",
            });
        }

        const order = await orderService.readyAcceptedOrder(
            user._id,
            orderId
        );

        return res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        next(error);
    }
};
