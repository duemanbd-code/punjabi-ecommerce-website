// server/src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production';

// Extend Express Request type to include user and admin
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        name: string;
      };
      admin?: {
        _id: string;
        email: string;
        role: string;
        name: string;
      };
    }
  }
}

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  name: string;
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  console.log('🔐 Auth - Token present:', !!token);

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      console.log('❌ Auth - Token verification failed:', err.message);
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    console.log('✅ Auth - Token verified for user:', (user as JwtPayload)?.email);
    req.user = user as JwtPayload;
    req.admin = user as any; // For backward compatibility with product controller
    next();
  });
};

export const authorizeAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== 'admin') {
    console.log('❌ Auth - Admin authorization failed. Role:', req.user?.role);
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  console.log('✅ Auth - Admin authorized:', req.user?.email);
  next();
};