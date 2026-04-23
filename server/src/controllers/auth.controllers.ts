import type { NextFunction, Request, Response } from "express";
import * as auth from "../services/auth.services.js";

// register controller
export const _register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user } = await auth.register(req.body);

        return res.status(201).json({
            success: true,
            user,
        });

    } catch (error: any) {
        next(error);
    }
};


// login controller
export const _login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user, token } = await auth.login(req.body);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 60 * 60 * 1000,
        });

        return res.status(200).json({
            success: true,
            user,
        });

    } catch (error: any) {
        next(error)
    }
};


// logout controller
export const _logout = async (req: Request, res: Response) => {
    res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
    });

    return res.status(200).json({
        success: true,
        message: "Logged out successfully",
    });
};

