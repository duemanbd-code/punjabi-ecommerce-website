// server/src/server.ts

import dotenv from "dotenv";
import path from "path";

// Load .env from server/.env
const envPath = path.resolve(__dirname, "..", ".env");
dotenv.config({ path: envPath });

// Debug log
console.log("Environment loaded from:", envPath);
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "✓ Set" : "✗ Not set");

import app from "./app";
import { connectDB } from "./config/db";

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});