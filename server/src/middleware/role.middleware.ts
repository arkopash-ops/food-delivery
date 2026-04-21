import type { Request, Response, NextFunction } from "express";
import type { UserRole } from "../types/users.types.js";

export const requireRole = (role: UserRole) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user || req.user.role !== role) {
            return res.status(403).json({ error: "Forbidden" });
        }
        next();
    };
};
