import { validationResult } from "express-validator";

/**
 * Middleware that checks express-validator results.
 * If validation fails, returns a structured 400 error with field-level details.
 * Must be placed AFTER validation chain rules in the route definition.
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const extractedErrors = errors.array().map((err) => ({
            field: err.path,
            message: err.msg,
            value: err.value,
        }));

        return res.status(400).json({
            status: "fail",
            message: "Validation failed",
            errors: extractedErrors,
        });
    }

    next();
};

export default validate;
