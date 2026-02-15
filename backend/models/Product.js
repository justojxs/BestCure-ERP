import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },
    batch: {
      type: String,
      required: [true, "Batch number is required"],
      trim: true,
      index: true,
    },
    supplier: {
      type: String,
      required: [true, "Supplier is required"],
      trim: true,
      index: true,
    },
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },
    minStock: {
      type: Number,
      required: true,
      default: 10,
      min: [0, "Minimum stock cannot be negative"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    expiry: {
      type: Date,
      required: [true, "Expiry date is required"],
      index: true,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for common queries
productSchema.index({ stock: 1, minStock: 1 });
productSchema.index({ name: "text", category: "text" });

// Virtual: is this product low on stock?
productSchema.virtual("isLowStock").get(function () {
  return this.stock < this.minStock;
});

// Virtual: is this product expired?
productSchema.virtual("isExpired").get(function () {
  return this.expiry < new Date();
});

const Product = mongoose.model("Product", productSchema);

export default Product;