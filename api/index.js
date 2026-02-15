import app from '../backend/server.js';
import mongoose from 'mongoose';

// Disable buffering to fail fast if no connection
mongoose.set('bufferCommands', false);

export default async function handler(req, res) {
    try {
        console.log("Handling request:", req.method, req.url);

        if (mongoose.connection.readyState !== 1) { // Not connected
            console.log("Connecting to MongoDB...", process.env.MONGO_URI ? "URI Present" : "URI Missing");

            if (!process.env.MONGO_URI) {
                throw new Error("MONGO_URI is undefined");
            }

            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000 // Fail fast if no IP access
            });
            console.log("MongoDB connected successfully");
        }

        // Wrap Express app execution
        return app(req, res);

    } catch (error) {
        console.error("Vercel Function Critical Error:", error);
        // Return detailed error to frontend for debugging
        return res.status(500).json({
            error: "Internal Server Error",
            details: error.message,
            stack: process.env.NODE_ENV === "development" ? error.stack : undefined
        });
    }
}
