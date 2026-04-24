import { Types } from "mongoose";
import AddressModel from "../models/address.models.js";
import DriverModel from "../models/driver.models.js";
import MenuItemModel from "../models/menuItem.models.js";
import OrderModel from "../models/order.models.js";
import RestaurantModel from "../models/restaurant.models.js";
import { OrderStatus } from "../types/order.types.js";
import type { ILocation } from "../types/address.types.js";

export interface CreateOrderItemInput {
    menuItemId: string;
    quantity: number;
}

export interface CreateOrderInput {
    deliveryAddressId: string;
    items: CreateOrderItemInput[];
}

const restaurantOrderStatuses = [
    OrderStatus.PLACED,
    OrderStatus.ACCEPTED,
    OrderStatus.REJECTED,
    OrderStatus.READY,
] as const;

type RestaurantOrderStatus = (typeof restaurantOrderStatuses)[number];

const isRestaurantOrderStatus = (
    value: string
): value is RestaurantOrderStatus => {
    return restaurantOrderStatuses.includes(value as RestaurantOrderStatus);
};


// find nearest driver and assign order
const assignNearestAvailableDriver = async (pickupLocation: ILocation) => {
    return DriverModel.findOneAndUpdate(
        {
            isAvailable: true,
            currentLocation: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: pickupLocation.coordinates,
                    },
                },
            },
        },
        { $set: { isAvailable: false } },
        { returnDocument: "after" }
    );
};


// update the status of order
const updateOrderStatusForRestaurant = async (
    managerId: Types.ObjectId,
    orderId: string,
    currentStatus: OrderStatus,
    nextStatus: OrderStatus.ACCEPTED | OrderStatus.REJECTED | OrderStatus.READY
) => {
    if (!Types.ObjectId.isValid(orderId)) {
        const err = new Error("Valid orderId is required") as any;
        err.statusCode = 400;
        throw err;
    }

    const restaurant = await RestaurantModel.findOne({ managerId })
        .select("_id")
        .lean();

    if (!restaurant) {
        const err = new Error("Restaurant not found for this manager") as any;
        err.statusCode = 404;
        throw err;
    }

    const order = await OrderModel.findOne({
        _id: orderId,
        restaurantId: restaurant._id,
    });

    if (!order) {
        const err = new Error("Order not found for this restaurant") as any;
        err.statusCode = 404;
        throw err;
    }

    if (order.status !== currentStatus) {
        const err = new Error(
            `Only ${currentStatus} orders can be changed to ${nextStatus} by restaurant`
        ) as any;
        err.statusCode = 400;
        throw err;
    }

    if (nextStatus === OrderStatus.READY) {
        const restaurant = await RestaurantModel.findById(order.restaurantId)
            .select("address.location")
            .lean();

        if (!restaurant?.address?.location) {
            const err = new Error("Restaurant pickup location not found") as any;
            err.statusCode = 404;
            throw err;
        }

        const assignedDriver = await assignNearestAvailableDriver(
            restaurant.address.location
        );

        if (!assignedDriver) {
            const err = new Error("No available driver found for this order") as any;
            err.statusCode = 404;
            throw err;
        }

        order.statusHistory.push({
            status: OrderStatus.READY,
            changedAt: new Date(),
            changedBy: managerId,
            actorRole: "restaurant_manager",
        });

        order.driverId = assignedDriver._id;
        order.status = OrderStatus.ASSIGNED;
        order.statusHistory.push({
            status: OrderStatus.ASSIGNED,
            changedAt: new Date(),
            changedBy: assignedDriver._id,
            actorRole: "system",
            note: "Assigned to nearest available driver",
        });
    } else {
        order.status = nextStatus;
        order.statusHistory.push({
            status: nextStatus,
            changedAt: new Date(),
            changedBy: managerId,
            actorRole: "restaurant_manager",
        });
    }

    await order.save();

    if (nextStatus === OrderStatus.REJECTED) {
        await updateRestaurantRejectionRate(order.restaurantId);
    }

    await order.populate("customerId", "name email phone");

    return order;
};


// update rejection rate for restaurant
const updateRestaurantRejectionRate = async (restaurantId: Types.ObjectId) => {
    const [totalOrders, rejectedOrders] = await Promise.all([
        OrderModel.countDocuments({ restaurantId }),
        OrderModel.countDocuments({
            restaurantId,
            status: OrderStatus.REJECTED,
        }),
    ]);

    const rejectionRate = totalOrders === 0
        ? 0
        : Number(((rejectedOrders / totalOrders) * 100).toFixed(2));

    await RestaurantModel.findByIdAndUpdate(restaurantId, {
        $set: { rejectionRate },
    });
};



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


// get PLACED orders for the logged-in restaurant manager
export const getMyPlacedOrder = async (
    managerId: Types.ObjectId,
    status: string = OrderStatus.PLACED
) => {
    if (!isRestaurantOrderStatus(status)) {
        const err = new Error("Invalid order status") as any;
        err.statusCode = 400;
        throw err;
    }

    const restaurant = await RestaurantModel.findOne({ managerId })
        .select("_id")
        .lean();

    if (!restaurant) {
        return [];
    }

    const orders = await OrderModel.find({
        restaurantId: restaurant._id,
        status,
    })
        .populate("customerId", "name email phone")
        .sort({ createdAt: -1 })
        .lean();

    return orders;
};


// status change to ACCEPTED for PLACED order
export const acceptPlacedOrder = async (
    managerId: Types.ObjectId,
    orderId: string
) => {
    return updateOrderStatusForRestaurant(
        managerId,
        orderId,
        OrderStatus.PLACED,
        OrderStatus.ACCEPTED
    );
};


// status change to REJECTED for PLACED order
export const rejectPlacedOrder = async (
    managerId: Types.ObjectId,
    orderId: string
) => {
    return updateOrderStatusForRestaurant(
        managerId,
        orderId,
        OrderStatus.PLACED,
        OrderStatus.REJECTED
    );
};


// status change to READY for ACCEPTED order
export const readyAcceptedOrder = async (
    managerId: Types.ObjectId,
    orderId: string
) => {
    return updateOrderStatusForRestaurant(
        managerId,
        orderId,
        OrderStatus.ACCEPTED,
        OrderStatus.READY
    );
};
