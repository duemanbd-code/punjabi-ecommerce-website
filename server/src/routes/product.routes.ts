// server/src/routes/product.routes.ts

import express from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductsByCategory,
  getProductById,
  
  // INVENTORY CONTROLLERS
  getInventoryReport,
  updateProductStock,
  getLowStockAlerts,
  reserveProductStock,
  getInventorySummary
} from "../controllers/product.controller";
import { authenticateToken, authorizeAdmin } from "../middleware/auth.middleware";
import { uploadProductImages } from "../middleware/upload";

const router = express.Router();

// ===== ADMIN-ONLY PRODUCT ROUTES (require authentication and admin role) =====
router.post("/", authenticateToken, authorizeAdmin, uploadProductImages, createProduct);
router.put("/:id", authenticateToken, authorizeAdmin, uploadProductImages, updateProduct);
router.patch("/:id", authenticateToken, authorizeAdmin, uploadProductImages, updateProduct);
router.delete("/:id", authenticateToken, authorizeAdmin, deleteProduct);

// ===== PUBLIC PRODUCT ROUTES (no authentication required) =====
router.get("/", getAllProducts);
router.get("/category/:slug", getProductsByCategory);
router.get("/:id", getProductById);

// ===== INVENTORY MANAGEMENT ROUTES (Admin only) =====
router.get("/inventory/report", authenticateToken, authorizeAdmin, getInventoryReport);
router.get("/inventory/summary", authenticateToken, authorizeAdmin, getInventorySummary);
router.get("/inventory/low-stock-alerts", authenticateToken, authorizeAdmin, getLowStockAlerts);
router.post("/:id/stock/update", authenticateToken, authorizeAdmin, updateProductStock);
router.post("/stock/reserve", authenticateToken, authorizeAdmin, reserveProductStock);

// ===== DEBUG/TEST ROUTE =====
router.get("/test/auth", authenticateToken, authorizeAdmin, (req: any, res) => {
  res.json({
    success: true,
    message: "Authentication working",
    admin: {
      id: req.user?.id,
      email: req.user?.email,
      name: req.user?.name,
      role: req.user?.role
    }
  });
});

export default router;