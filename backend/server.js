import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import errorHandler from "./middleware/errorHandler.js";
import AppError from "./utils/AppError.js";
import logger from "./utils/logger.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const isProduction = process.env.NODE_ENV === "production";
const isTest = process.env.NODE_ENV === "test";

// ─── Security Middleware ───
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// ─── Rate Limiting ───
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // limit per IP per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: "fail", message: "Too many requests, please try again later" },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 10 : 100, // Stricter limit on auth endpoints
  message: { status: "fail", message: "Too many login attempts, please try again later" },
});

app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

// ─── CORS ───
app.use(
  cors({
    origin: isProduction ? false : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ─── Body Parsing ───
app.use(express.json({ limit: "10kb" })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

// ─── Compression ───
app.use(compression());

// ─── Request Logging ───
if (!isTest) {
  app.use(
    morgan(isProduction ? "combined" : "dev", {
      skip: (req) => req.url === "/api/health",
    })
  );
}

// ─── Health Check ───
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ─── API Routes ───
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", orderRoutes);

// ─── Production: Serve Frontend ───
if (isProduction) {
  const distPath = path.resolve(__dirname, "..", "dist");
  app.use(express.static(distPath));

  app.get("/*path", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// ─── 404 Handler ───
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

// ─── Centralized Error Handler ───
app.use(errorHandler);

// ─── Database Connection & Server Start ───
const startServer = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/bestcure_erp";

    await mongoose.connect(mongoUri);
    logger.info("MongoDB connected successfully");

    const PORT = process.env.PORT || 5001;

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
    });

    // Graceful shutdown
    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
        process.exit(0);
      });

      // Force exit after 10s
      setTimeout(() => {
        logger.error("Forced shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
};

// Only start server if not in test mode (tests will import `app` directly)
if (!isTest) {
  startServer();
}

export default app;