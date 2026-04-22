import type { Types } from "mongoose";

export interface ILocation {
    type: 'Point';
    coordinates: [number, number];   // [lng, lat]
}

export interface IAddress {
    userId: Types.ObjectId;
    address: string;
    city: string;
    pincode: string;
    location: ILocation;
}
