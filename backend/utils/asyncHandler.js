/**
 * Wraps an async Express route handler to automatically catch errors
 * and forward them to the centralized error handler middleware.
 *
 * Eliminates the need for try/catch in every controller function.
 *
 * @param {Function} fn - Async route handler (req, res, next) => Promise
 * @returns {Function} Express middleware
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
