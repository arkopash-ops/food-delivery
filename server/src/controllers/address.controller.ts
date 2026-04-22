import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import {
    createAddress,
} from "../services/address.service.js";

interface AuthUser {
    _id: Types.ObjectId;
    role: string;
}

export const _createAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const address = await createAddress(
            user._id,
            req.body
        );
        res.status(201).json({
            success: true,
            address,
        });
    } catch (error) {
        next(error);
    }
};
