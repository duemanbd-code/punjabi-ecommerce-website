// server/src/config/db.ts

import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    // TEMPORARY: Hardcode your MongoDB URI for testing
    const mongoURI = process.env.MONGODB_URI || "mongodb+srv://mironhesan_db_user:pitimach123@cluster0.uitrnmm.mongodb.net/?appName=Cluster0";
    
    console.log("🔗 Using MongoDB URI:", mongoURI ? "✓" : "✗");
    
    if (!mongoURI) {
      throw new Error("MongoDB URI is undefined. Check .env file");
    }
    
    console.log("Connecting to MongoDB...");
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as mongoose.ConnectOptions);
    
    console.log("✅ MongoDB connected successfully!");
    
  } catch (error: any) {
    console.error("❌ MongoDB connection failed!");
    console.error("Error:", error.message);
    
    // Try alternative connection
    console.log("\nTrying alternative connection...");
    try {
      await mongoose.connect("mongodb://localhost:27017/ecommerce", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      } as mongoose.ConnectOptions);
      console.log("✅ Connected to local MongoDB instead");
    } catch (localError: any) {
      console.error("❌ Local MongoDB also failed:", localError.message);
      process.exit(1);
    }
  }
};