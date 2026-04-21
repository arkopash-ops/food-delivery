import type { IAddress } from "./address.types.js";

export type UserRole = 'customer' | 'restaurant_manager' | 'driver'

export interface IUser {
    name: string;
    email: string;
    password: string;
    role: UserRole;
    phone: string;
    defaultAddress?: IAddress;   // Customer only
}
