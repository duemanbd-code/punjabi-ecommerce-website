// server/src/createAdmin.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/user.model';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/duemanbd-dev';

async function seedAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Delete any existing admin
    await User.deleteMany({ email: 'admin@example.com' });
    console.log('🗑️  Removed old admin');
    
    // Create new admin using User model (this triggers the pre-save hook)
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',  // Plain text - will be hashed automatically
      role: 'admin'
    });
    
    await admin.save();
    console.log('✅ Admin created successfully with User model!');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    
    // Verify the hash
    const verify = await User.findOne({ email: 'admin@example.com' });
    console.log('\n📋 Verification:');
    console.log('   Password is hashed:', verify?.password?.startsWith('$2a$') ? '✅ Yes' : '❌ No');
    console.log('   Hash starts with:', verify?.password?.substring(0, 20));
    
    await mongoose.disconnect();
    console.log('\n✅ Done! Now try login');
    
  } catch (err) {
    console.error('❌ Error:', err);
  }
}

seedAdmin();