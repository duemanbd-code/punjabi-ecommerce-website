// client/src/components/ProductCards.tsx

"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star, Eye, Tag, Zap, Award } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@/types/product.types";

// Helper function to get product name safely
const getProductName = (product: Product): string => {
  return product.title || product.name || "Product";
};

type ProductCardProps = {
  product: Product;
  viewMode?: "grid" | "list";
  showQuickView?: boolean;
};

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = "grid",
  showQuickView = false,
}) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);

  const isWishlisted = isInWishlist(product._id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product._id,
      name: getProductName(product),
      price: product.normalPrice,
      image: product.image || product.imageUrl || "",
      quantity: 1,
      product,
    });
  };

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      removeFromWishlist(product._id);
    } else {
      addToWishlist(product);
    }
  };

  const discountPercentage = product.originalPrice
    ? Math.round(
        ((product.originalPrice - product.normalPrice) / product.originalPrice) *
          100
      )
    : product.discountPercentage || 0;

  const renderProductImage = () => (
    <div className="relative overflow-hidden rounded-lg bg-gray-100">
      <Image
        src={product.image || product.imageUrl || "/placeholder-product.jpg"}
        alt={getProductName(product)}
        width={viewMode === "grid" ? 300 : 200}
        height={viewMode === "grid" ? 300 : 200}
        className={`w-full h-auto object-cover transition-transform duration-300 ${
          isHovered ? "scale-105" : "scale-100"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      {/* Badges */}
      <div className="absolute top-3 left-3 flex flex-col gap-1">
        {product.isNew && (
          <div className="flex items-center gap-1 px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded">
            <Zap className="w-3 h-3" />
            <span>New</span>
          </div>
        )}
        {product.isBestSelling && (
          <div className="flex items-center gap-1 px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded">
            <Award className="w-3 h-3" />
            <span>Bestseller</span>
          </div>
        )}
        {discountPercentage > 0 && (
          <div className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded">
            -{discountPercentage}%
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div
        className={`absolute top-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
          isHovered || viewMode === "list"
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-4"
        }`}
      >
        <button
          onClick={handleWishlistToggle}
          className={`p-2 rounded-full shadow-lg transition-colors ${
            isWishlisted
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
        {showQuickView && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowQuickViewModal(true);
            }}
            className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
            aria-label="Quick view"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );

  const renderProductInfo = () => (
    <div className="p-4">
      {/* Category */}
      <div className="flex items-center gap-1 mb-2">
        <Tag className="w-3 h-3 text-gray-400" />
        <span className="text-xs text-gray-500">{product.category}</span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
        {getProductName(product)}
      </h3>

      {/* Description */}
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {product.description}
      </p>

      {/* Rating */}
      {product.rating && (
        <div className="flex items-center gap-1 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating!)
                    ? "text-amber-400 fill-current"
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">
            {product.rating.toFixed(1)}
          </span>
          {product.reviewCount && (
            <span className="text-xs text-gray-400">
              ({product.reviewCount})
            </span>
          )}
        </div>
      )}

      {/* Price */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl font-bold text-gray-900">
          ৳{product.normalPrice.toLocaleString()}
        </span>
        {product.originalPrice && product.originalPrice > product.normalPrice && (
          <>
            <span className="text-sm text-gray-500 line-through">
              ৳{product.originalPrice.toLocaleString()}
            </span>
            {discountPercentage > 0 && (
              <span className="text-sm font-medium text-red-500">
                Save {discountPercentage}%
              </span>
            )}
          </>
        )}
      </div>

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {product.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Keywords */}
      {product.keywords && product.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {product.keywords.slice(0, 2).map((keyword, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded"
            >
              #{keyword}
            </span>
          ))}
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={handleAddToCart}
        className="w-full py-3 bg-gradient-to-r from-slate-950 to-amber-500 text-white rounded-lg hover:from-slate-800 hover:to-amber-600 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <ShoppingCart className="w-4 h-4" />
        Add to Cart
      </button>
    </div>
  );

  if (viewMode === "list") {
    return (
      <>
        <Link
          href={`/product/${product._id}`}
          className="flex flex-col md:flex-row gap-6 p-4 bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="md:w-1/4">{renderProductImage()}</div>
          <div className="md:w-3/4">{renderProductInfo()}</div>
        </Link>
      </>
    );
  }

  return (
    <>
      <Link
        href={`/product/${product._id}`}
        className="group block bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {renderProductImage()}
        {renderProductInfo()}
      </Link>
    </>
  );
};

export default ProductCard;



// // client/src/components/ProductCards.tsx

// "use client";

// import { useState, useCallback, memo } from "react";
// import {
//   ShoppingCart,
//   Eye,
//   Star,
//   Tag,
//   Heart,
//   Zap,
//   Check,
//   Truck,
//   ArrowRight,
//   Sparkles,
// } from "lucide-react";
// import Link from "next/link";
// import { motion } from "framer-motion";
// import { useCart } from "@/context/CartContext";
// import { useWishlist } from "@/context/WishlistContext";

// export interface Product {
//   _id: string;
//   title: string;
//   description: string;
//   category: string;
//   imageUrl: string;
//   additionalImages?: string[];
//   normalPrice: number;
//   originalPrice?: number;
//   offerPrice?: number;
//   salePrice?: number; // ✅ Added salePrice field
//   discountPercentage?: number;
//   rating?: number;
//   reviewCount?: number;
//   isBestSelling?: boolean;
//   isNew?: boolean;
//   featured?: boolean;
//   stock?: number;
//   brand?: string;
//   sizes?: any[];
//   colors?: any[];
//   tags?: string[];
// }

// interface ProductCardProps {
//   product: Product;
//   viewMode?: "grid" | "list" | "compact";
//   showQuickView?: boolean;
//   showWishlist?: boolean;
//   onAddToCart?: (product: Product) => void;
//   onQuickView?: (product: Product) => void;
//   isLoading?: boolean;
// }

// const API_URL = "http://localhost:4000";

// // Image URL helper
// const getImageUrl = (url: string) => {
//   if (!url || url.trim() === "") {
//     return "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop";
//   }

//   if (
//     url.startsWith("http://") ||
//     url.startsWith("https://") ||
//     url.startsWith("data:")
//   ) {
//     return url;
//   }

//   if (url.startsWith("/uploads")) {
//     return `${API_URL}${url}`;
//   }

//   if (url.startsWith("/")) {
//     return `${API_URL}${url}`;
//   }

//   return `${API_URL}/uploads/${url}`;
// };

// function ProductCard({
//   product,
//   viewMode = "grid",
//   showQuickView = true,
//   showWishlist = true,
//   onAddToCart,
//   onQuickView,
//   isLoading = false,
// }: ProductCardProps) {
//   const [isHovered, setIsHovered] = useState(false);
//   const [isAnimating, setIsAnimating] = useState(false);
//   const [currentImageIndex, setCurrentImageIndex] = useState(0);

//   const { addToCart } = useCart();
//   const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();

//   const isWishlisted = isInWishlist(product._id);

//   // ✅ FIXED: Calculate correct price
//   const calculatePriceData = useCallback(() => {
//     // Priority: salePrice > offerPrice > normalPrice
//     let displayPrice = product.normalPrice;
//     let originalPrice = product.originalPrice || product.normalPrice;
//     let hasOffer = false;
//     let discountPercentage = 0;
    
//     // Check salePrice first (from backend)
//     if (product.salePrice && product.salePrice < product.normalPrice) {
//       displayPrice = product.salePrice;
//       originalPrice = product.normalPrice;
//       hasOffer = true;
//     } 
//     // Then check offerPrice (from frontend form)
//     else if (product.offerPrice && product.offerPrice < product.normalPrice) {
//       displayPrice = product.offerPrice;
//       originalPrice = product.normalPrice;
//       hasOffer = true;
//     }
    
//     // Calculate discount percentage
//     if (hasOffer && originalPrice > 0) {
//       discountPercentage = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
//     }
    
//     // Also check discountPercentage field directly
//     if (product.discountPercentage && product.discountPercentage > 0) {
//       discountPercentage = product.discountPercentage;
//       hasOffer = true;
//       if (product.originalPrice && product.normalPrice < product.originalPrice) {
//         displayPrice = product.normalPrice;
//         originalPrice = product.originalPrice;
//       }
//     }
    
//     return {
//       displayPrice,
//       originalPrice,
//       hasOffer,
//       discountPercentage,
//       discountAmount: hasOffer ? originalPrice - displayPrice : 0,
//       isOnSale: hasOffer,
//     };
//   }, [product]);

//   const priceData = calculatePriceData();
//   const { displayPrice, originalPrice, hasOffer, discountPercentage, discountAmount, isOnSale } = priceData;

//   const isOutOfStock = product.stock === 0;
//   const isLowStock = product.stock && product.stock > 0 && product.stock <= 5;

//   // Get badge with elegant styling
//   const getBadge = () => {
//     if (isOutOfStock)
//       return { text: "Out of Stock", color: "bg-slate-700 text-white" };
//     if (product.isBestSelling)
//       return {
//         text: "Bestseller",
//         color: "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
//       };
//     if (hasOffer && discountPercentage >= 50)
//       return {
//         text: "Mega Sale",
//         color: "bg-gradient-to-r from-rose-500 to-rose-600 text-white",
//       };
//     if (hasOffer && discountPercentage >= 30)
//       return {
//         text: "Flash Sale",
//         color: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
//       };
//     if (hasOffer)
//       return {
//         text: "Sale",
//         color: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
//       };
//     if (product.isNew)
//       return {
//         text: "New Arrival",
//         color: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
//       };
//     return null;
//   };

//   const badge = getBadge();

//   // Add to cart handler
//   const handleAddToCart = useCallback(
//     (e: React.MouseEvent) => {
//       e.stopPropagation();
//       e.preventDefault();
//       if (!isOutOfStock) {
//         setIsAnimating(true);

//         const cartItem = {
//           id: product._id,
//           title: product.title,
//           price: displayPrice,
//           image: getImageUrl(product.imageUrl),
//           quantity: 1,
//           stock: product.stock || 0,
//           normalPrice: product.normalPrice,
//           originalPrice: originalPrice,
//           offerPrice: product.offerPrice,
//           salePrice: product.salePrice,
//           category: product.category,
//           hasOffer: hasOffer,
//           discountAmount: discountAmount,
//         };

//         addToCart(cartItem);

//         if (onAddToCart) {
//           onAddToCart(product);
//         }

//         setTimeout(() => setIsAnimating(false), 1000);
//       }
//     },
//     [product, displayPrice, originalPrice, hasOffer, discountAmount, isOutOfStock, addToCart, onAddToCart]
//   );

//   // Wishlist handler
//   const handleWishlistToggle = useCallback(
//     (e: React.MouseEvent) => {
//       e.stopPropagation();
//       e.preventDefault();

//       if (isWishlisted) {
//         removeFromWishlist(product._id);
//       } else {
//         const wishlistItem = {
//           id: product._id,
//           title: product.title,
//           price: displayPrice,
//           imageUrl: getImageUrl(product.imageUrl),
//           category: product.category,
//           normalPrice: product.normalPrice,
//           originalPrice: originalPrice,
//           offerPrice: product.offerPrice,
//           salePrice: product.salePrice,
//           rating: product.rating,
//           stock: product.stock,
//           hasOffer: hasOffer,
//         };
//         addToWishlist(wishlistItem);
//       }
//     },
//     [product, displayPrice, originalPrice, isWishlisted, hasOffer, addToWishlist, removeFromWishlist]
//   );

//   // Get all images
//   const getAllImages = () => {
//     const images = [];
//     if (product.imageUrl) images.push(product.imageUrl);
//     if (product.additionalImages) images.push(...product.additionalImages);
//     return images;
//   };

//   const images = getAllImages();

//   // Handle image error
//   const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
//     e.currentTarget.src =
//       "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop";
//     e.currentTarget.onerror = null;
//   };

//   if (isLoading) {
//     return (
//       <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden animate-pulse">
//         <div className="h-64 bg-gradient-to-r from-slate-100 to-slate-200"></div>
//         <div className="p-5 space-y-3">
//           <div className="h-4 bg-slate-200 rounded w-1/4"></div>
//           <div className="h-6 bg-slate-200 rounded w-3/4"></div>
//           <div className="h-4 bg-slate-200 rounded w-full"></div>
//           <div className="h-10 bg-slate-200 rounded"></div>
//         </div>
//       </div>
//     );
//   }

//   if (!product || !product._id || !product.title) {
//     return null;
//   }

//   return (
//     <Link href={`/product/${product._id}`} className="block">
//       <motion.div
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         transition={{ duration: 0.3 }}
//         className="group relative"
//         onMouseEnter={() => setIsHovered(true)}
//         onMouseLeave={() => setIsHovered(false)}
//       >
//         <div
//           className={`
//           bg-white rounded-xl overflow-hidden
//           shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer
//           border border-slate-100 hover:border-amber-200
//           ${isOutOfStock ? "opacity-80" : ""}
//           flex flex-col h-full relative
//           before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/50 before:to-amber-50/30 before:opacity-0 before:hover:opacity-100 before:transition-opacity before:duration-500
//         `}
//         >
//           {/* Top accent bar */}
//           <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 z-20"></div>

//           {/* Image Container */}
//           <div className="relative h-64 overflow-hidden">
//             {/* Amber gradient overlay */}
//             <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent z-10"></div>

//             {/* Image with elegant hover effect */}
//             <div className="relative w-full h-full overflow-hidden">
//               <img
//                 src={getImageUrl(images[currentImageIndex] || product.imageUrl)}
//                 alt={product.title}
//                 className={`w-full h-full object-cover transition-all duration-700 ${
//                   isHovered ? "scale-110 brightness-110" : "scale-100"
//                 }`}
//                 loading="lazy"
//                 onError={handleImageError}
//               />

//               {/* Animated overlay on hover */}
//               <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//             </div>

//             {/* Premium badge */}
//             {badge && (
//               <motion.div
//                 initial={{ scale: 0.8 }}
//                 animate={{ scale: 1 }}
//                 className={`absolute top-4 left-4 z-20 ${badge.color} text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm`}
//               >
//                 <div className="flex items-center gap-1.5">
//                   {badge.text === "Bestseller" && <Sparkles size={10} />}
//                   {badge.text === "New Arrival" && <Sparkles size={10} />}
//                   {badge.text === "Flash Sale" && <Zap size={10} />}
//                   <span className="font-semibold tracking-wide">
//                     {badge.text}
//                   </span>
//                 </div>
//               </motion.div>
//             )}

//             {/* Discount badge with elegant styling */}
//             {hasOffer && discountPercentage > 0 && !isOutOfStock && (
//               <div className="absolute top-4 left-16 z-20">
//                 <div className="relative">
//                   <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full blur-sm"></div>
//                   <div className="relative px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-bold rounded-full shadow-lg">
//                     -{discountPercentage}%
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Top Right Buttons Container */}
//             <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
//               {/* Wishlist Button - Always visible on right side */}
//               {showWishlist && (
//                 <motion.button
//                   onClick={handleWishlistToggle}
//                   whileTap={{ scale: 0.9 }}
//                   whileHover={{ scale: 1.1 }}
//                   className={`
//                     p-2.5 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm
//                     ${
//                       isWishlisted
//                         ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-rose-500/30"
//                         : "bg-white/95 text-slate-700 border border-slate-200 hover:bg-gradient-to-r hover:from-rose-50 hover:to-rose-100 hover:text-rose-600 hover:border-rose-200 hover:shadow-xl"
//                     }
//                   `}
//                   aria-label={
//                     isWishlisted ? "Remove from wishlist" : "Add to wishlist"
//                   }
//                 >
//                   <Heart
//                     size={18}
//                     className={
//                       isWishlisted
//                         ? "fill-white"
//                         : "group-hover:fill-rose-400 transition-all duration-300"
//                     }
//                   />
//                 </motion.button>
//               )}

