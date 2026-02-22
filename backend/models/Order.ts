import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: [true, "Product reference is required"],
        },
        name: { type: String, required: true },
        batch: { type: String },
        price: {
            type: Number,
            required: true,
            min: [0, "Price cannot be negative"],
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "Quantity must be at least 1"],
        },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        orderNumber: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: [true, "Customer is required"],
            index: true,
        },
        customerName: {
            type: String,
            required: true,
        },
        customerEmail: {
            type: String,
        },
        items: {
            type: [orderItemSchema],
            validate: {
                validator: (v: any) => Array.isArray(v) && v.length > 0,
                message: "Order must contain at least one item",
            },
        },
        subtotal: {
            type: Number,
            required: true,
            min: [0, "Subtotal cannot be negative"],
        },
        tax: {
            type: Number,
            required: true,
            min: [0, "Tax cannot be negative"],
        },
        total: {
            type: Number,
            required: true,
            min: [0, "Total cannot be negative"],
        },
        status: {
            type: String,
            enum: {
                values: ["pending", "accepted", "rejected"],
                message: "Status must be pending, accepted, or rejected",
            },
            default: "pending",
            index: true,
        },
        statusNote: {
            type: String,
            default: "",
            maxlength: [500, "Status note cannot exceed 500 characters"],
        },
        acceptedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    {
        timestamps: true,
        toJSON: {
            transform(_, ret) {
                delete (ret as any).__v;
                return ret;
            },
        },
    }
);

// Compound indexes for analytics queries
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ customer: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;
