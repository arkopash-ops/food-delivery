import { Types } from "mongoose";
import AddressModel from "../models/address.models.js";
import MenuItemModel from "../models/menuItem.models.js";
import OrderModel from "../models/order.models.js";
import RestaurantModel from "../models/restaurant.models.js";
import { OrderStatus } from "../types/order.types.js";

export interface CreateOrderItemInput {
    menuItemId: string;
    quantity: number;
}

export interface CreateOrderInput {
    deliveryAddressId: string;
    items: CreateOrderItemInput[];
}

// create order for user
export const createOrder = async (
    customerId: Types.ObjectId,
    data: CreateOrderInput
) => {
    const { deliveryAddressId, items } = data;

    // check address Id
    if (!deliveryAddressId || !Types.ObjectId.isValid(deliveryAddressId)) {
        const err = new Error("Valid deliveryAddressId is required") as any;
        err.statusCode = 400;
        throw err;
    }

    // if cart is empty or not
    if (!Array.isArray(items) || items.length === 0) {
        const err = new Error("At least one order item is required") as any;
        err.statusCode = 400;
        throw err;
    }

    // check if item exists and quantity is positive, then return th normalized Items
    const normalizedItems = items.map((item, index) => {
        if (!item?.menuItemId || !Types.ObjectId.isValid(item.menuItemId)) {
            const err = new Error(`Valid menuItemId is required for item ${index + 1}`) as any;
            err.statusCode = 400;
            throw err;
        }

        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            const err = new Error(`Quantity must be a positive integer for item ${index + 1}`) as any;
            err.statusCode = 400;
            throw err;
        }

        return {
            menuItemId: item.menuItemId,
            quantity: item.quantity,
        };
    });

    // check for duplication
    const uniqueMenuItemIds = new Set<string>();
    for (const item of normalizedItems) {
        if (uniqueMenuItemIds.has(item.menuItemId)) {
            const err = new Error("Duplicate menu items are not allowed in the order payload") as any;
            err.statusCode = 400;
            throw err;
        }
        uniqueMenuItemIds.add(item.menuItemId);
    }

    // gget address
    const address = await AddressModel.findOne({
        _id: deliveryAddressId,
        userId: customerId,
    }).lean();

    if (!address) {
        const err = new Error("Delivery address not found") as any;
        err.statusCode = 404;
        throw err;
    }

    // check menu Items by Id
    const menuItems = await MenuItemModel.find({
        _id: { $in: normalizedItems.map((item) => item.menuItemId) },
    }).lean();

    if (menuItems.length !== normalizedItems.length) {
        const findIds = new Set(menuItems.map((item) => item._id.toString()));
        const missingIds = normalizedItems
            .map((item) => item.menuItemId)
            .filter((id) => !findIds.has(id));

        const err = new Error(`Menu items not found: ${missingIds.join(", ")}`) as any;
        err.statusCode = 404;
        throw err;
    }

    const firstMenuItem = menuItems[0];
    if (!firstMenuItem) {
        const err = new Error("Menu items not found") as any;
        err.statusCode = 404;
        throw err;
    }

    // check restaurants by Id
    const restaurantId = firstMenuItem.restaurantId.toString();
    const hasMixedRestaurants = menuItems.some(
        (item) => item.restaurantId.toString() !== restaurantId
    );

    // order must be from same restaurant
    if (hasMixedRestaurants) {
        const err = new Error("All order items must belong to the same restaurant") as any;
        err.statusCode = 400;
        throw err;
    }

    // filter for unavailable items
    const unavailableItems = menuItems.filter((item) => !item.isAvailable);
    if (unavailableItems.length > 0) {
        const err = new Error(
            `Unavailable menu items: ${unavailableItems.map((item) => item.name).join(", ")}`
        ) as any;
        err.statusCode = 400;
        throw err;
    }

    const restaurant = await RestaurantModel.findById(restaurantId).lean();
    if (!restaurant) {
        const err = new Error("Restaurant not found") as any;
        err.statusCode = 404;
        throw err;
    }

    if (!restaurant.isOpen) {
        const err = new Error("Restaurant is currently closed") as any;
        err.statusCode = 400;
        throw err;
    }

    // map manu items with quantity
    const quantityByMenuItemId = new Map(
        normalizedItems.map((item) => [item.menuItemId, item.quantity])
    );


    const orderItems = menuItems.map((item) => {
        const quantity = quantityByMenuItemId.get(item._id.toString()) ?? 0;
        return {
            menuItemId: item._id,
            categoryId: item.category,
            name: item.name,
            image: item.image,
            price: item.price,
            quantity,
            total: item.price * quantity,
        };
    });

    const subTotal = orderItems.reduce((sum, item) => sum + item.total, 0);
    const deliveryFee = 0;
    const total = subTotal + deliveryFee;

    // final order object
    const order = await OrderModel.create({
        customerId,
        restaurantId: new Types.ObjectId(restaurantId),
        driverId: null,
        status: OrderStatus.PLACED,
        items: orderItems,
        deliveryAddress: address._id,
        deliveryAddressSnapshot: {
            address: address.address,
            city: address.city,
            pincode: address.pincode,
            location: address.location,
        },
        deliveryLocation: address.location,
        subTotal,
        deliveryFee,
        total,
    });

    return order;
};


// get All my orders
export const getMyOrders = async (customerId: Types.ObjectId) => {
    const orders = await OrderModel.find({ customerId })
        .populate("restaurantId", "name image address")
        .sort({ createdAt: -1 })
        .lean();

    return orders;
};
