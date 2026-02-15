import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// verifies JWT from Authorization header and attaches user to req
// expects header format: "Authorization: Bearer <token>"
const protect = asyncHandler(async (req, res, next) => {
  // skip for preflight requests (CORS) as they don't carry auth headers
  if (req.method === "OPTIONS") return next();

  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized — no token provided", 401);
  }

  // verify token signature and expiry
  // throws JsonWebTokenError or TokenExpiredError if invalid (caught by asyncHandler)
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  // check if user still exists (passed basic auth but might have been deleted)
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError("User belonging to this token no longer exists", 401);
  }

  // attach user to request object for use in next middleware/controllers
  req.user = user;
  next();
});

// restricts a route to specific roles — use after protect()
// example: router.delete('/', protect, authorize('admin'), deleteProduct)
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Role "${req.user.role}" is not authorized to access this resource`,
        403
      );
    }
    next();
  };
};

export { protect, authorize };