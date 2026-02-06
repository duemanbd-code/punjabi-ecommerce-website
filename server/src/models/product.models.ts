// server/src/models/product.models.ts

import mongoose, { Schema, Document } from "mongoose";

// ===== TYPE DEFINITIONS =====

interface IProductVariant {
  sku: string;
  size?: string;
  color?: string;
  material?: string;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  normalPrice?: number;
  salePrice?: number;
  images?: string[];
  imagesPublicIds?: string[]; // Add Cloudinary public IDs for variant images
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  warehouseLocation?: {
    warehouse?: string;
    shelf?: string;
    bin?: string;
  };
}

interface IWeight {
  value: number;
  unit: 'kg' | 'g' | 'lb' | 'oz';
}

interface IDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'm' | 'in' | 'ft';
}

interface IMetaData {
  title?: string;
  description?: string;
  keywords?: string[];
}

interface IWarehouseLocation {
  warehouse?: string;
  shelf?: string;
  bin?: string;
}

interface IInventoryHistory {
  date: Date;
  type: 'stock_in' | 'stock_out' | 'adjustment' | 'reservation' | 'release' | 'damage' | 'return';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  notes?: string;
  reference?: string;
  performedBy?: mongoose.Types.ObjectId;
}

// ===== MAIN PRODUCT INTERFACE =====
export interface IProduct extends Document {
  title: string;
  description: string;
  category: string;
  normalPrice: number;
  originalPrice?: number;
  salePrice?: number;
  rating?: number;
  imageUrl: string;
  imagePublicId?: string; // Cloudinary public ID for main image
  images?: string[];
  additionalImages?: string[];
  additionalImagesPublicIds?: string[]; // Cloudinary public IDs for additional images
  
  isBestSelling: boolean;
  isNewProduct: boolean;
  featured: boolean;
  
  // Frontend compatibility fields
  offerPrice?: number;
  hasOffer?: boolean;
  discountPercentage?: number;
  
  // Inventory fields
  sku: string;  // This will be our custom product code
  manageStock: boolean;
  stockQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  totalInventoryValue: number;
  warehouseLocation?: IWarehouseLocation;
  lastRestocked: Date;
  inventoryStatus: 'in_stock' | 'low_stock' | 'out_of_stock' | 'discontinued';
  productStatus: 'active' | 'draft' | 'archived';
  
  // Variants and sizes
  hasVariants: boolean;
  variants?: IProductVariant[];
  
  // Frontend compatibility - sizes array
  sizes?: Array<{
    size: string;
    stock: number;
  }>;
  
  // Dimensions & Weight
  weight?: IWeight;
  dimensions?: IDimensions;
  
  // Tags & Metadata
  tags?: string[];
  meta?: IMetaData;
  
  // Sales Data
  salesCount: number;
  totalRevenue: number;
  
  // Audit fields
  createdBy?: mongoose.Types.ObjectId;
  updatedBy?: mongoose.Types.ObjectId;
  
  // Inventory History
  inventoryHistory?: IInventoryHistory[];
  
  // Timestamps
  createdAt?: Date;
  updatedAt?: Date;
}