//               {/* Quick View Button - Always visible eye icon on right side */}
//               {showQuickView && !isOutOfStock && (
//                 <motion.button
//                   onClick={(e) => {
//                     e.stopPropagation();
//                     e.preventDefault();
//                     if (onQuickView) onQuickView(product);
//                   }}
//                   whileTap={{ scale: 0.9 }}
//                   whileHover={{ scale: 1.1 }}
//                   className={`
//                     p-2.5 rounded-full bg-white/95 backdrop-blur-sm shadow-lg
//                     text-slate-700 border border-slate-200
//                     transition-all duration-300
//                     hover:bg-gradient-to-r hover:from-amber-50 hover:to-amber-100
//                     hover:text-amber-600 hover:border-amber-200 hover:shadow-xl
//                     group/eye
//                   `}
//                   aria-label="Quick view"
//                 >
//                   <Eye
//                     size={18}
//                     className="group-hover/eye:stroke-amber-600 transition-all duration-300"
//                   />
//                 </motion.button>
//               )}
//             </div>

//             {/* Image navigation dots - elegant styling */}
//             {images.length > 1 && (
//               <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
//                 {images.map((_, index) => (
//                   <button
//                     key={index}
//                     onClick={(e) => {
//                       e.stopPropagation();
//                       setCurrentImageIndex(index);
//                     }}
//                     className={`w-2 h-2 rounded-full transition-all duration-300 ${
//                       index === currentImageIndex
//                         ? "bg-amber-500 w-6 shadow-lg shadow-amber-500/50"
//                         : "bg-white/80 hover:bg-white backdrop-blur-sm"
//                     }`}
//                   />
//                 ))}
//               </div>
//             )}

