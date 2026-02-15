import logger from "../utils/logger.js";

/**
 * Centralized error handling middleware.
 * Must be registered AFTER all routes. Express identifies error middleware
 * by the (err, req, res, next) 4-argument signature.
 */
const errorHandler = (err, req, res, _next) => {
    // Defaults
    let statusCode = err.statusCode || 500;
    let message = err.message || "Internal Server Error";
    let status = err.status || "error";

    // Mongoose bad ObjectId
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 400;
        message = "Resource not found — invalid ID format";
        status = "fail";
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue).join(", ");
        statusCode = 409;
        message = `Duplicate value for field: ${field}`;
        status = "fail";
    }

    // Mongoose validation error
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

    // Log the error
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

    // Send response
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
