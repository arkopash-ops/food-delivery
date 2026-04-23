import type { Types } from "mongoose";
import type { ILocation } from "./address.types.js";

export interface IDriver {
    driverId: Types.ObjectId;
    isAvailable: boolean;
    currentLocation: ILocation & {
        updatedAt: Date;
    };
}
