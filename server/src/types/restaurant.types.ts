import type { Types } from "mongoose";
import type { IAddress } from "./address.types.js";

export interface IRestaurant {
    name: string;
    managerId: Types.ObjectId;
    address: IAddress;
    isOpen: boolean;
    image: string;
    avgPrepTimeMinutes?: number;
    rejectionRate?: number;
}
