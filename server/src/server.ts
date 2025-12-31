// server/src/server.ts

import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// MANUALLY load .env file
const envPath = path.join(__dirname, "..", ".env");
console.log("Looking for .env at:", envPath);

// Check if file exists
if (fs.existsSync(envPath)) {
  console.log("✅ .env file found");
  const result = dotenv.config({ path: envPath });
  if (result.error) {
    console.error("❌ Error loading .env:", result.error);
  } else {
    console.log("✅ .env loaded successfully");
  }
} else {
  console.error("❌ .env file NOT found at:", envPath);
  console.log("Current directory:", __dirname);
  console.log("Files in server directory:", fs.readdirSync(path.join(__dirname, "..")));
}

// MANUAL fallback - read .env directly
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  envLines.forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, ...value] = line.split('=');
      if (key && value.length > 0) {
        process.env[key.trim()] = value.join('=').trim();
      }
    }
  });
  console.log("✅ Manually loaded environment variables");
} catch (error) {
  console.error("❌ Failed to manually load .env:", error);
}

// VERIFY MONGODB_URI
console.log("\n=== ENV VERIFICATION ===");
console.log("MONGODB_URI:", process.env.MONGODB_URI || "UNDEFINED");
console.log("PORT:", process.env.PORT || "UNDEFINED");
console.log("All env vars:", Object.keys(process.env).filter(key => key.includes('MONGODB') || key.includes('PORT')));
console.log("========================\n");

import app from "./app";
import { connectDB } from "./config/db";

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});