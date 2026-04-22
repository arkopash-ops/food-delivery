import { Router } from "express";
import * as addressController from "../controllers/address.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";

const router = Router();

router.get(
    "/",
    protect,
    requireRole("customer"),
    addressController._showAddress
);

router.post(
    "/",
    protect,
    requireRole("customer"),
    addressController._createAddress
);

router.patch(
    "/:id",
    protect,
    requireRole("customer"),
    addressController._updateAddress
);

router.delete(
    "/:id",
    protect,
    requireRole("customer"),
    addressController._deleteAddress
);

export default router;
