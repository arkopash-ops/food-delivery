import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import * as orderController from "../controllers/order.controllers.js";

const router = Router();

router.post(
    "/",
    protect,
    requireRole("customer"),
    orderController._createOrder
);

router.get(
    "/my",
    protect,
    requireRole("customer"),
    orderController._getMyOrders
);

export default router;
