import jwt from "jsonwebtoken";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * Protect routes — verify JWT token and attach user to request.
 * Token is expected in: Authorization: Bearer <token>
 */
const protect = asyncHandler(async (req, res, next) => {
  // Skip preflight requests
  if (req.method === "OPTIONS") return next();

  let token;

  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    throw new AppError("Not authorized — no token provided", 401);
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError("User belonging to this token no longer exists", 401);
  }

  req.user = user;
  next();
});

/**
 * Restrict access to specific roles.
 * Must be used AFTER the protect middleware.
 *
 * @param  {...string} roles - Allowed roles (e.g., "admin", "staff")
 * @returns {Function} Express middleware
 */
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