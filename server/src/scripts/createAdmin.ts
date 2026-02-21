// server/src/scripts/createAdmin.ts

import mongoose, { Document, Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config(); // loads .env.local or .env.production

// -----------------------------
// Define Admin interface
// -----------------------------
interface IAdmin extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
}

// -----------------------------
// Admin Schema
// -----------------------------
const adminSchema = new Schema<IAdmin>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "admin" },
});

const Admin = model<IAdmin>("Admin", adminSchema);

// -----------------------------
// Connect to MongoDB
// -----------------------------
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
  console.error("❌ MONGODB_URI is not defined in .env");
  process.exit(1);
}

mongoose
  .connect(mongoUri)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// -----------------------------
// Create Admin
// -----------------------------
async function createAdmin() {
  try {
    const existing = await Admin.findOne({ email: "admin@gmail.com" });
    if (existing) {
      console.log("⚠️ Admin already exists");
      process.exit(0);
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    const admin = new Admin({
      name: "Super Admin",
      email: "admin@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    await admin.save();
    console.log("✅ Admin created successfully");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error creating admin:", err);
    process.exit(1);
  }
}

// Run the script
createAdmin();