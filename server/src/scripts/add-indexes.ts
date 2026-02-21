// server/src/scripts/add-indexes.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function addIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('Connected to MongoDB');
    
    const db = mongoose.connection.db;
    if (!db) throw new Error('Database not connected');
    
    const productsCollection = db.collection('products');
    
    // Single field indexes
    await productsCollection.createIndex({ category: 1 });
    console.log('✓ Index added on category');
    
    await productsCollection.createIndex({ price: 1 });
    console.log('✓ Index added on price');
    
    await productsCollection.createIndex({ createdAt: -1 });
    console.log('✓ Index added on createdAt');
    
    await productsCollection.createIndex({ name: 'text', description: 'text' });
    console.log('✓ Text index added on name and description');
    
    // Compound indexes for common queries
    await productsCollection.createIndex({ category: 1, price: -1 });
    console.log('✓ Compound index added on category + price');
    
    await productsCollection.createIndex({ isActive: 1, createdAt: -1 });
    console.log('✓ Compound index added on isActive + createdAt');
    
    console.log('✅ All indexes created successfully!');
    
  } catch (error) {
    console.error('Error adding indexes:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addIndexes();