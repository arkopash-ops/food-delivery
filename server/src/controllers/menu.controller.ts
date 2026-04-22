import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";
import * as menuItemService from "../services/menu.services.js";
import { uploadCloudinary } from "../middleware/uploadCloudinary.middleware.js";

interface AuthUser {
    _id: Types.ObjectId;
    role: string;
}

// create menu item
export const _createMenuItem = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;

        let imageUrl: string | undefined;
        if (req.file && req.file.buffer) {
            const result = await uploadCloudinary(
                req.file.buffer,
                "menu"
            );
            imageUrl = result.secure_url;
        }

        const item = await menuItemService.createMenuItem(user._id, {
            ...req.body,
            image: imageUrl,
        });

        res.status(201).json({
            success: true,
            item,
        });
    } catch (error) {
        next(error);
    }
};


// update menu item
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

        let imageUrl: string | undefined;
        if (req.file && req.file.buffer) {
            const result = await uploadCloudinary(
                req.file.buffer,
                "menu"
            );
            imageUrl = result.secure_url;
        }

        const updateData = {
            ...req.body,
            ...(imageUrl ? { image: imageUrl } : {}),
        };

        const item = await menuItemService.updateMenuItem(
            user._id,
            id,
            updateData
        );

        res.status(200).json({
            success: true,
            item,
        });
    } catch (error) {
        next(error);
    }
};


// list all menu items 
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
