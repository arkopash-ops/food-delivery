import type { Types } from "mongoose";
import type { ILocation } from "./address.types.js";

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

export type OrderActorRole =
    | "customer"
    | "restaurant_manager"
    | "driver"
    | "system";

export interface IStatusHistory {
    status: OrderStatus;
    changedAt: Date;
    changedBy?: Types.ObjectId | null;
    actorRole: OrderActorRole;
    note?: string;
}

export interface IOrderItemSnapshot {
    menuItemId: Types.ObjectId;
    categoryId?: Types.ObjectId;
    name: string;
    image?: string;
    price: number;
    quantity: number;
    total: number;
}

export interface IRating {
    rating: number;
    comment?: string;
}

export interface IDeliveryAddressSnapshot {
    address: string;
    city: string;
    pincode: string;
    location: ILocation;
}

export interface IOrder {
    customerId: Types.ObjectId;
    restaurantId: Types.ObjectId;
    driverId?: Types.ObjectId | null;

    status: OrderStatus;
    statusHistory: IStatusHistory[];

    items: IOrderItemSnapshot[];

    deliveryAddress: Types.ObjectId;
    deliveryAddressSnapshot: IDeliveryAddressSnapshot;
    deliveryLocation: ILocation;

    subTotal: number;
    deliveryFee?: number;
    total: number;

    restaurantRating?: IRating | null;
    driverRating?: IRating | null;
}
