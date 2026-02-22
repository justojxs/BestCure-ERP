import express from "express";
import { getStaff, createStaff, deleteStaff } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Only admin can manage staff
router.use(protect, authorize('admin'));

router.route("/staff")
    .get(getStaff)
    .post(createStaff);

router.route("/staff/:id")
    .delete(deleteStaff);

export default router;
