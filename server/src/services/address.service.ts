import type { Types } from "mongoose";
import type { IAddress } from "../types/address.types.js";
import AddressModel from "../models/address.models.js";

export const listAddresses = async (userId: Types.ObjectId) => {
    const addresses = await AddressModel.find({ userId }).sort({ createdAt: -1 });
    return addresses;
};

// create address
export const createAddress = async (
    userId: Types.ObjectId,
    data: Partial<Omit<IAddress, "userId">>
) => {
    if (!data.address?.trim()) {
        const err = new Error("Address is required") as any;
        err.statusCode = 400;
        throw err;
    }

    if (!data.city?.trim()) {
        const err = new Error("City is required") as any;
        err.statusCode = 400;
        throw err;
    }

    if (!data.pincode?.trim()) {
        const err = new Error("Pincode is required") as any;
        err.statusCode = 400;
        throw err;
    }

    if (
        !data.location ||
        data.location.type !== "Point" ||
        !Array.isArray(data.location.coordinates) ||
        data.location.coordinates.length !== 2 ||
        data.location.coordinates.some((coord) => typeof coord !== "number" || Number.isNaN(coord))
    ) {
        const err = new Error("Valid location coordinates are required") as any;
        err.statusCode = 400;
        throw err;
    }

    const addressToCreate: IAddress = {
        userId,
        address: data.address!.trim(),
        city: data.city!.trim(),
        pincode: data.pincode!.trim(),
        location: data.location!,
    };

    const loc = await AddressModel.create(addressToCreate);
    return loc;
};


// update address
export const updateAddress = async (
    userId: Types.ObjectId,
    addressId: string,
    data: Partial<Omit<IAddress, "userId">>
) => {
    if (data.address !== undefined && !data.address.trim()) {
        const err = new Error("Address is required") as any;
        err.statusCode = 400;
        throw err;
    }

    if (data.city !== undefined && !data.city.trim()) {
        const err = new Error("City is required") as any;
        err.statusCode = 400;
        throw err;
    }

    if (data.pincode !== undefined && !data.pincode.trim()) {
        const err = new Error("Pincode is required") as any;
        err.statusCode = 400;
        throw err;
    }

    if (
        data.location !== undefined &&
        (
            data.location.type !== "Point" ||
            !Array.isArray(data.location.coordinates) ||
            data.location.coordinates.length !== 2 ||
            data.location.coordinates.some((coord) => typeof coord !== "number" || Number.isNaN(coord))
        )
    ) {
        const err = new Error("Valid location coordinates are required") as any;
        err.statusCode = 400;
        throw err;
    }

    const updateData: Partial<Omit<IAddress, "userId">> = {};

    if (data.address !== undefined) updateData.address = data.address.trim();
    if (data.city !== undefined) updateData.city = data.city.trim();
    if (data.pincode !== undefined) updateData.pincode = data.pincode.trim();
    if (data.location !== undefined) updateData.location = data.location;

    const address = await AddressModel.findOneAndUpdate(
        { _id: addressId, userId },
        { $set: updateData },
        { new: true }
    );

    if (!address) {
        const err = new Error("Address not found") as any;
        err.statusCode = 404;
        throw err;
    }

    return address;
};


// delete address
export const deleteAddress = async (
    userId: Types.ObjectId,
    addressId: string
) => {
    const address = await AddressModel.findOneAndDelete({
        _id: addressId,
        userId,
    });

    if (!address) {
        const err = new Error("Address not found") as any;
        err.statusCode = 404;
        throw err;
    }

    return address;
};


// show address
export const showAddress = async (userId: Types.ObjectId) => {
    const addresses = await listAddresses(userId);
    return addresses;
};
