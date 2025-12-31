// client/src/types/product.types.ts

export interface Product {
  _id: string;           // MongoDB ID
  id?: string;           // Optional fallback ID
  title: string;
  description?: string;
  category?: string;
  categoryName?: string; // Sometimes used if frontend wants friendly name
  normalPrice: number;
  discountedPrice?: number;
  images?: string[];     // Array of image URLs
  stock?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;    // For any additional fields coming from backend
}
