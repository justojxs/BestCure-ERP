// wraps async route handlers so rejected promises get forwarded
// to the error handler — no try/catch needed in controllers
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