// ===== SCHEMA DEFINITION =====
const ProductSchema = new Schema<IProduct>({
  title: { 
    type: String, 
    required: [true, "Product title is required"] 
  },
  description: { 
    type: String, 
    default: "" 
  },
  category: { 
    type: String, 
    required: [true, "Category is required"] 
  },
  normalPrice: { 
    type: Number, 
    required: [true, "Normal price is required"],
    min: [0, "Price cannot be negative"]
  },
  originalPrice: { 
    type: Number 
  },
  salePrice: { 
    type: Number 
  },
  
  // Frontend compatibility fields
  offerPrice: { type: Number },
  hasOffer: { type: Boolean, default: false },
  discountPercentage: { type: Number, min: 0, max: 100 },
  
  rating: { 
    type: Number, 
    default: 0,
    min: 0,
    max: 5
  },
  imageUrl: { 
    type: String, 
    default: "" 
  },
  imagePublicId: {
    type: String,
    default: "" // Cloudinary public ID for main image
  },
  images: { 
    type: [String], 
    default: [] 
  },
  additionalImages: {
    type: [String],
    default: []
  },
  additionalImagesPublicIds: {
    type: [String],
    default: [] // Cloudinary public IDs for additional images
  },
  
  isBestSelling: { 
    type: Boolean, 
    default: false 
  },
  isNewProduct: {
    type: Boolean, 
    default: false 
  },
  featured: { 
    type: Boolean, 
    default: false 
  },
  
  // ===== INVENTORY FIELDS =====
  sku: { 
    type: String, 
    required: [true, "SKU/Product Code is required"],
    unique: true,
    index: true,
    trim: true,
    uppercase: true,
    // Removed auto-generation - will be provided by admin
  },
  
  manageStock: { 
    type: Boolean, 
    default: true 
  },
  
  stockQuantity: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  reservedQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  
  availableQuantity: {
    type: Number,
    default: 0,
    min: 0
  },
  
  lowStockThreshold: { 
    type: Number, 
    default: 10,
    min: 0
  },
  
  reorderPoint: {
    type: Number,
    default: 20,
    min: 0
  },
  
  reorderQuantity: {
    type: Number,
    default: 50,
    min: 1
  },
  
  unitCost: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalInventoryValue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  warehouseLocation: {
    warehouse: String,
    shelf: String,
    bin: String
  },
  
  lastRestocked: {
    type: Date,
    default: Date.now
  },
  
  // ===== INVENTORY STATUS =====
  inventoryStatus: { 
    type: String, 
    default: "in_stock", 
    enum: {
      values: ["in_stock", "low_stock", "out_of_stock", "discontinued"],
      message: "{VALUE} is not a valid inventory status"
    }
  },
  
  // ===== PRODUCT STATUS =====
  productStatus: { 
    type: String, 
    default: "active", 
    enum: {
      values: ["active", "draft", "archived"],
      message: "{VALUE} is not a valid product status"
    }
  },
  
  // ===== VARIANTS =====
  hasVariants: {
    type: Boolean,
    default: false
  },
  
  variants: { 
    type: [{
      sku: { type: String, required: true },
      size: String,
      color: String,
      material: String,
      stockQuantity: { type: Number, default: 0, min: 0 },
      reservedQuantity: { type: Number, default: 0, min: 0 },
      availableQuantity: { type: Number, default: 0, min: 0 },
      normalPrice: Number,
      salePrice: Number,
      images: [String],
      imagesPublicIds: [String], // Add Cloudinary public IDs for variant images
      status: {
        type: String,
        enum: ["in_stock", "low_stock", "out_of_stock"],
        default: "in_stock"
      },
      warehouseLocation: {
        warehouse: String,
        shelf: String,
        bin: String
      }
    }], 
    default: [] 
  },
  
  // ===== FRONTEND COMPATIBILITY - SIZES ARRAY =====
  sizes: {
    type: [{
      size: String,
      stock: Number
    }],
    default: []
  },
  
  // ===== DIMENSIONS & WEIGHT =====
  weight: {
    value: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: "kg", enum: ["kg", "g", "lb", "oz"] }
  },
  
  dimensions: {
    length: { type: Number, default: 0, min: 0 },
    width: { type: Number, default: 0, min: 0 },
    height: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: "cm", enum: ["cm", "m", "in", "ft"] }
  },
  
  // ===== TAGS & METADATA =====
  tags: { 
    type: [String], 
    default: [] 
  },
  
  meta: {
    title: String,
    description: String,
    keywords: [String]
  },
  
  // ===== SALES DATA =====
  salesCount: { 
    type: Number, 
    default: 0,
    min: 0
  },
  
  totalRevenue: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // ===== AUDIT FIELDS =====
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin"
  },
  
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "Admin"
  },
  
  // ===== INVENTORY HISTORY =====
  inventoryHistory: [{
    date: { type: Date, default: Date.now },
    type: {
      type: String,
      enum: ["stock_in", "stock_out", "adjustment", "reservation", "release", "damage", "return"]
    },
    quantity: Number,
    previousQuantity: Number,
    newQuantity: Number,
    reason: String,
    notes: String,
    reference: String,
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: "Admin"
    }
  }]
  
}, {
  timestamps: true
});

// ===== MIDDLEWARE =====

