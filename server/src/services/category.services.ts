import CategoryModel from "../models/category.models.js";
import type { ICategory } from "../types/menuCategory.types.js";


// show all categories
export const getAllCategories = async () => {
    const categories = await CategoryModel.find().sort({ name: 1 });
    return categories;
};


// add category
export const createCategory = async (data: ICategory) => {
    const { name, description } = data;

    if (!name) {
        const err = new Error("Category name is required") as any;
        err.statusCode = 400;
        throw err;
    }

    const existing = await CategoryModel.findOne({ name });
    if (existing) {
        const err = new Error("Category name already exists") as any;
        err.statusCode = 400;
        throw err;
    }

    const category = await CategoryModel.create({
        name,
        description: description ?? "",
    });

    return category;
};


// update category
export const updateCategory = async (
    id: string,
    data: Partial<ICategory>
) => {
    const update: Partial<ICategory> = {};

    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;

    const category = await CategoryModel.findByIdAndUpdate(
        id,
        { $set: update },
        { new: true }
    );

    if (!category) {
        const err = new Error("Category not found") as any;
        err.statusCode = 404;
        throw err;
    }

    return category;
};


// delete category
export const deleteCategory = async (id: string) => {
    const category = await CategoryModel.findByIdAndDelete(id);

    if (!category) {
        const err = new Error("Category not found") as any;
        err.statusCode = 404;
        throw err;
    }

    return category;
};
