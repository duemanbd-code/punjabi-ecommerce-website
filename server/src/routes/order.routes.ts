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

const router = express.Router();

// ===== ORDER ROUTES =====
router.post('/', createOrder); // Create new order
router.get('/', getOrders); // Get all orders
router.get('/stats', getOrderStats); // Get order statistics
router.get('/:id', getOrder); // Get single order by ID
router.put('/:id/status', updateOrderStatus); // Update order status
router.put('/:id/payment', updatePaymentStatus); // Update payment status
router.delete('/:id', deleteOrder); // Delete order

export default router;
