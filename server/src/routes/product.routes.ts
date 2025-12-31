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
import { authenticateAdmin } from "../middleware/adminAuth";
import { uploadProductImages } from "../middleware/upload";

const router = express.Router();

// ===== ADMIN-ONLY PRODUCT ROUTES (require authentication) =====
router.post("/", authenticateAdmin, uploadProductImages, createProduct);
router.put("/:id", authenticateAdmin, uploadProductImages, updateProduct);
router.patch("/:id", authenticateAdmin, uploadProductImages, updateProduct);
router.delete("/:id", authenticateAdmin, deleteProduct);

// ===== PUBLIC PRODUCT ROUTES (no authentication required) =====
router.get("/", getAllProducts);
router.get("/category/:slug", getProductsByCategory);
router.get("/:id", getProductById);

// ===== INVENTORY MANAGEMENT ROUTES (Admin only) =====
router.get("/inventory/report", authenticateAdmin, getInventoryReport);
router.get("/inventory/summary", authenticateAdmin, getInventorySummary);
router.get("/inventory/low-stock-alerts", authenticateAdmin, getLowStockAlerts);
router.post("/:id/stock/update", authenticateAdmin, updateProductStock);
router.post("/stock/reserve", authenticateAdmin, reserveProductStock);

// ===== DEBUG/TEST ROUTE =====
router.get("/test/auth", authenticateAdmin, (req: any, res) => {
  res.json({
    success: true,
    message: "Authentication working",
    admin: {
      id: req.admin._id,
      email: req.admin.email,
      name: req.admin.name
    }
  });
});

export default router;