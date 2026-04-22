import type { Types } from "mongoose";
import type { IAddress } from "../types/address.types.js";
import AddressModel from "../models/address.models.js";

// create address
export const createAddress = async (
    userId: Types.ObjectId,
    data: Partial<Omit<IAddress, "userId">>
) => {
    const loc = await AddressModel.create({
        userId,
        ...data,
    });
    return loc;
};


// update address
export const updateAddress = async () => { };


// delete address
export const deleteAddress = async () => { };


// show address
export const showAddress = async () => { };
