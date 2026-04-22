import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import * as restaurantController from "../controllers/restaurant.controllers.js"
import { requireRole } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.get(
    "/",
    protect,
    restaurantController._listRestaurants
);

router.get(
    "/me",
    protect,
    requireRole("restaurant_manager"),
    restaurantController._getMyRestaurant
);

router.post(
    "/",
    protect,
    requireRole("restaurant_manager"),
    upload.single("image"),
    restaurantController._createRestaurant
);

router.patch(
    "/:id",
    protect,
    requireRole("restaurant_manager"),
    upload.single("image"),
    restaurantController._updateRestaurant
);

router.patch(
    "/:id/is-open",
    protect,
    requireRole("restaurant_manager"),
    restaurantController._updateRestaurantIsOpen
);

// public route, all menuItems, by restaurentId
router.get(
    "/:id/menu",
    protect,
    restaurantController._getRestaurantWithMenu
);

export default router;
