import { Schema } from "mongoose";
import type { IDefaultAddress } from "../types/address.types.js";

export const AddressSchema = new Schema<IDefaultAddress>({
    address: {
        type: String,
        required: true,
        trim: true,
    },

    city: {
        type: String,
        required: true,
        trim: true,
    },

    pincode: {
        type: String,
        unique: true,
        trim: true,
        match: [/^\d{6}$/, "Please use a valid mobile number"],
    },

    location: {
        type: "Point",
        coordinates: {
            type: [Number],
            require: true
        },
    },
}, { _id: false });
