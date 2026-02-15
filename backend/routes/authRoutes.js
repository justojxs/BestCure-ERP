import express from "express";
import { loginUser, getMe } from "../controllers/authController.js";
import { loginRules } from "../validators/authValidator.js";
import validate from "../middleware/validate.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginRules, validate, loginUser);
router.get("/me", protect, getMe);

export default router;