import type { Types } from "mongoose";

export interface IDriver {
    driverId: Types.ObjectId;
    isAvailable: boolean;
    currentLocation: {
        type: 'Point';
        coordinates: [number, number];   // [lng, lat]
        updatedAt: Date;
    }
}
