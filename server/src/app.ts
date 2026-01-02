// server/src/app.ts

import express from "express";
import cors from "cors";
import path from "path";

import adminRoutes from "./routes/admin.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:4000",
  "https://puti-clientadmin-gq99cp9ey-mironhesan-team.vercel.app",
  "https://taskin-panjabiclient-5vaszgend-mironhesan-team.vercel.app",
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) callback(null, true);
      else callback(new Error("CORS not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);

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
