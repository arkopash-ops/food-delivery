import type { Types } from "mongoose";

export interface IItems {
    restaurantId: Types.ObjectId;
    name: string;
    image: string;
    description?: string;
    price: number;
    category: Types.ObjectId;
    isAvailable?: boolean;
}
