import express from "express";
import cors from "cors";

import type { Request, Response } from "express";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import addressRoutes from "./routes/address.routes.js";
import restaurantRoutes from "./routes/restaurant.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import menuItemRoutes from "./routes/menu.routes.js";
import driverRoutes from "./routes/driver.routes.js";

import { logger } from "./middleware/logger.middleware.js";
import { errorLogger } from "./middleware/error.middleware.js";
import cookieParser from "cookie-parser";

const app = express();

//middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(logger);

// routes
app.get("/", async (req: Request, res: Response) => {
    console.log("Root Route.")
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/address", addressRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/menu/items", menuItemRoutes);
app.use("/api/driver", driverRoutes);

app.use(errorLogger);

export default app;
