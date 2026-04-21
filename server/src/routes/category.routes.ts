import { Router } from "express";
import * as categoryController from "../controllers/category.controllers.js"

const router = Router();

router.post("/", categoryController._createCategory);
router.get("/", categoryController._getAllCategories);
router.patch("/:id", categoryController._updateCategory);
router.delete("/:id", categoryController._deleteCategory);

export default router;
