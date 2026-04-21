import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/me", protect, (req, res) => {
    return res.json({ user: req.user });
});

export default router;
