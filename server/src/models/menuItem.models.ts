// models/menuItem.models.ts
import mongoose, { Schema, Model, Types } from "mongoose";
import type { Document } from "mongoose";
import type { IItems } from "../types/menuItem.types.js";

export interface MenuItemDocument extends IItems, Document { }

const MenuItemSchema = new Schema<MenuItemDocument>(
    {
        restaurantId: {
            type: Types.ObjectId,
            ref: "Restaurant",
            required: true,
            index: true,
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        image: {
            type: String,
            required: false,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        category: {
            type: Types.ObjectId,
            ref: "Category",
            required: true,
        },
        isAvailable: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

const MenuItemModel: Model<MenuItemDocument> =
    mongoose.model<MenuItemDocument>("MenuItem", MenuItemSchema);

export default MenuItemModel;
