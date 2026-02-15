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

// security headers using helmet
// in production, we need a stricter content security policy (CSP)
// but in dev, we disable it to allow inline scripts/styles from tools
app.use(
  helmet({
    contentSecurityPolicy: isProduction ? undefined : false,
    crossOriginEmbedderPolicy: false,
  })
);

// rate limiting — stricter on auth to prevent brute force attacks
// generic limit: 1000 requests per 15 min for dev, 100 for prod (per IP)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 100 : 1000,
  standardHeaders: true, // return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // disable the `X-RateLimit-*` headers
  message: { status: "fail", message: "Too many requests, please try again later" },
});

// auth limit: restrict login attempts to prevent password guessing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isProduction ? 10 : 100,
  message: { status: "fail", message: "Too many login attempts, please try again later" },
});

app.use("/api/", limiter);
app.use("/api/auth/", authLimiter);

// cors configuration
// in production, we'll want to restrict origin, but for now we allow all
// credentials: true is required for passing cookies/headers if we ever switch to cookie-based auth
app.use(
  cors({
    origin: isProduction ? false : true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// limit body size to 10kb to prevent DoS attacks via large payloads
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(compression());

// request logging (skip in tests / skip health checks to keep logs clean)
if (!isTest) {
  app.use(
    morgan(isProduction ? "combined" : "dev", {
      skip: (req) => req.url === "/api/health",
    })
  );
}

// simple health check endpoint for load balancers or uptime monitors
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/orders", orderRoutes);

// serve built frontend static files in production
// this allows us to run the entire stack on a single port (5001)
if (isProduction) {
  const distPath = path.resolve(__dirname, "..", "dist");
  app.use(express.static(distPath));

  // any route not handled by the api should be passed to the react app
  // this enables client-side routing (SPA)
  app.get("/*path", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

// 404 catch-all for undefined api routes
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server`, 404));
});

app.use(errorHandler);

// connect to mongo and start listening
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

    // graceful shutdown handles SIGTERM (docker stop) and SIGINT (ctrl+c)
    // we close the server first to stop accepting new requests, then close the db connection
    const shutdown = (signal) => {
      logger.info(`${signal} received. Shutting down gracefully...`);
      server.close(async () => {
        await mongoose.connection.close();
        logger.info("MongoDB connection closed");
        process.exit(0);
      });

      // force exit if still hanging after 10s
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

// tests import `app` directly, so only start the server when running normally
if (!isTest && !process.env.VERCEL) {
  startServer();
}

export default app;