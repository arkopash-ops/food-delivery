import type { Request, Response, NextFunction } from "express";
import * as categoryService from "../services/category.services.js";


// get all category
export const _getAllCategories = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const categories = await categoryService.getAllCategories();

        res.status(200).json({
            success: true,
            categories,
        });
    } catch (error) {
        next(error);
    }
};


// create category
export const _createCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const category = await categoryService.createCategory(req.body);

        res.status(201).json({
            success: true,
            category,
        });
    } catch (error) {
        next(error);
    }
};


// update category
export const _updateCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ success: false, message: "Invalid or missing id." });
        }

        const category = await categoryService.updateCategory(id, req.body);

        res.status(200).json({
            success: true,
            category,
        });
    } catch (error) {
        next(error);
    }
};


// delete category
export const _deleteCategory = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { id } = req.params;

        if (!id || Array.isArray(id)) {
            return res.status(400).json({ success: false, message: "Invalid or missing id." });
        }

        await categoryService.deleteCategory(id);

        res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};
