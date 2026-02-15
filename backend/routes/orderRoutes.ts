import express from "express";
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus,
} from "../controllers/orderController.js";
import { createOrderRules, updateOrderStatusRules } from "../validators/orderValidator.js";
import validate from "../middleware/validate.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router
    .route("/")
    .get(protect, getOrders)
    .post(protect, authorize("customer", "admin", "staff"), createOrderRules, validate, createOrder);

router.route("/:id").get(protect, getOrderById);

router
    .route("/:id/status")
    .put(protect, authorize("admin", "staff"), updateOrderStatusRules, validate, updateOrderStatus);

export default router;
