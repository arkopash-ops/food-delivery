import type { Types } from "mongoose";

export enum OrderStatus {
    PLACED = "PLACED",          // customer create order
    REJECTED = "REJECTED",      // restaurant can reject order
    ACCEPTED = "ACCEPTED",      // order accepted by restaurant
    READY = "READY",            // ready for pickup by restaurant
    ASSIGNED = "ASSIGNED",      // driver auto assigned(near by)
    PICKED_UP = "PICKED_UP",    // by restaurant when picked up by driver
    ON_THE_WAY = "ON_THE_WAY",  // by driver
    DELIVERED = "DELIVERED"     // by driver only when customer recived
}

export interface IStatusHistory {
    status: OrderStatus;
    changedAt: Date;
    changedBy: Types.ObjectId;
    note?: string;
}

export interface IItems {
    menuItemId: Types.ObjectId;
    name: string;
    price: number;
    quantity: number;
}

export interface IRating {
    rating: number;
    comment?: string;
}

export interface IOrder {
    customerId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    driverId?: Types.ObjectId | null;

    status: OrderStatus;
    statusHistory: IStatusHistory[];

    items: IItems[];

    deliveryAddress: Types.ObjectId;

    subTotal: number;
    total: number;

    restaurantRating?: IRating | null;
    driverRating?: IRating | null;
}
