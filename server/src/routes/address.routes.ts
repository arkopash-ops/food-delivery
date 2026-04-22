import { Router } from "express";
import * as addressController from "../controllers/address.controller.js";

const router = Router();

router.post("/", addressController._createAddress);

export default router;
