import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import * as driverController from "../controllers/driver.controllers.js"

const router = Router();

router.get(
    "/me",
    protect,
    requireRole("driver"),
    driverController._getMyProfile
);

router.get(
    "/me/order",
    protect,
    requireRole("driver"),
    driverController._getMyAssignedOrder
);

router.patch(
    "/me/order/:orderId/picked-up",
    protect,
    requireRole("driver"),
    driverController._pickUpAssignedOrder
);

router.patch(
    "/me/order/:orderId/on-the-way",
    protect,
    requireRole("driver"),
    driverController._onTheWayPickedUpOrder
);

router.patch(
    "/me/order/:orderId/delivered",
    protect,
    requireRole("driver"),
    driverController._deliverOnTheWayOrder
);

// fetch available drivers
router.get(
    "/is-available",
    driverController._getDrivers
);

// update driver state
router.patch(
    "/is-available",
    protect,
    requireRole("driver"),
    driverController._updateDriverIsAvailable
);

router.patch(
    "/me/location",
    protect,
    requireRole("driver"),
    driverController._updateDriverLocation
);

export default router;
