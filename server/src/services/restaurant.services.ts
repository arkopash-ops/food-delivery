import type { Types } from "mongoose";
import RestaurantModel from "../models/restaurant.models.js";
import type { IRestaurant } from "../types/restaurant.types.js";
import MenuItemModel from "../models/menuItem.models.js";

// get restaurant by manager
export const getMyRestaurant = async (managerId: Types.ObjectId) => {
    const restaurant = await RestaurantModel.findOne({ managerId });
    return restaurant;
};

export const createRestaurant = async (
    managerId: Types.ObjectId,
    data: Partial<Omit<IRestaurant, "managerId">>
) => {
    const { name, address, isOpen, avgPrepTimeMinutes, rejectionRate } = data;

    if (!name || !address) {
        const err = new Error("Name and address are required") as any;
        err.statusCode = 400;
        throw err;
    }

    const restaurant = await RestaurantModel.create({
        name,
        address,
        managerId,
        isOpen: isOpen ?? true,
        avgPrepTimeMinutes: avgPrepTimeMinutes ?? 0,
        rejectionRate: rejectionRate ?? 0,
    });

    return restaurant;
};


// update restaurant by manager
export const updateRestaurant = async (
    managerId: Types.ObjectId,
    restaurantId: string,
    data: Partial<Omit<IRestaurant, "managerId">>
) => {
    const update: Partial<IRestaurant> = {};

    if (data.name !== undefined) update.name = data.name;
    if (data.address !== undefined) update.address = data.address;
    if (data.isOpen !== undefined) update.isOpen = data.isOpen;

    const restaurant = await RestaurantModel.findOneAndUpdate(
        { _id: restaurantId, managerId },
        { $set: update },
        { new: true }
    );

    if (!restaurant) {
        const err = new Error("Restaurant not found or not owned by this manager") as any;
        err.statusCode = 404;
        throw err;
    }

    return restaurant;
};


// update isOpen state
export const updateRestaurantIsOpen = async (
    managerId: Types.ObjectId,
    restaurantId: string,
    isOpen: boolean
) => {
    const restaurant = await RestaurantModel.findOneAndUpdate(
        { _id: restaurantId, managerId },
        { $set: { isOpen } },
        { new: true }
    );

    if (!restaurant) {
        const err = new Error("Restaurant not found or not owned by this manager") as any;
        err.statusCode = 404;
        throw err;
    }

    return restaurant;
};


// MenuItems by Restaurent
export const getRestaurantWithMenu = async (restaurantId: string) => {
    const restaurant = await RestaurantModel.findById(restaurantId);
    if (!restaurant) {
        const err = new Error("Restaurant not found") as any;
        err.statusCode = 404;
        throw err;
    }

    const items = await MenuItemModel.find({
        restaurantId: restaurant._id
    }).populate("category");

    return { restaurant, items };
};
