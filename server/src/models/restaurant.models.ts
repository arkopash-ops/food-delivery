import mongoose, { Model, Schema, Types } from "mongoose";
import type { Document } from "mongoose";
import type { IRestaurant } from "../types/restaurant.types.js";

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
            address: {
                type: String,
                trim: true,
            },

            city: {
                type: String,
                trim: true,
            },

            pincode: {
                type: String,
                trim: true,
                match: [/^\d{6}$/, "Please use a valid pin"],
            },

            location: {
                type: {
                    type: String,
                    enum: ['Point'],
                    required: true,
                },
                coordinates: {
                    type: [Number],
                    required: true
                },
            },
        },

        isOpen: {
            type: Boolean,
            required: true,
            default: true,
        },

        image: {
            type: String,
            required: false,
            trim: true,
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
