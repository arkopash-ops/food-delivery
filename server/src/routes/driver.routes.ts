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

export default router;
