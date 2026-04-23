import mongoose, { Schema, Types } from "mongoose";
import type { Document, Model } from "mongoose";
import type { IDriver } from "../types/driver.types.js";

export interface DriverDocument extends IDriver, Document { }

const DriverSchema = new Schema({
    driverId: {
        type: Types.ObjectId,
        ref: "User",
        required: true,
    },

    isAvailable: {
        type: Boolean,
        required: true,
        default: false,
    },

    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },

        coordinates: {
            type: [Number],
            required: true
        },

        updateAt: {
            type: Date,
            default: Date.now,
        },
    },
}, { timestamps: true });

DriverSchema.index({ currentLocation: "2dsphere" });

const DriverModel: Model<DriverDocument> =
    mongoose.model<DriverDocument>("Driver", DriverSchema);

export default DriverModel;