// Generate SKU only if not provided (admin can provide custom SKU)
ProductSchema.pre<IProduct>('save', function(next) {
  const product = this;
  
  // Only generate SKU if not provided by admin
  if (!product.sku && product.title) {
    const titleAbbr = product.title
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .substring(0, 4);
    
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const timestamp = Date.now().toString().slice(-4);
    
    product.sku = `${titleAbbr}-${randomNum}-${timestamp}`.toUpperCase();
  } else if (product.sku) {
    // Ensure SKU is uppercase
    product.sku = product.sku.toUpperCase();
  }
  
  // Calculate offer price and discount
  if (product.salePrice && product.salePrice < product.normalPrice) {
    product.offerPrice = product.salePrice;
    product.hasOffer = true;
    product.discountPercentage = Math.round(
      ((product.normalPrice - product.salePrice) / product.normalPrice) * 100
    );
  } else {
    product.offerPrice = product.normalPrice;
    product.hasOffer = false;
    product.discountPercentage = 0;
  }
  
  // Calculate available quantity
  if (product.manageStock) {
    product.availableQuantity = product.stockQuantity - product.reservedQuantity;
    
    // Update inventory status based on available quantity
    if (product.availableQuantity <= 0) {
      product.inventoryStatus = 'out_of_stock';
    } else if (product.availableQuantity <= product.lowStockThreshold) {
      product.inventoryStatus = 'low_stock';
    } else {
      product.inventoryStatus = 'in_stock';
    }
    
    // Calculate total inventory value
    product.totalInventoryValue = product.stockQuantity * product.unitCost;
  }
  
  // Sync sizes array from variants for frontend
  if (product.hasVariants && product.variants && product.variants.length > 0) {
    product.sizes = product.variants.map(variant => ({
      size: variant.size || "M",
      stock: variant.stockQuantity || 0
    }));
  }
  
  next();
});

// Update variant statuses and sync sizes
ProductSchema.pre<IProduct>('save', function(next) {
  const product = this;
  
  if (product.hasVariants && product.variants && product.variants.length > 0) {
    // Calculate total stock from variants
    const totalVariantStock = product.variants.reduce((total, variant) => {
      return total + (variant.stockQuantity || 0);
    }, 0);
    
    const totalVariantReserved = product.variants.reduce((total, variant) => {
      return total + (variant.reservedQuantity || 0);
    }, 0);
    
    product.stockQuantity = totalVariantStock;
    product.reservedQuantity = totalVariantReserved;
    product.availableQuantity = totalVariantStock - totalVariantReserved;
    
    // Update variant statuses
    product.variants.forEach(variant => {
      const variantAvailable = (variant.stockQuantity || 0) - (variant.reservedQuantity || 0);
      
      if (variantAvailable <= 0) {
        variant.status = 'out_of_stock';
      } else if (variantAvailable <= product.lowStockThreshold) {
        variant.status = 'low_stock';
      } else {
        variant.status = 'in_stock';
      }
    });
    
    // Sync sizes array from variants
    product.sizes = product.variants.map(variant => ({
      size: variant.size || "M",
      stock: variant.stockQuantity || 0
    }));
  }
  
  next();
});

// ===== STATIC METHODS =====

// Define static methods interface
interface IProductModel extends mongoose.Model<IProduct> {
  findBySKU(sku: string): Promise<IProduct | null>;
  getLowStock(threshold?: number): Promise<IProduct[]>;
  getOutOfStock(): Promise<IProduct[]>;
}

// Find by SKU
ProductSchema.statics.findBySKU = function(sku: string): Promise<IProduct | null> {
  return this.findOne({ sku });
};

// Get low stock products
ProductSchema.statics.getLowStock = function(threshold?: number): Promise<IProduct[]> {
  const query: any = { 
    manageStock: true,
    inventoryStatus: 'low_stock'
  };
  
  if (threshold !== undefined) {
    query.availableQuantity = { $lte: threshold };
  }
  
  return this.find(query);
};

// Get out of stock products
ProductSchema.statics.getOutOfStock = function(): Promise<IProduct[]> {
  return this.find({ 
    manageStock: true,
    inventoryStatus: 'out_of_stock'
  });
};

// ===== INDEXES =====
ProductSchema.index({ sku: 1 });
ProductSchema.index({ category: 1 });
ProductSchema.index({ inventoryStatus: 1 });
ProductSchema.index({ productStatus: 1 });
ProductSchema.index({ isBestSelling: 1 });
ProductSchema.index({ featured: 1 });
ProductSchema.index({ hasOffer: 1 });
ProductSchema.index({ 'variants.sku': 1 }, { unique: false });
ProductSchema.index({ createdAt: -1 });

// Create and export the model
const Product = mongoose.model<IProduct, IProductModel>("Product", ProductSchema);

export default Product;