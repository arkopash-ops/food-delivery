import mongoose, { Schema } from "mongoose";
import type { Document, Model } from "mongoose";
import type { ICategory } from "../types/menuCategory.types.js";

export interface CategoryDocument extends ICategory, Document { }

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    description: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

const CategoryModel: Model<CategoryDocument> =
    mongoose.model<CategoryDocument>("Category", CategorySchema);

export default CategoryModel;