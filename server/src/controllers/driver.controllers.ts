import type { Request, Response, NextFunction } from "express";
import type { Types } from "mongoose";
import * as driverService from "../services/driver.services.js";

interface AuthUser {
    _id: Types.ObjectId;
    role: string;
}

// get drivers profile
export const _getMyProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;

        const driver = await driverService.getMyProfile(user._id);

        if (!driver) {
            return res.status(200).json({
                success: true,
                driver: null,
            });
        }

        res.status(200).json({
            success: true,
            driver,
        });
    } catch (error) {
        next(error);
    }
};


// get all available drivers
export const _getDrivers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const drivers = await driverService.getDrivers({ isAvailable: true });

        return res.status(200).json({
            success: true,
            data: drivers,
        });
    } catch (error) {
        next(error);
    }
};


// update the status of driver
export const _updateDriverIsAvailable = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user as AuthUser;
        const isAvailable = req.body.isAvailable;

        if (typeof isAvailable !== "boolean") {
            return res
                .status(400)
                .json({ success: false, message: "isAvailable must be a boolean." });
        }

        const driver = await driverService.updateDriverIsAvailable(
            user._id,
            isAvailable
        );

        res.status(200).json({
            success: true,
            driver,
        });
    } catch (error) {
        next(error);
    }
};
