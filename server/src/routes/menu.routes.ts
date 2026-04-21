import { Router } from "express";
import * as menuController from "../controllers/menu.controller.js"
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.post(
    "/",
    protect,
    requireRole("restaurant_manager"),
    menuController._createMenuItem
);

router.patch(
    "/:id",
    protect,
    requireRole("restaurant_manager"),
    menuController._updateMenuItem);

router.get(
    "/my",
    protect,
    requireRole("restaurant_manager"),
    menuController._listMenuItemsForManager);

export default router;
