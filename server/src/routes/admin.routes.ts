// server/src/routes/admin.routes.ts

import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';
import { authenticateToken, authorizeAdmin } from '../middleware/auth.middleware';

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production';

// Admin login route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('🔐 Admin login attempt:', email);
    
    const admin = await User.findOne({ email, role: 'admin' });
    if (!admin) {
      console.log('❌ Admin not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isValidPassword = await admin.comparePassword(password);
    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    const { password: _, ...adminWithoutPassword } = admin.toObject();

    console.log('✅ Admin login successful:', admin.email);
    
    res.json({
      message: 'Login successful',
      token,
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error('❌ Admin login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET admin profile - MUST BE BEFORE router.use(authenticateToken)
router.get('/profile', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const adminId = req.user?.id;
    console.log('📝 GET /profile - Admin ID:', adminId);

    if (!adminId) {
      console.log('❌ No admin ID in token');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const admin = await User.findById(adminId).select('-password');
    if (!admin) {
      console.log('❌ Admin not found in database');
      return res.status(404).json({ message: 'Admin not found' });
    }

    console.log('✅ Admin profile found:', admin.email);
    res.json({ admin });
  } catch (error) {
    console.error('❌ Get admin profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT update admin profile
router.put('/profile', authenticateToken, authorizeAdmin, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;
    const adminId = req.user?.id;

    console.log('📝 PUT /profile - Admin ID:', adminId);
    console.log('📝 Update data:', { name, email, hasNewPassword: !!newPassword });

    const admin = await User.findById(adminId);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

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
        return res.status(400).json({ message: 'Password must be at least 6 characters' });
      }

      admin.password = newPassword;
    }

    await admin.save();

    // Generate new token
    const token = jwt.sign(
      { id: admin._id, email: admin.email, role: admin.role, name: admin.name },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    const { password: _, ...adminWithoutPassword } = admin.toObject();

    console.log('✅ Admin profile updated:', admin.email);
    
    res.json({
      message: 'Profile updated successfully',
      token,
      admin: adminWithoutPassword
    });
  } catch (error) {
    console.error('❌ Update admin profile error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;