import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
  sku?: string; // Add SKU field
  normalPrice?: number; // Original price before discount
  originalPrice?: number; // Original price for reference
  category?: string; // Add category field
}

export interface IShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  zipCode?: string;
  country: string;
  deliveryInstructions?: string;
}

export interface IOrder extends Document {
  orderNumber: string;
  shippingInfo: IShippingInfo;
  items: IOrderItem[];
  subtotal: number;
  discountTotal?: number;
  shippingCharge: number;
  total: number;
  paymentMethod: 'cod' | 'card' | 'bkash' | 'nagad' | 'rocket';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryType: 'dhaka' | 'outside';
  estimatedDelivery: string;
  notes?: string;
  trackingNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ✅ FIXED: Order item schema with all required fields including SKU and image
const orderItemSchema = new Schema<IOrderItem>({
  productId: { type: String, required: true },
  title: { type: String, required: true },
  price: { type: Number, required: true },
  // ✅ CRITICAL: Make sure image is stored
  image: { type: String, required: true, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  size: { type: String, default: '' },
  color: { type: String, default: '' },
  // ✅ CRITICAL: Make sure SKU is stored
  sku: { type: String, default: '' },
  normalPrice: { type: Number, default: 0 },
  originalPrice: { type: Number, default: 0 },
  category: { type: String, default: '' }
});

const shippingInfoSchema = new Schema<IShippingInfo>({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  zipCode: { type: String, default: '' },
  country: { type: String, default: 'Bangladesh' },
  deliveryInstructions: { type: String, default: '' }
});

const orderSchema = new Schema<IOrder>({
  orderNumber: { 
    type: String, 
    unique: true,
    index: true 
  },
  shippingInfo: shippingInfoSchema,
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discountTotal: { type: Number, default: 0 },
  shippingCharge: { type: Number, required: true },
  total: { type: Number, required: true },
  paymentMethod: { 
    type: String, 
    enum: ['cod', 'card', 'bkash', 'nagad', 'rocket'], 
    default: 'cod' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'failed', 'refunded'], 
    default: 'pending',
    index: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending',
    index: true 
  },
  deliveryType: { 
    type: String, 
    enum: ['dhaka', 'outside'], 
    required: true 
  },
  estimatedDelivery: { type: String, required: true },
  notes: { type: String, default: '' },
  trackingNumber: { type: String, default: '', index: true }
}, {
  timestamps: true
});

// Generate order number before saving
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.orderNumber = `ORD-${timestamp}-${random}`;
  }
  next();
});

export const Order = mongoose.model<IOrder>('Order', orderSchema);



// // server/src/models/order.models.ts

// import mongoose, { Schema, Document } from 'mongoose';

// export interface IOrderItem {
//   productId: string;
//   title: string;
//   price: number;
//   image: string;
//   quantity: number;
//   size?: string;
//   color?: string;
//   sku?: string; // Add SKU field
//   normalPrice?: number; // Original price before discount
//   originalPrice?: number; // Original price for reference
// }

// export interface IShippingInfo {
//   fullName: string;
//   email: string;
//   phone: string;
//   address: string;
//   city: string;
//   district: string;
//   zipCode?: string;
//   country: string;
//   deliveryInstructions?: string;
// }

// export interface IOrder extends Document {
//   orderNumber: string;
//   shippingInfo: IShippingInfo;
//   items: IOrderItem[];
//   subtotal: number;
//   discountTotal?: number;
//   shippingCharge: number;
//   total: number;
//   paymentMethod: 'cod' | 'card' | 'bkash' | 'nagad' | 'rocket';
//   paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
//   status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
//   deliveryType: 'dhaka' | 'outside';
//   estimatedDelivery: string;
//   notes?: string;
//   trackingNumber?: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

// const orderItemSchema = new Schema<IOrderItem>({
//   productId: { type: String, required: true },
//   title: { type: String, required: true },
//   price: { type: Number, required: true },
//   image: { type: String, required: true },
//   quantity: { type: Number, required: true, min: 1 },
//   size: { type: String, default: '' },
//   color: { type: String, default: '' },
//   sku: { type: String, default: '' }, // Add SKU field
//   normalPrice: { type: Number, default: 0 }, // Original price before discount
//   originalPrice: { type: Number, default: 0 } // Original price for reference
// });

// const shippingInfoSchema = new Schema<IShippingInfo>({
//   fullName: { type: String, required: true },
//   email: { type: String, required: true },
//   phone: { type: String, required: true },
//   address: { type: String, required: true },
//   city: { type: String, required: true },
//   district: { type: String, required: true },
//   zipCode: { type: String, default: '' },
//   country: { type: String, default: 'Bangladesh' },
//   deliveryInstructions: { type: String, default: '' }
// });

// const orderSchema = new Schema<IOrder>({
//   orderNumber: { 
//     type: String, 
//     unique: true,
//     index: true 
//   },
//   shippingInfo: shippingInfoSchema,
//   items: [orderItemSchema],
//   subtotal: { type: Number, required: true },
//   discountTotal: { type: Number, default: 0 },
//   shippingCharge: { type: Number, required: true },
//   total: { type: Number, required: true },
//   paymentMethod: { 
//     type: String, 
//     enum: ['cod', 'card', 'bkash', 'nagad', 'rocket'], 
//     default: 'cod' 
//   },
//   paymentStatus: { 
//     type: String, 
//     enum: ['pending', 'paid', 'failed', 'refunded'], 
//     default: 'pending',
//     index: true 
//   },
//   status: { 
//     type: String, 
//     enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'], 
//     default: 'pending',
//     index: true 
//   },
//   deliveryType: { 
//     type: String, 
//     enum: ['dhaka', 'outside'], 
//     required: true 
//   },
//   estimatedDelivery: { type: String, required: true },
//   notes: { type: String, default: '' },
//   trackingNumber: { type: String, default: '', index: true }
// }, {
//   timestamps: true
// });

// // Generate order number before saving
// orderSchema.pre('save', function(next) {
//   if (!this.orderNumber) {
//     const timestamp = Date.now().toString().slice(-8);
//     const random = Math.random().toString(36).substring(2, 6).toUpperCase();
//     this.orderNumber = `ORD-${timestamp}-${random}`;
//   }
//   next();
// });

// export const Order = mongoose.model<IOrder>('Order', orderSchema);