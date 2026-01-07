

// client/src/types/product.types.ts

export interface Product {
  _id: string;
  id?: string;
  title: string;
  name?: string;
  description: string;
  normalPrice: number;
  originalPrice?: number;
  offerPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
  category: string;
  image: string;
  imageUrl?: string;
  images?: string[];
  additionalImages?: string[];
  rating?: number;
  reviewCount?: number;
  isBestSelling?: boolean;
  isNew?: boolean;
  featured?: boolean;
  stock?: number;
  sizes?: Array<{
    size: string;
    stock: number;
  }>;
  colors?: string[];
  tags?: string[];
  keywords?: string[];
  createdAt?: string;
  brand?: string;
  material?: string;
  sku?: string;
  weight?: string;
  dimensions?: string;
  careInstructions?: string[];
}












// client/src/types/product.types.ts

// export interface Product {
//   _id: string;
//   id?: string;
//   title: string;
//   name?: string;
//   description: string;
//   normalPrice: number;
//   originalPrice?: number;
//   offerPrice?: number;
//   salePrice?: number;
//   discountPercentage?: number;
//   category: string;
//   image: string;
//   imageUrl: string; // Changed from optional to required
//   images?: string[];
//   additionalImages?: string[];
//   rating?: number;
//   reviewCount?: number;
//   isBestSelling?: boolean;
//   isNew?: boolean;
//   featured?: boolean;
//   stock?: number;
//   sizes?: Array<{
//     size: string;
//     stock: number;
//   }>;
//   colors?: string[];
//   tags?: string[];
//   keywords?: string[];
//   createdAt?: string;
//   brand?: string;
//   material?: string;
//   sku?: string;
//   weight?: string;
//   dimensions?: string;
//   careInstructions?: string[];
// }

