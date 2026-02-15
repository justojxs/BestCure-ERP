import { body } from "express-validator";

export const createProductRules = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Product name is required")
        .isLength({ max: 200 })
        .withMessage("Product name cannot exceed 200 characters"),

    body("batch")
        .trim()
        .notEmpty()
        .withMessage("Batch number is required"),

    body("supplier")
        .trim()
        .notEmpty()
        .withMessage("Supplier name is required"),

    body("stock")
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),

    body("minStock")
        .isInt({ min: 0 })
        .withMessage("Minimum stock must be a non-negative integer"),

    body("price")
        .isFloat({ min: 0 })
        .withMessage("Price must be a non-negative number"),

    body("expiry")
        .isISO8601()
        .withMessage("Expiry must be a valid date (ISO 8601)"),

    body("category")
        .trim()
        .notEmpty()
        .withMessage("Category is required"),
];

export const updateProductRules = [
    body("name")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Product name cannot be empty")
        .isLength({ max: 200 })
        .withMessage("Product name cannot exceed 200 characters"),

    body("batch")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Batch number cannot be empty"),

    body("supplier")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Supplier name cannot be empty"),

    body("stock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Stock must be a non-negative integer"),

    body("minStock")
        .optional()
        .isInt({ min: 0 })
        .withMessage("Minimum stock must be a non-negative integer"),

    body("price")
        .optional()
        .isFloat({ min: 0 })
        .withMessage("Price must be a non-negative number"),

    body("expiry")
        .optional()
        .isISO8601()
        .withMessage("Expiry must be a valid date"),

    body("category")
        .optional()
        .trim()
        .notEmpty()
        .withMessage("Category cannot be empty"),
];
