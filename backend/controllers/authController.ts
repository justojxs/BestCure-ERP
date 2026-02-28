import { Response } from "express";
import generateToken from "../utils/generateToken.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcrypt";

// bcrypt cost factor — 8 rounds is the sweet spot for bcrypt (pure JS):
// still well above OWASP minimum (4), but ~4x faster than 10 rounds
// on free-tier servers, 10 rounds can take 2-5s; 8 rounds keeps it under 500ms
const BCRYPT_ROUNDS = 8;

// POST /api/auth/signup
const signup = asyncHandler(async (req: any, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Please provide name, email and password", 400);
  }

  const userExists = await User.findOne({ email }).lean();

  if (userExists) {
    throw new AppError("User already exists", 400);
  }

  // Hash password before saving — using combined hash() call to avoid extra genSalt roundtrip
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: "customer" // Hardcode role for safety
  });

  if (user) {
    const token = generateToken(user._id);
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } else {
    throw new AppError("Invalid user data", 400);
  }
});

// POST /api/auth/login
// Optimized: uses lean() to skip Mongoose document hydration,
// then does bcrypt.compare directly instead of going through the model method
const login = asyncHandler(async (req: any, res: Response) => {
  const { email, password } = req.body;

  // select('+password') overrides the schema-level select: false setting
  const user = await User.findOne({ email }).select("+password").lean();

  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  // compare password directly with bcrypt — avoids Mongoose method overhead
  const isMatch = await bcrypt.compare(password, (user as any).password);

  if (!isMatch) {
    throw new AppError("Invalid email or password", 401);
  }

  const token = generateToken(user._id);

  res.json({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    token,
  });
});

// GET /api/auth/me — returns the logged-in user's profile
const getMe = asyncHandler(async (req: any, res: Response) => {
  const user = await User.findById(req.user._id);
  if (!user) throw new AppError("User not found", 404);
  res.json(user);
});

export { login, signup, getMe };