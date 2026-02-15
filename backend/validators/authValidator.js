import { body } from "express-validator";

export const loginRules = [
    body("email")
        .trim()
        .isEmail()
        .normalizeEmail()
        .withMessage("Please provide a valid email address"),

    body("password")
        .notEmpty()
        .withMessage("Password is required")
        .isLength({ min: 4 })
        .withMessage("Password must be at least 4 characters"),
];
