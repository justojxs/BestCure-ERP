import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { createProductRules, updateProductRules } from "../validators/productValidator.js";
import validate from "../middleware/validate.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getProducts)
  .post(protect, authorize("admin", "staff"), createProductRules, validate, createProduct);

router
  .route("/:id")
  .get(protect, getProductById)
  .put(protect, authorize("admin", "staff"), updateProductRules, validate, updateProduct)
  .delete(protect, authorize("admin"), deleteProduct);

export default router;