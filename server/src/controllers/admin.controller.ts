// server/src/controller/admin.controller.ts

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production';

// Update admin profile and password
export const updateAdminProfile = async (req: Request, res: Response) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const adminId = req.user?.id;

    // Find admin user
    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    // Verify admin role
    if (admin.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update name and email
    if (name) admin.name = name;
    if (email) admin.email = email;

    // If changing password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required' });
      }

      const isValidPassword = await admin.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: 'New password must be at least 6 characters' });
      }

      // Update password
      admin.password = newPassword;
    }

    await admin.save();

    // Generate new token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    // Return updated admin without password
    const { password: _, ...adminWithoutPassword } = admin.toObject();

    res.json({
      message: 'Profile updated successfully',
      token,
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get admin profile
export const getAdminProfile = async (req: Request, res: Response) => {
  try {
    const adminId = req.user?.id;

    const admin = await User.findById(adminId).select('-password');
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.json({ admin });
  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};