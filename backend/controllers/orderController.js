import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";
import logger from "../utils/logger.js";

// generates order number like ORD-202602-0001 (auto-increments per month)
const generateOrderNumber = async () => {
    const date = new Date();
    const prefix = `ORD-${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;

    const lastOrder = await Order.findOne({
        orderNumber: { $regex: `^${prefix}` },
    }).sort({ orderNumber: -1 });

    let nextNum = 1;
    if (lastOrder) {
        const lastNum = parseInt(lastOrder.orderNumber.split("-").pop(), 10);
        nextNum = lastNum + 1;
    }

    return `${prefix}-${String(nextNum).padStart(4, "0")}`;
};

// POST /api/orders — customer places an order
// uses a mongo transaction so stock deduction is atomic
const createOrder = asyncHandler(async (req, res) => {
    const { items } = req.body;

    if (!items || items.length === 0) {
        throw new AppError("Order must contain at least one item", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const orderItems = [];

        for (const item of items) {
            const product = await Product.findById(item.product).session(session);

            if (!product) {
                throw new AppError(`Product not found: ${item.product}`, 404);
            }

            if (product.stock < item.quantity) {
                throw new AppError(
                    `Insufficient stock for "${product.name}". Available: ${product.stock}, Requested: ${item.quantity}`,
                    400
                );
            }

            orderItems.push({
                product: product._id,
                name: product.name,
                batch: product.batch,
                price: product.price,
                quantity: item.quantity,
            });
        }

        const subtotal = orderItems.reduce((acc, i) => acc + i.price * i.quantity, 0);
        const tax = Math.round(subtotal * 0.18 * 100) / 100; // 18% GST
        const total = Math.round((subtotal + tax) * 100) / 100;
        const orderNumber = await generateOrderNumber();

        const [order] = await Order.create(
            [
                {
                    orderNumber,
                    customer: req.user._id,
                    customerName: req.user.name,
                    items: orderItems,
                    subtotal: Math.round(subtotal * 100) / 100,
                    tax,
                    total,
                    status: "pending",
                },
            ],
            { session }
        );

        // deduct stock — the $gte guard prevents going negative even under concurrency
        for (const item of orderItems) {
            const result = await Product.findOneAndUpdate(
                { _id: item.product, stock: { $gte: item.quantity } },
                { $inc: { stock: -item.quantity } },
                { session, returnDocument: 'after' }
            );

            if (!result) {
                throw new AppError(`Stock changed during order processing for "${item.name}"`, 409);
            }
        }

        await session.commitTransaction();

        logger.info("Order created", { orderNumber, customer: req.user.name, total });

        res.status(201).json(order);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

// GET /api/orders — customers only see their own, admin/staff see all
const getOrders = asyncHandler(async (req, res) => {
    const { status, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (req.user.role === "customer") {
        filter.customer = req.user._id;
    }

    if (status && ["pending", "accepted", "rejected"].includes(status)) {
        filter.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
        Order.find(filter)
            .populate("customer", "name email")
            .populate("acceptedBy", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit)),
        Order.countDocuments(filter),
    ]);

    res.json({
        orders,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / parseInt(limit)),
        },
    });
});

// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate("customer", "name email")
        .populate("acceptedBy", "name");

    if (!order) {
        throw new AppError("Order not found", 404);
    }

    // customers can only view their own orders
    if (
        req.user.role === "customer" &&
        order.customer._id.toString() !== req.user._id.toString()
    ) {
        throw new AppError("Not authorized to view this order", 403);
    }

    res.json(order);
});

// PUT /api/orders/:id/status — accept or reject a pending order
// rejecting restores stock via transaction
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, statusNote } = req.body;

    if (!["accepted", "rejected"].includes(status)) {
        throw new AppError("Status must be 'accepted' or 'rejected'", 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const order = await Order.findById(req.params.id).session(session);

        if (!order) {
            throw new AppError("Order not found", 404);
        }

        if (order.status !== "pending") {
            throw new AppError("Order has already been processed", 400);
        }

        // rejecting an order restores the reserved stock
        if (status === "rejected") {
            for (const item of order.items) {
                await Product.findByIdAndUpdate(
                    item.product,
                    { $inc: { stock: item.quantity } },
                    { session }
                );
            }
        }

        order.status = status;
        order.statusNote = statusNote || "";
        order.acceptedBy = req.user._id;
        await order.save({ session });

        await session.commitTransaction();

        const updated = await Order.findById(order._id)
            .populate("customer", "name email")
            .populate("acceptedBy", "name");

        logger.info(`Order ${order.orderNumber} ${status}`, {
            by: req.user.name,
        });

        res.json(updated);
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
});

export { createOrder, getOrders, getOrderById, updateOrderStatus };
