import type { Request, Response, NextFunction } from "express";
import type { JwtPayload } from "jsonwebtoken";
import UserModel from "../models/users.models.js";
import { verifyToken } from "../config/jwt.js";

interface JwtUserPayload extends JwtPayload {
    id: string;
}

export const protect = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token: string | undefined;

        const authHeader = req.header("Authorization") || req.header("authorization");
        if (authHeader?.startsWith("Bearer ")) {
            token = authHeader.split(" ")[1];
        }

        if (!token && req.cookies?.token) {
            token = req.cookies.token;
        }

        if (!token) {
            const err = new Error("No token, authorization denied.") as any;
            err.status = 401;
            return next(err);
        }

        const decoded = verifyToken(token) as JwtUserPayload;

        const user = await UserModel.findById(decoded.id).select("-password");
        if (!user) {
            const err = new Error("User not found.") as any;
            err.status = 404;
            return next(err)
        }

        req.user = user;
        next();
    } catch (error) {
        next(error);
    }
}
