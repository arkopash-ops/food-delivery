import type { Types } from "mongoose";
import type { DriverDocument } from "../models/driver.models.js";
import DriverModel from "../models/driver.models.js";

// get drivers profile
export const getMyProfile = async (driverId: Types.ObjectId) => {
    return DriverModel.findOne({ driverId }).lean();
}

// get all available drivers
export const getDrivers = async (
    filters?: { isAvailable?: boolean }
): Promise<DriverDocument[]> => {
    const query: Partial<Pick<DriverDocument, "isAvailable">> = {};

    if (typeof filters?.isAvailable === "boolean") {
        query.isAvailable = filters.isAvailable;
    }

    return DriverModel.find(query).lean();
}


// update the status of driver
export const updateDriverIsAvailable = async (
    driverId: Types.ObjectId,
    isAvailable: boolean
) => {
    const driver = await DriverModel.findOneAndUpdate(
        { driverId },
        { $set: { isAvailable } },
        { returnDocument: "after" }
    );

    if (!driver) {
        const err = new Error("Driver not found.") as any;
        err.statusCode = 404;
        throw err;
    }

    return driver;
};


// update driver current location
export const updateDriverLocation = async (
    driverId: Types.ObjectId,
    lng: number,
    lat: number
) => {
    const driver = await DriverModel.findOneAndUpdate(
        { driverId },
        {
            $set: {
                currentLocation: {
                    type: "Point",
                    coordinates: [lng, lat],
                    updatedAt: new Date(),
                },
            },
        },
        { returnDocument: "after" }
    );

    if (!driver) {
        const err = new Error("Driver not found.") as any;
        err.statusCode = 404;
        throw err;
    }

    return driver;
};
