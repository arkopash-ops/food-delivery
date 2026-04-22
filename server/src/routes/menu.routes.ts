import { Router } from "express";
import * as menuController from "../controllers/menu.controller.js"
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post(
    "/",
    protect,
    requireRole("restaurant_manager"),
    upload.single("image"),
    menuController._createMenuItem
);

router.patch(
    "/:id",
    protect,
    requireRole("restaurant_manager"),
    upload.single("image"),
    menuController._updateMenuItem);

router.get(
    "/my",
    protect,
    requireRole("restaurant_manager"),
    menuController._listMenuItemsForManager);

export default router;
