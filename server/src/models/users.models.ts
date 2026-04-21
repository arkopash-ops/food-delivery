import mongoose, { Schema } from "mongoose";
import type { Document, Model } from "mongoose";
import type { IUser } from "../types/users.types.js";
import { AddressSchema } from "./address.models.js";

export interface UserDocument extends IUser, Document { }

const UserSchema = new Schema<UserDocument>({
    name: {
        type: String,
        required: true,
        trim: true,
    },

    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Please use a valid email address"],
    },

    password: {
        type: String,
        required: true,
        select: false,
    },

    role: {
        type: String,
        enum: ["customer", "restaurant_manager", "driver"],
        required: true
    },

    phone: {
        type: String,
        unique: true,
        trim: true,
        match: [/^\d{10}$/, "Please use a valid mobile number"],
    },
    
    defaultAddress: AddressSchema,
}, { timestamps: true });

UserSchema.index({ defaultAddress: "2dsphere" });

const UserModel: Model<UserDocument> = mongoose.model<UserDocument>('User', UserSchema);
export default UserModel;
