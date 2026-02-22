import { Response } from "express";
import User from "../models/User.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import bcrypt from "bcryptjs";

// GET /api/users/staff
export const getStaff = asyncHandler(async (req: any, res: Response) => {
    const staff = await User.find({ role: "staff" }).select("-password");
    res.json(staff);
});

// POST /api/users/staff
export const createStaff = asyncHandler(async (req: any, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        throw new AppError("Please provide name, email and password", 400);
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new AppError("User already exists", 400);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const staff = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "staff"
    });

    if (staff) {
        res.status(201).json({
            _id: staff._id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
        });
    } else {
        throw new AppError("Invalid user data", 400);
    }
});

// DELETE /api/users/staff/:id
export const deleteStaff = asyncHandler(async (req: any, res: Response) => {
    const staff = await User.findById(req.params.id);

    if (!staff) {
        throw new AppError("Staff not found", 404);
    }

    if (staff.email === 'ojas@bestcure.com') {
        throw new AppError("Cannot delete demo staff account", 403);
    }

    if (staff.role !== 'staff') {
        throw new AppError("Can only delete staff users from this endpoint", 400);
    }

    await User.deleteOne({ _id: staff._id });

    res.json({ message: "Staff removed" });
});
