import { Response } from "express";
import generateToken from "../utils/generateToken.js";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

// POST /api/auth/signup
const signup = asyncHandler(async (req: any, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new AppError("Please provide name, email and password", 400);
  }

  const userExists = await User.findOne({ email });

  if (userExists) {
    throw new AppError("User already exists", 400);
  }

  // Hash password before saving
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

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
const login = asyncHandler(async (req: any, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await (user as any).matchPassword(password))) {
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