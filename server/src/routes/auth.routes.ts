// server/src/routes/auth.routes.ts

// server/src/routes/auth.routes.ts
import express, { Request, Response } from 'express';
import {
  login,
  register,
  getCurrentUser,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser
} from '../controllers/auth.controller';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/login', login);
router.post('/register', register);

// Protected routes (require authentication)
router.get('/me', authenticateToken, getCurrentUser);
router.get('/protected-data', authenticateToken, (req: Request, res: Response) => {
  res.json({ 
    message: `Hello ${req.user?.name}, this is protected data accessible by all logged-in users.` 
  });
});

// Admin only routes - THESE WILL BE USED BY ADMIN PANEL
router.get('/admin/users', authenticateToken, authorizeAdmin, getAllUsers);
router.get('/admin/users/:userId', authenticateToken, authorizeAdmin, getUserById);
router.put('/admin/users/:userId/role', authenticateToken, authorizeAdmin, updateUserRole);
router.delete('/admin/users/:userId', authenticateToken, authorizeAdmin, deleteUser);
router.get('/admin/data', authenticateToken, authorizeAdmin, (req: Request, res: Response) => {
  res.json({ 
    message: `Welcome Admin ${req.user?.name}. Here is the sensitive admin data.`,
    timestamp: new Date().toISOString()
  });
});

export default router;