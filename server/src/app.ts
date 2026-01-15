// server/src/app.ts

import express from "express";
import cors from "cors";
import path from "path";

import adminRoutes from "./routes/admin.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";

const app = express();

// CORRECTED allowed origins (remove double https://)

const front_url= process.env.CLIENT_URL;
const admin_url=process.env.ADMIN_URL;
const server_url= process.env.SERVER_URL;
const live_frontend= process.env.LIVE_ADMIN_URL;
const live_admin= process.env.LIVE_FRONTEND_URL;
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://puti-client-production.onrender.com",
  "https://puti-client-production-admin.vercel.app",
  "https://puti-client-production-t1kq.vercel.app",
 " https://admin.duemanbd.com",
 "https://www.duemanbd.com",
  front_url, admin_url, server_url, live_admin, live_frontend
 // ✅ Fixed: Removed extra https:// and trailing slash
];

// More flexible CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        console.log("Blocked by CORS:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "cache-control"],
  })
);

// Handle preflight requests
app.options("*", cors());

// Parse JSON request bodies
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Serve uploads
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

export default app;