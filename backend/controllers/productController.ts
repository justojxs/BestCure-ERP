import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

// GET /api/products — supports search, category filter, low stock filter
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, lowStock, expiring } = req.query;
  const filter = {};

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { batch: { $regex: search, $options: "i" } },
      { supplier: { $regex: search, $options: "i" } },
    ];
  }

  if (category) filter.category = category;

  if (lowStock === "true") {
    filter.$expr = { $lte: ["$stock", "$minStock"] };
  }

  if (expiring === "true") {
    const thirtyDays = new Date();
    thirtyDays.setDate(thirtyDays.getDate() + 30);
    filter.expiry = { $lte: thirtyDays };
  }

  const products = await Product.find(filter).sort({ createdAt: -1 });
  res.json(products);
});

// GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError("Product not found", 404);
  res.json(product);
});

// POST /api/products
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

// PUT /api/products/:id — only updates allowed fields
const updateProduct = asyncHandler(async (req, res) => {
  const allowed = [
    "name", "batch", "supplier", "stock", "minStock",
    "price", "expiry", "category",
  ];

  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { returnDocument: 'after', runValidators: true }
  );

  if (!updatedProduct) throw new AppError("Product not found", 404);

  res.json(updatedProduct);
});

// DELETE /api/products/:id
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new AppError("Product not found", 404);
  res.json({ message: "Product removed" });
});

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };