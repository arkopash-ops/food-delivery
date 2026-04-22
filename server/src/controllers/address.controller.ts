import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";
import {
    createAddress,
    deleteAddress,
    showAddress,
    updateAddress,
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

export const _showAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const addresses = await showAddress(user._id);

        res.status(200).json({
            success: true,
            addresses,
        });
    } catch (error) {
        next(error);
    }
};

export const _updateAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing id.",
            });
        }

        const address = await updateAddress(user._id, id, req.body);

        res.status(200).json({
            success: true,
            address,
        });
    } catch (error) {
        next(error);
    }
};

export const _deleteAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid or missing id.",
            });
        }

        await deleteAddress(user._id, id);

        res.status(200).json({
            success: true,
            message: "Address deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