//             {/* Low stock indicator - elegant design */}
//             {isLowStock && !isOutOfStock && (
//               <div className="absolute bottom-4 left-4 z-20">
//                 <div className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold rounded-full shadow-lg backdrop-blur-sm animate-pulse">
//                   <div className="flex items-center gap-1.5">
//                     <Zap size={12} />
//                     <span>Only {product.stock} left!</span>
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Content Container with elegant styling */}
//           <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-white to-slate-50/50">
//             {/* Category with amber accent */}
//             <div className="flex items-center justify-between mb-3">
//               <div className="flex items-center gap-2">
//                 <div className="p-1.5 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
//                   <Tag size={12} className="text-amber-600" />
//                 </div>
//                 <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
//                   {product.category || "Uncategorized"}
//                 </span>
//               </div>
//               {product.brand && (
//                 <span className="text-xs font-medium text-slate-400">
//                   {product.brand}
//                 </span>
//               )}
//             </div>

//             {/* Title with hover effect */}
//             <h3 className="font-bold text-amber-500 bg-slate-800 px-2 py- rounded-lg text-lg mb-3 line-clamp-1 group-hover:text-amber-600 transition-colors duration-300">
//               {product.title}
//             </h3>

//             {/* Description with subtle text */}
//             <p className="text-slate-600 text-sm mb-4 line-clamp-2 flex-1 leading-relaxed">
//               {product.description ||
//                 "Premium quality product with exceptional craftsmanship"}
//             </p>

