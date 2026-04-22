import mongoose, { Schema, Document, Types } from "mongoose";
import type { IAddress, ILocation } from "../types/address.types.js";

export interface CustomerAddressDocument extends IAddress, Document { }

const LocationSchema = new Schema<ILocation>({
    type: {
        type: String,
        enum: ["Point"],
        required: true,
    },
    coordinates: {
        type: [Number],
        required: true,
    },
});

const AddressSchema = new Schema<CustomerAddressDocument>(
    {
        userId: {
            type: Types.ObjectId,
            ref: "User",
            required: true
        },
        address: { type: String, required: true },
        city: { type: String, required: true },
        pincode: { type: String, required: true },
        location: { type: LocationSchema, required: true },
    },
    { timestamps: true }
);

AddressSchema.index({ location: "2dsphere" });

const AddressModel =
    mongoose.model<CustomerAddressDocument>("Address", AddressSchema);

export default AddressModel;
