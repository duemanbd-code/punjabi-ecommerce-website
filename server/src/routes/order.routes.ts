// server/src/routes/order.routes.ts

import express from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  deleteOrder,
  getOrderStats,
} from '../controllers/order.controller';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// ===== PUBLIC ROUTES (no auth - for customers placing orders) =====
router.post('/', createOrder);

// ===== ADMIN ONLY ROUTES (with authentication) =====
router.get('/', authenticateToken, authorizeAdmin, getOrders);
router.get('/stats', authenticateToken, authorizeAdmin, getOrderStats);
router.get('/:id', authenticateToken, authorizeAdmin, getOrder);
router.put('/:id/status', authenticateToken, authorizeAdmin, updateOrderStatus);
router.put('/:id/payment', authenticateToken, authorizeAdmin, updatePaymentStatus);
router.delete('/:id', authenticateToken, authorizeAdmin, deleteOrder);

export default router;