import logger from "../utils/logger.js";

// centralized error handler — must be registered after all routes
// express identifies this as an error handler by the 4-arg signature
const errorHandler = (err, req, res, _next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let status = err.status || "error";

    // mongoose bad ObjectId
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 400;
        message = "Resource not found — invalid ID format";
        status = "fail";
    }

    // mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(", ");
        statusCode = 409;
        message = `Duplicate value for field: ${field}`;
        status = "fail";
    }

    // mongoose validation error
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        statusCode = 400;
        message = messages.join(". ");
        status = "fail";
    }

    // JWT errors
    if (err.name === "JsonWebTokenError") {
        statusCode = 401;
        message = "Invalid authentication token";
        status = "fail";
    }

    if (err.name === "TokenExpiredError") {
        statusCode = 401;
        message = "Authentication token has expired";
        status = "fail";
    }

    if (statusCode >= 500) {
        logger.error(`${statusCode} ${message}`, {
            path: req.originalUrl,
            method: req.method,
            stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
        });
    } else {
        logger.warn(`${statusCode} ${message}`, {
            path: req.originalUrl,
            method: req.method,
        });
    }

    const response = {
        status,
        message,
        ...(process.env.NODE_ENV === "development" && {
            stack: err.stack,
            error: err,
        }),
    };

    res.status(statusCode).json(response);
};

export default errorHandler;
