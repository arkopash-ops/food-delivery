import { Schema } from "mongoose";
import type { IAddress } from "../types/address.types.js";

export const AddressSchema = new Schema<IAddress>({
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
        match: [/^\d{6}$/, "Please use a valid mobile number"],
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
}, { _id: false });
