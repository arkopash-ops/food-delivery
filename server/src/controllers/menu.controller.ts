import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";
import * as menuItemService from "../services/menu.services.js";

interface AuthUser {
    _id: Types.ObjectId;
    role: string;
}

// POST /api/menu/items
export const _createMenuItem = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;

        const item = await menuItemService.createMenuItem(user._id, req.body);

        res.status(201).json({
            success: true,
            item,
        });
    } catch (error) {
        next(error);
    }
};


// PATCH /api/menu/items/:id
export const _updateMenuItem = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ success: false, message: "Invalid or missing id." });
        }

        const item = await menuItemService.updateMenuItem(user._id, id, req.body);

        res.status(200).json({
            success: true,
            item,
        });
    } catch (error) {
        next(error);
    }
};


// GET /api/menu/items/my
export const _listMenuItemsForManager = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;

        const items = await menuItemService.listMenuItemsForManager(user._id);

        res.status(200).json({
            success: true,
            items,
        });
    } catch (error) {
        next(error);
    }
};
