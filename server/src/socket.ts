import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import { verifyToken } from "./config/jwt.js";

interface JwtUserPayload {
    id: string;
}

let io: Server | null = null;

const getTokenFromCookieHeader = (cookieHeader?: string) => {
    if (!cookieHeader) {
        return undefined;
    }

    const tokenCookie = cookieHeader
        .split(";")
        .map((item) => item.trim())
        .find((item) => item.startsWith("token="));

    if (!tokenCookie) {
        return undefined;
    }

    return decodeURIComponent(tokenCookie.replace("token=", ""));
};

const attachUserRoom = (socket: Socket) => {
    try {
        const token = getTokenFromCookieHeader(socket.handshake.headers.cookie);

        if (!token) {
            return;
        }

        const decoded = verifyToken(token) as JwtUserPayload;
        if (!decoded?.id) {
            return;
        }

        socket.join(`user:${decoded.id}`);
    } catch (error) {
        console.error("Socket auth failed", error);
    }
};

// initial socket
export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            credentials: true,
        },
    });

    io.on("connection", (socket) => {
        attachUserRoom(socket);
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io has not been initialized.");
    }

    return io;
};

const extractId = (value: any) => {
    if (!value) {
        return null;
    }

    if (typeof value === "string") {
        return value;
    }

    if (typeof value === "object" && "_id" in value && value._id) {
        return value._id.toString();
    }

    return value.toString?.() ?? null;
};

export const emitOrderUpdated = (
    order: any,
    options?: {
        customerUserId?: string | null;
        driverUserId?: string | null;
        restaurantManagerUserId?: string | null;
    }
) => {
    if (!io || !order) {
        return;
    }

    const customerUserId =
        options?.customerUserId ?? extractId(order.customerId);
    const driverUserId =
        options?.driverUserId ??
        extractId(order.driverId?.driverId) ??
        extractId(order.driverId);
    const restaurantManagerUserId =
        options?.restaurantManagerUserId ??
        extractId(order.restaurantId?.managerId);

    if (customerUserId) {
        io.to(`user:${customerUserId}`).emit("order:updated", order);
    }

    if (driverUserId) {
        io.to(`user:${driverUserId}`).emit("order:updated", order);
    }

    if (restaurantManagerUserId) {
        io.to(`user:${restaurantManagerUserId}`).emit("order:updated", order);
    }
};
