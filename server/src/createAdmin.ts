// server/src/createAdmin.ts

import mongoose from "mongoose";
import dotenv from "dotenv";
import Admin from "./models/admin.model";

dotenv.config();

const MONGO_URI = process.env.MONGODB_URI!;

mongoose.connect(MONGO_URI).then(async () => {
  await Admin.deleteMany({ email: "admin@gmail.com" });

  const admin = new Admin({
    name: "Super Admin",
    email: "admin@gmail.com",
    password: "admin123",
  });

  await admin.save();
  console.log("✅ Admin seeded successfully");
  process.exit(0);
});
