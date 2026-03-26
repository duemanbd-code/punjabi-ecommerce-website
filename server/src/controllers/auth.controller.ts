// server/src/controllers/auth.controller.ts

import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.model';

const SECRET_KEY = process.env.JWT_SECRET || 'your_super_secret_key_change_this_in_production';

// Demo emails to exclude
const DEMO_EMAILS = [
  'user@example.com',
  'admin@example.com',
  'demo@example.com',
  'test@example.com'
];

// Create default admin user if none exists (only if no real users)
export const initializeDefaultUsers = async () => {
  try {
    // Check if there are any real users (not demo)
    const realUsersCount = await User.countDocuments({
      email: { $nin: DEMO_EMAILS }
    });
    
    // Only create demo admin if no real users exist
    if (realUsersCount === 0) {
      const adminExists = await User.findOne({ email: 'admin@example.com' });
      if (!adminExists) {
        const defaultAdmin = new User({
          email: 'admin@example.com',
          password: 'admin123',
          name: 'Admin User',
          role: 'admin'
        });
        await defaultAdmin.save();
        console.log('✅ Default admin user created');
      }

      const userExists = await User.findOne({ email: 'user@example.com' });
      if (!userExists) {
        const defaultUser = new User({
          email: 'user@example.com',
          password: 'password123',
          name: 'John Doe',
          role: 'user'
        });
        await defaultUser.save();
        console.log('✅ Default regular user created');
      }
    } else {
      // If real users exist, ensure demo users are removed
      await User.deleteMany({ email: { $in: DEMO_EMAILS } });
      console.log('✅ Demo users removed');
    }
  } catch (error) {
    console.error('Error creating default users:', error);
  }
};

// Login controller
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });

    // Send response without password
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Register controller
export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Prevent registration with demo emails
    if (DEMO_EMAILS.includes(email.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      name,
      role: 'user' // Default role
    });

    await user.save();

    // Generate JWT token
    const payload = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name
    };
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current user
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ user });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get all users (admin only) - EXCLUDE DEMO USERS
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // Get all users EXCLUDING demo emails
    const users = await User.find({
      email: { $nin: DEMO_EMAILS }
    })
      .select('-password')
      .sort({ createdAt: -1 });
    
    // Get statistics excluding demo users
    const totalUsers = users.length;
    const adminUsers = users.filter(u => u.role === 'admin').length;
    const regularUsers = users.filter(u => u.role === 'user').length;
    
    res.json({ 
      users,
      stats: {
        total: totalUsers,
        admins: adminUsers,
        regular: regularUsers
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user by ID (admin only)
export const getUserById = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is demo
    if (DEMO_EMAILS.includes(user.email.toLowerCase())) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user role (admin only)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent updating demo users
    if (DEMO_EMAILS.includes(user.email.toLowerCase())) {
      return res.status(400).json({ message: 'Cannot modify demo user' });
    }

    user.role = role;
    await user.save();

    const { password: _, ...userWithoutPassword } = user.toObject();
    res.json({ message: 'User role updated', user: userWithoutPassword });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    
    const userToDelete = await User.findById(userId);
    if (!userToDelete) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent deleting demo users
    if (DEMO_EMAILS.includes(userToDelete.email.toLowerCase())) {
      return res.status(400).json({ message: 'Cannot delete demo user' });
    }
    
    // Prevent deleting the last admin
    if (userToDelete.role === 'admin') {
      const adminCount = await User.countDocuments({ 
        role: 'admin',
        email: { $nin: DEMO_EMAILS }
      });
      if (adminCount <= 1) {
        return res.status(400).json({ message: 'Cannot delete the last admin user' });
      }
    }
    
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};