// server/src/createAdmin.ts

import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/admin.model";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI!;

mongoose.connect(MONGO_URI).then(async () => {
  console.log("Mongo connected");

  // Remove old admin
  await Admin.deleteMany({ email: "admin@gmail.com" });

  // Create new admin (plain password)
  const admin = new Admin({
    name: "Super Admin",
    email: "admin@gmail.com", // schema will lowercase
    password: "admin123",     // pre-save hook hashes this
    role: "admin",
  });

  await admin.save();
  console.log("✅ Admin seeded successfully");
  process.exit(0);
});

