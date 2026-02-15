import { body } from "express-validator";

export const createOrderRules = [
    body("items")
        .isArray({ min: 1 })
        .withMessage("Order must contain at least one item"),

    body("items.*.product")
        .notEmpty()
        .withMessage("Each item must reference a product ID")
        .isMongoId()
        .withMessage("Invalid product ID format"),

    body("items.*.quantity")
        .isInt({ min: 1 })
        .withMessage("Quantity must be a positive integer"),
];

export const updateOrderStatusRules = [
    body("status")
        .isIn(["accepted", "rejected"])
        .withMessage("Status must be 'accepted' or 'rejected'"),

    body("statusNote")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Status note cannot exceed 500 characters"),
];
