import Product from "../models/Product.js";
import AppError from "../utils/AppError.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * @desc    Get all products with optional filtering
 * @route   GET /api/products?category=Antibiotics&search=amox&lowStock=true
 * @access  Private
 */
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, lowStock, sortBy = "name", order = "asc" } = req.query;

  const filter = {};

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (lowStock === "true") {
    filter.$expr = { $lt: ["$stock", "$minStock"] };
  }

  const sortOrder = order === "desc" ? -1 : 1;
  const sortOptions = { [sortBy]: sortOrder };

  const products = await Product.find(filter).sort(sortOptions);
  res.json(products);
});

/**
 * @desc    Get single product by ID
 * @route   GET /api/products/:id
 * @access  Private
 */
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  res.json(product);
});

/**
 * @desc    Create a new product
 * @route   POST /api/products
 * @access  Private (admin, staff)
 */
const createProduct = asyncHandler(async (req, res) => {
  // Only allow whitelisted fields
  const { name, batch, supplier, stock, minStock, price, expiry, category } = req.body;

  const product = await Product.create({
    name,
    batch,
    supplier,
    stock,
    minStock,
    price,
    expiry,
    category,
  });

  res.status(201).json(product);
});

/**
 * @desc    Update a product
 * @route   PUT /api/products/:id
 * @access  Private (admin, staff)
 */
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  // Whitelist allowed updates
  const allowedFields = ["name", "batch", "supplier", "stock", "minStock", "price", "expiry", "category"];
  const updates = {};

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  }

  const updatedProduct = await Product.findByIdAndUpdate(
    req.params.id,
    { $set: updates },
    { returnDocument: 'after', runValidators: true }
  );

  res.json(updatedProduct);
});

/**
 * @desc    Delete a product
 * @route   DELETE /api/products/:id
 * @access  Private (admin)
 */
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  await product.deleteOne();
  res.json({ message: "Product removed", id: req.params.id });
});

export { getProducts, getProductById, createProduct, updateProduct, deleteProduct };