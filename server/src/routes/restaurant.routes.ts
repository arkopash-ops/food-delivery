import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import * as restaurantController from "../controllers/restaurant.controllers.js"
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.post(
    "/",
    protect,
    requireRole("restaurant_manager"),
    restaurantController._createRestaurant
);

router.patch(
    "/:id",
    protect,
    requireRole("restaurant_manager"),
    restaurantController._updateRestaurant
);

router.patch(
    "/:id/is-open",
    protect,
    requireRole("restaurant_manager"),
    restaurantController._updateRestaurantIsOpen
);

export default router;