//             {/* Rating section with amber stars */}
//             {product.rating !== undefined && product.rating > 0 && (
//               <div className="flex items-center gap-2 mb-4">
//                 <div className="flex bg-gradient-to-br from-amber-50 to-amber-100 p-1.5 rounded-lg border border-amber-200">
//                   {[...Array(5)].map((_, i) => (
//                     <Star
//                       key={i}
//                       size={14}
//                       className={`${
//                         i < Math.floor(product.rating!)
//                           ? "text-amber-500 fill-amber-500"
//                           : "text-slate-300 fill-slate-300"
//                       }`}
//                     />
//                   ))}
//                 </div>
//                 <div className="flex items-center gap-1">
//                   <span className="text-sm font-bold text-slate-900">
//                     {product.rating.toFixed(1)}
//                   </span>
//                   {product.reviewCount && (
//                     <span className="text-xs text-slate-400">
//                       ({product.reviewCount})
//                     </span>
//                   )}
//                 </div>
//               </div>
//             )}

//             {/* ✅ FIXED: Price section with correct calculation */}
//             <div className="mb-5">
//               <div className="flex items-baseline gap-3 mb-2">
//                 <span className="text-2xl font-bold text-slate-900 tracking-tight">
//                   ৳{displayPrice.toLocaleString()}
//                 </span>

