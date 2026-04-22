import type { IUser, UserRole } from "../types/users.types.js";
import { generateToken } from "../config/jwt.js";
import bcrypt from "bcryptjs";
import UserModel from "../models/users.models.js";

export interface RegisterUser {
    _id: string;
    email: string;
    role: UserRole;
    phone: string;
}

export interface LoginUser {
    _id: string;
    email: string;
    role: UserRole;
}

// register service
export const register = async (
    userData: IUser
): Promise<{ user: RegisterUser; token: string }> => {
    const { name, email, password, role, phone } = userData;

    if (!password) {
        const err = new Error("Password is required");
        (err as any).statusCode = 400;
        throw err;
    }

    if (!name || !email || !phone) {
        const err = new Error("Name, email and phone are required");
        (err as any).statusCode = 400;
        throw err;
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
        const err = new Error("Email already registered");
        (err as any).statusCode = 400;
        throw err;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    let newUser;

    if (role === "customer") {
        newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            role,
            phone,
        });
    } else if (role === "driver") {
        newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            role,
            phone,
        });
    } else if (role === "restaurant_manager") {
        newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            role,
            phone,
        });
    } else {
        const err = new Error("Invalid role");
        (err as any).statusCode = 400;
        throw err;
    }

    return {
        user: {
            _id: newUser._id.toString(),
            email: newUser.email,
            role: newUser.role,
            phone: newUser.phone,
        },
        token: generateToken(newUser._id.toString()),
    };
};


// login service
export const login = async (
    data: { email: string; password: string }
): Promise<{ user: LoginUser; token: string }> => {
    const { email, password } = data;

    if (!email || !password) {
        const err = new Error("Email and password are required");
        (err as any).statusCode = 400;
        throw err;
    }

    const user = await UserModel.findOne({ email }).select("+password");
    if (!user) {
        const err = new Error("Invalid email or password");
        (err as any).statusCode = 401;
        throw err;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        const err = new Error("Invalid email or password");
        (err as any).statusCode = 401;
        throw err;
    }

    return {
        user: {
            _id: user._id.toString(),
            email: user.email,
            role: user.role,
        },
        token: generateToken(user._id.toString()),
    };
};
