import { Types } from "mongoose";
import type { DriverDocument } from "../models/driver.models.js";
import DriverModel from "../models/driver.models.js";
import OrderModel from "../models/order.models.js";
import { OrderStatus } from "../types/order.types.js";

const updateOrderStatusForDriver = async (
    driverUserId: Types.ObjectId,
    orderId: string,
    currentStatus: OrderStatus,
    nextStatus: OrderStatus.PICKED_UP | OrderStatus.ON_THE_WAY | OrderStatus.DELIVERED
) => {
    if (!Types.ObjectId.isValid(orderId)) {
        const err = new Error("Valid orderId is required") as any;
        err.statusCode = 400;
        throw err;
    }

    const driver = await DriverModel.findOne({ driverId: driverUserId })
        .select("_id")
        .lean();

    if (!driver) {
        const err = new Error("Driver not found.") as any;
        err.statusCode = 404;
        throw err;
    }

    const order = await OrderModel.findOne({
        _id: orderId,
        driverId: driver._id,
    });

    if (!order) {
        const err = new Error("Order not found for this driver.") as any;
        err.statusCode = 404;
        throw err;
    }

    if (order.status !== currentStatus) {
        const err = new Error(
            `Only ${currentStatus} orders can be changed to ${nextStatus} by driver`
        ) as any;
        err.statusCode = 400;
        throw err;
    }

    order.status = nextStatus;
    order.statusHistory.push({
        status: nextStatus,
        changedAt: new Date(),
        changedBy: driver._id,
        actorRole: "driver",
    });

    await order.save();

    await order.populate("restaurantId", "name image address");
    await order.populate("customerId", "name email phone");

    return order;
};

// get drivers profile
export const getMyProfile = async (driverId: Types.ObjectId) => {
    return DriverModel.findOne({ driverId }).lean();
}

// get all available drivers
export const getDrivers = async (
    filters?: { isAvailable?: boolean }
): Promise<DriverDocument[]> => {
    const query: Partial<Pick<DriverDocument, "isAvailable">> = {};

    if (typeof filters?.isAvailable === "boolean") {
        query.isAvailable = filters.isAvailable;
    }

    return DriverModel.find(query).lean();
}


// update the status of driver
export const updateDriverIsAvailable = async (
    driverId: Types.ObjectId,
    isAvailable: boolean
) => {
    const driver = await DriverModel.findOneAndUpdate(
        { driverId },
        { $set: { isAvailable } },
        { returnDocument: "after" }
    );

    if (!driver) {
        const err = new Error("Driver not found.") as any;
        err.statusCode = 404;
        throw err;
    }

    return driver;
};


// update driver current location
export const updateDriverLocation = async (
    driverId: Types.ObjectId,
    lng: number,
    lat: number
) => {
    const driver = await DriverModel.findOneAndUpdate(
        { driverId },
        {
            $set: {
                currentLocation: {
                    type: "Point",
                    coordinates: [lng, lat],
                    updatedAt: new Date(),
                },
            },
        },
        { returnDocument: "after" }
    );

    if (!driver) {
        const err = new Error("Driver not found.") as any;
        err.statusCode = 404;
        throw err;
    }

    return driver;
};


// get assigned order details for driver
export const getMyAssignedOrder = async (driverUserId: Types.ObjectId) => {
    const driver = await DriverModel.findOne({ driverId: driverUserId })
        .select("_id")
        .lean();

    if (!driver) {
        const err = new Error("Driver not found.") as any;
        err.statusCode = 404;
        throw err;
    }

    const order = await OrderModel.findOne({
        driverId: driver._id,
        status: {
            $in: [
                OrderStatus.ASSIGNED,
                OrderStatus.PICKED_UP,
                OrderStatus.ON_THE_WAY,
            ],
        },
    })
        .populate("restaurantId", "name image address")
        .populate("customerId", "name email phone")
        .sort({ createdAt: -1 })
        .lean();

    return order;
};


// status change to PICKED_UP for ASSIGNED order
export const pickUpAssignedOrder = async (
    driverUserId: Types.ObjectId,
    orderId: string
) => {
    return updateOrderStatusForDriver(
        driverUserId,
        orderId,
        OrderStatus.ASSIGNED,
        OrderStatus.PICKED_UP
    );
};


// status change to ON_THE_WAY for PICKED_UP order
export const onTheWayPickedUpOrder = async (
    driverUserId: Types.ObjectId,
    orderId: string
) => {
    return updateOrderStatusForDriver(
        driverUserId,
        orderId,
        OrderStatus.PICKED_UP,
        OrderStatus.ON_THE_WAY
    );
};


// status change to DELIVERED for ON_THE_WAY order
export const deliverOnTheWayOrder = async (
    driverUserId: Types.ObjectId,
    orderId: string
) => {
    return updateOrderStatusForDriver(
        driverUserId,
        orderId,
        OrderStatus.ON_THE_WAY,
        OrderStatus.DELIVERED
    );
};