//                 {/* Original price with line-through - only show if there's an offer */}
//                 {hasOffer && originalPrice > displayPrice && (
//                   <span className="text-base text-slate-400 line-through font-medium">
//                     ৳{originalPrice.toLocaleString()}
//                   </span>
//                 )}
//               </div>

//               {/* Save amount with amber accent - only show if there's an offer */}
//               {hasOffer && discountAmount > 0 && (
//                 <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-full border border-emerald-200">
//                   <span className="text-xs font-semibold text-emerald-700">
//                     💰 Save ৳{discountAmount.toLocaleString()}
//                     {discountPercentage > 0 && ` (${discountPercentage}%)`}
//                   </span>
//                 </div>
//               )}
//             </div>

//             {/* Add to Cart Button - Elegant design with AMBER hover */}
//             <div className="mt-auto pt-5 border-t border-slate-100">
//               <motion.button
//                 onClick={handleAddToCart}
//                 disabled={isOutOfStock}
//                 whileTap={{ scale: 0.98 }}
//                 whileHover={{ scale: 1.02 }}
//                 className={`
//                   w-full py-3.5 rounded-xl font-bold transition-all duration-300
//                   flex items-center justify-center gap-3 relative overflow-hidden
//                   group/btn
//                   ${
//                     isOutOfStock
//                       ? "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
//                       : "bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:text-amber-500 hover:bg-gradient-to-r hover:from-slate-950 hover:to-slate-800 hover:shadow-lg hover:shadow-amber-500/30"
//                   }
//                 `}
//               >
//                 {/* Button content */}
//                 <div className="relative z-10 flex items-center justify-center gap-3">
//                   {isAnimating ? (
//                     <motion.div
//                       animate={{ rotate: 360 }}
//                       transition={{
//                         duration: 1,
//                         repeat: Infinity,
//                         ease: "linear",
//                       }}
//                       className="text-amber-300"
//                     >
//                       <Sparkles size={18} />
//                     </motion.div>
//                   ) : (
//                     <>
//                       <ShoppingCart
//                         size={18}
//                         className={
//                           isOutOfStock
//                             ? "text-slate-400"
//                             : "text-white group-hover/btn:text-amber-500 transition-colors duration-300"
//                         }
//                       />
//                       <span
//                         className={
//                           isOutOfStock
//                             ? "text-slate-400"
//                             : "text-white group-hover/btn:text-amber-500 transition-colors duration-300"
//                         }
//                       >
//                         {isOutOfStock ? "Out of Stock" : "Add to Cart"}
//                       </span>
//                     </>
//                   )}
//                 </div>

//                 {/* Arrow icon on hover */}
//                 {!isOutOfStock && (
//                   <ArrowRight
//                     size={16}
//                     className="absolute right-4 text-amber-500 opacity-0 group-hover/btn:opacity-100 translate-x-2 group-hover/btn:translate-x-0 transition-all duration-300"
//                   />
//                 )}
//               </motion.button>
//             </div>
//           </div>

//           {/* Premium hover border effect */}
//           <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

//           {/* Corner accent */}
//           <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
//         </div>

//         {/* Subtle floating effect on hover */}
//         <motion.div
//           className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/5 rounded-xl -z-10"
//           animate={isHovered ? { opacity: 1 } : { opacity: 0 }}
//           transition={{ duration: 0.3 }}
//         />
//       </motion.div>
//     </Link>
//   );
// }

// export default memo(ProductCard);