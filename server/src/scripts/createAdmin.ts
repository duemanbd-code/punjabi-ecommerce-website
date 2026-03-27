// server/src/scripts/createAdmin.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { User } from '../models/user.model';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/duemanbd-dev';

async function seedAdmin() {
  try {
    console.log('📝 Starting seed script...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Delete existing admin to ensure clean slate
    await User.deleteMany({ email: 'admin@example.com' });
    console.log('🗑️  Removed existing admin');
    
    // Create admin with PLAIN password (model will hash it automatically)
    const admin = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'admin123',  // ← PLAIN TEXT, NOT HASHED
      role: 'admin'
    });

    await admin.save();
    
    console.log('✅ Admin created successfully!');
    console.log('   Email: admin@example.com');
    console.log('   Password: admin123');
    console.log('   Role: admin');
    
    // Verify the hash
    const verify = await User.findOne({ email: 'admin@example.com' });
    console.log('\n📋 Verification:');
    console.log('   Password hash starts with:', verify?.password?.substring(0, 20));
    console.log('   Password is hashed:', verify?.password?.startsWith('$2a$') ? '✅ Yes' : '❌ No');
    
    await mongoose.disconnect();
    console.log('\n✅ Done! Now try login');
    
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

seedAdmin();