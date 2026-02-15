import express from "express";
import { login, getMe } from "../controllers/authController.js";
import { loginRules } from "../validators/authValidator.js";
import validate from "../middleware/validate.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginRules, validate, login);
router.get("/me", protect, getMe);

export default router;