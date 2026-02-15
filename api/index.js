import app from '../backend/server.js';
import mongoose from 'mongoose';

export default async function handler(req, res) {
    try {
        // If not connected, connect to MongoDB
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect(process.env.MONGO_URI);
            console.log("MongoDB connected in Vercel function");
        }
    } catch (error) {
        console.error("MongoDB connection error:", error);
        return res.status(500).json({ error: "Failed to connect to database" });
    }

    // Pass request to Express app
    return app(req, res);
}
