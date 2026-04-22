import type { Types } from "mongoose";
import MenuItemModel from "../models/menuItem.models.js";
import RestaurantModel from "../models/restaurant.models.js";
import type { IItems } from "../types/menuItem.types.js";

// create menu item
export const createMenuItem = async (
    managerId: Types.ObjectId,
    data: Omit<IItems, "restaurantId">
) => {
    const { name, image, description, price, category, isAvailable } = data;

    if (!name || price == null || !category) {
        const err = new Error("Name, price, and category are required") as any;
        err.statusCode = 400;
        throw err;
    }

    // find restaurant owned by this manager
    const restaurant = await RestaurantModel.findOne({ managerId });
    if (!restaurant) {
        const err = new Error("Restaurant not found for this manager") as any;
        err.statusCode = 404;
        throw err;
    }

    const itemData: Partial<IItems> & { restaurantId: Types.ObjectId; name: string; price: number; category: Types.ObjectId } = {
        restaurantId: restaurant._id,
        name,
        image,
        price,
        category,
        isAvailable: isAvailable ?? true,
    };

    if (description !== undefined) {
        itemData.description = description;
    }

    const item = await MenuItemModel.create(itemData);

    return item;
};


// update menu item
export const updateMenuItem = async (
    managerId: Types.ObjectId,
    itemId: string,
    data: Partial<Omit<IItems, "restaurantId">>
) => {
    const restaurant = await RestaurantModel.findOne({ managerId });
    if (!restaurant) {
        const err = new Error("Restaurant not found for this manager") as any;
        err.statusCode = 404;
        throw err;
    }

    const update: Partial<IItems> = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.image !== undefined) update.image = data.image;
    if (data.description !== undefined) update.description = data.description;
    if (data.price !== undefined) update.price = data.price;
    if (data.category !== undefined) update.category = data.category;
    if (data.isAvailable !== undefined) update.isAvailable = data.isAvailable;

    const item = await MenuItemModel.findOneAndUpdate(
        { _id: itemId, restaurantId: restaurant._id },
        { $set: update },
        { returnDocument: 'after' }
    );

    if (!item) {
        const err = new Error("Menu item not found or not owned by this manager") as any;
        err.statusCode = 404;
        throw err;
    }

    return item;
};


// list all menu items 
export const listMenuItemsForManager = async (managerId: Types.ObjectId) => {
    const restaurant = await RestaurantModel.findOne({ managerId });
    if (!restaurant) {
        const err = new Error("Restaurant not found for this manager") as any;
        err.statusCode = 404;
        throw err;
    }

    const items = await MenuItemModel.find({ restaurantId: restaurant._id })
        .populate("category");

    return items;
};
