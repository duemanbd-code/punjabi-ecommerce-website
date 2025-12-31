// server/src/app.ts

import express from "express";
import cors from "cors";

import adminRoutes from "./routes/admin.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";
import path from "path";

const app = express();

const allowedOrigins = [
  "http://localhost:3000", // client local
  "http://localhost:4000", // admin local
  process.env.CLIENT_URL, // client vercel
  process.env.ADMIN_URL,  // admin vercel
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow server-to-server & Postman (no origin)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  })
);


app.use(express.json());

app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

export default app;
