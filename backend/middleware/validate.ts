import { validationResult } from "express-validator";

// checks express-validator results and returns field-level errors on failure
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
