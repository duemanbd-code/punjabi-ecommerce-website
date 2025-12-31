// server/src/config/db.ts

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }
    
    console.log("🔗 Connecting to MongoDB...");
    
    await mongoose.connect(mongoURI);
    
    console.log("✅ MongoDB connected successfully");
    
    // Handle connection events
    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });
    
    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected");
    });
    
  } catch (error: any) {
    console.error("❌ MongoDB connection failed:", error.message);
    console.error("Full error:", error);
    process.exit(1);
  }
};