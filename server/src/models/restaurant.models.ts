import mongoose, { Model, Schema, Types } from "mongoose";
import type { Document } from "mongoose";
import type { IRestaurant } from "../types/restaurant.types.js";
import { AddressSchema } from "./address.models.js";

export interface RestaurantDocument extends IRestaurant, Document { }

const RestaurantSchema = new Schema<RestaurantDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        managerId: {
            type: Types.ObjectId,
            ref: "User",
            required: true,
        },

        address: {
            type: AddressSchema,
            required: true,
        },

        isOpen: {
            type: Boolean,
            required: true,
            default: true,
        },

        avgPrepTimeMinutes: {
            type: Number,
            default: 0,
        },

        rejectionRate: {
            type: Number,
            default: 0,
        },
    },
    { timestamps: true }
);

RestaurantSchema.index({ "address.location": "2dsphere" });

const RestaurantModel: Model<RestaurantDocument> =
    mongoose.model<RestaurantDocument>("Restaurant", RestaurantSchema);

export default RestaurantModel;
