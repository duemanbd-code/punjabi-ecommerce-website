// client/src/app/search/page.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Filter, X, ChevronRight, Package, Grid, List } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  additionalImages?: string[];
  normalPrice: number;
  originalPrice?: number;
  offerPrice?: number;
  salePrice?: number;
  discountPercentage?: number;
  rating?: number;
  reviewCount?: number;
  isBestSelling?: boolean;
  isNew?: boolean;
  featured?: boolean;
  stock?: number;
  brand?: string;
  sizes?: any[];
  colors?: any[];
  tags?: string[];
  slug?: string;
  category?: string;
}

// Image URL helper
const getImageUrl = (url: string | undefined): string => {
  if (!url || url.trim() === "") {
    return "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  if (url.includes('undefined')) {
    return "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop";
  }

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  
  let cleanUrl = url;
  
  if (cleanUrl.startsWith('/')) {
    cleanUrl = cleanUrl.substring(1);
  }
  
  if (cleanUrl.includes('/uploads/')) {
    return `${API_URL}/${cleanUrl}`;
  }
  
  if (cleanUrl.startsWith('uploads/')) {
    return `${API_URL}/${cleanUrl}`;
  }
  
  return `${API_URL}/uploads/${cleanUrl}`;
};

// Product Card Component
import { ShoppingCart, Eye, Star, Tag, Heart, Zap, Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

function ProductCard({ product, viewMode }: { product: Product; viewMode: "grid" | "list" }) {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Calculate price data
  const calculatePriceData = () => {
    let displayPrice = product.normalPrice;
    let originalPrice = product.originalPrice || product.normalPrice;
    let hasOffer = false;
    let discountPercentage = 0;
    
    if (product.salePrice && product.salePrice < product.normalPrice) {
      displayPrice = product.salePrice;
      originalPrice = product.normalPrice;
      hasOffer = true;
    } 
    else if (product.offerPrice && product.offerPrice < product.normalPrice) {
      displayPrice = product.offerPrice;
      originalPrice = product.normalPrice;
      hasOffer = true;
    }
    
    if (hasOffer && originalPrice > 0) {
      discountPercentage = Math.round(((originalPrice - displayPrice) / originalPrice) * 100);
    }
    
    if (product.discountPercentage && product.discountPercentage > 0) {
      discountPercentage = product.discountPercentage;
      hasOffer = true;
      if (product.originalPrice && product.normalPrice < product.originalPrice) {
        displayPrice = product.normalPrice;
        originalPrice = product.originalPrice;
      }
    }
    
    return {
      displayPrice,
      originalPrice,
      hasOffer,
      discountPercentage,
      discountAmount: hasOffer ? originalPrice - displayPrice : 0,
    };
  };

  const priceData = calculatePriceData();
  const { displayPrice, originalPrice, hasOffer, discountPercentage, discountAmount } = priceData;

  const isOutOfStock = product.stock === 0;

  // Get badge
  const getBadge = () => {
    if (isOutOfStock)
      return { text: "Out of Stock", color: "bg-slate-700 text-white" };
    if (product.isBestSelling)
      return {
        text: "Bestseller",
        color: "bg-gradient-to-r from-amber-500 to-amber-600 text-white",
      };
    if (hasOffer && discountPercentage >= 50)
      return {
        text: "Mega Sale",
        color: "bg-gradient-to-r from-rose-500 to-rose-600 text-white",
      };
    if (hasOffer && discountPercentage >= 30)
      return {
        text: "Flash Sale",
        color: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
      };
    if (hasOffer)
      return {
        text: "Sale",
        color: "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white",
      };
    if (product.isNew)
      return {
        text: "New Arrival",
        color: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
      };
    return null;
  };

  const badge = getBadge();

  // Get all images
  const getAllImages = () => {
    const images = [];
    if (product.imageUrl) images.push(product.imageUrl);
    if (product.additionalImages) images.push(...product.additionalImages);
    return images;
  };

  const images = getAllImages();

  // Grid View
  return (
    <Link href={`/product/${product.slug || product._id}`} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="group relative h-full"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`
          bg-white rounded-xl overflow-hidden
          shadow-lg hover:shadow-2xl transition-all duration-500 cursor-pointer
          border border-slate-100 hover:border-amber-200
          ${isOutOfStock ? "opacity-80" : ""}
          flex flex-col h-full
          before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/50 before:to-amber-50/30 before:opacity-0 before:hover:opacity-100 before:transition-opacity before:duration-500
        `}>
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 z-20"></div>

          {/* Image Container */}
          <div className="relative h-64 overflow-hidden">
            {/* Amber gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 via-transparent to-transparent z-10"></div>

            {/* Image with elegant hover effect */}
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={getImageUrl(images[currentImageIndex] || product.imageUrl)}
                alt={product.title}
                className={`w-full h-full object-cover transition-all duration-700 ${
                  isHovered ? "scale-110 brightness-110" : "scale-100"
                }`}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop";
                }}
              />

              {/* Animated overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-amber-900/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            </div>

            {/* Premium badge */}
            {badge && (
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`absolute top-4 left-4 z-20 ${badge.color} text-white font-bold text-xs px-4 py-1.5 rounded-full shadow-lg backdrop-blur-sm`}
              >
                <div className="flex items-center gap-1.5">
                  {badge.text === "Bestseller" && <Sparkles size={10} />}
                  {badge.text === "New Arrival" && <Sparkles size={10} />}
                  {badge.text === "Flash Sale" && <Zap size={10} />}
                  <span className="font-semibold tracking-wide">
                    {badge.text}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Discount badge */}
            {hasOffer && discountPercentage > 0 && !isOutOfStock && (
              <div className="absolute top-4 left-16 z-20">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-rose-500 to-rose-600 rounded-full blur-sm"></div>
                  <div className="relative px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-sm font-bold rounded-full shadow-lg">
                    -{discountPercentage}%
                  </div>
                </div>
              </div>
            )}

            {/* Wishlist Button */}
            <div className="absolute top-4 right-4 z-20">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                whileTap={{ scale: 0.9 }}
                whileHover={{ scale: 1.1 }}
                className={`
                  p-2.5 rounded-full shadow-lg transition-all duration-300 backdrop-blur-sm
                  bg-white/95 text-slate-700 border border-slate-200 hover:bg-gradient-to-r hover:from-rose-50 hover:to-rose-100 hover:text-rose-600 hover:border-rose-200 hover:shadow-xl
                `}
              >
                <Heart
                  size={18}
                  className="group-hover:fill-rose-400 transition-all duration-300"
                />
              </motion.button>
            </div>

            {/* Image navigation dots */}
            {images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1.5 z-20">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentImageIndex(index);
                    }}
                    className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      index === currentImageIndex
                        ? "bg-amber-500 w-6 shadow-lg shadow-amber-500/50"
                        : "bg-white/80 hover:bg-white backdrop-blur-sm"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Content Container */}
          <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-white to-slate-50/50">
            {/* Category */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                  <Tag size={12} className="text-amber-600" />
                </div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {product.category || "Uncategorized"}
                </span>
              </div>
              {product.brand && (
                <span className="text-xs font-medium text-slate-400">
                  {product.brand}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="font-bold text-slate-900 text-lg mb-2 line-clamp-1 group-hover:text-amber-600 transition-colors duration-300">
              {product.title}
            </h3>
            
            {/* Description */}
            <p className="text-slate-600 text-sm mb-3 line-clamp-2 flex-1">
              {product.description || "Premium quality product with exceptional craftsmanship"}
            </p>

            {/* Rating */}
            {product.rating !== undefined && product.rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex bg-gradient-to-br from-amber-50 to-amber-100 p-1.5 rounded-lg border border-amber-200">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={12}
                      className={`${
                        i < Math.floor(product.rating!)
                          ? "text-amber-500 fill-amber-500"
                          : "text-slate-300 fill-slate-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs font-bold text-slate-900">
                  {product.rating.toFixed(1)}
                </span>
              </div>
            )}

            {/* Price */}
            <div className="mb-4">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  ৳{displayPrice.toLocaleString()}
                </span>
                {hasOffer && originalPrice > displayPrice && (
                  <span className="text-sm text-slate-400 line-through font-medium">
                    ৳{originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {hasOffer && discountAmount > 0 && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-full border border-emerald-200">
                  <span className="text-xs font-semibold text-emerald-700">
                    Save ৳{discountAmount.toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* Add to Cart Button */}
            <div className="mt-auto">
              <motion.button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
                disabled={isOutOfStock}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.02 }}
                className={`
                  w-full py-3 rounded-xl font-bold transition-all duration-300
                  flex items-center justify-center gap-2 relative overflow-hidden
                  group/btn
                  ${
                    isOutOfStock
                      ? "bg-gradient-to-r from-slate-100 to-slate-200 text-slate-400 cursor-not-allowed border border-slate-200"
                      : "bg-gradient-to-r from-slate-900 to-slate-700 text-white hover:text-amber-500 hover:bg-gradient-to-r hover:from-slate-950 hover:to-slate-800 hover:shadow-lg hover:shadow-amber-500/30"
                  }
                `}
              >
                <div className="relative z-10 flex items-center justify-center gap-2">
                  <ShoppingCart
                    size={16}
                    className={
                      isOutOfStock
                        ? "text-slate-400"
                        : "text-white group-hover/btn:text-amber-500 transition-colors duration-300"
                    }
                  />
                  <span
                    className={
                      isOutOfStock
                        ? "text-slate-400"
                        : "text-white group-hover/btn:text-amber-500 transition-colors duration-300"
                    }
                  >
                    {isOutOfStock ? "Out of Stock" : "Add to Cart"}
                  </span>
                </div>
                {!isOutOfStock && (
                  <ArrowRight
                    size={14}
                    className="absolute right-3 text-amber-500 opacity-0 group-hover/btn:opacity-100 translate-x-2 group-hover/btn:translate-x-0 transition-all duration-300"
                  />
                )}
              </motion.button>
            </div>
          </div>

          {/* Premium hover border effect */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-400/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

          {/* Corner accent */}
          <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-br from-amber-500/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
        </div>
      </motion.div>
    </Link>
  );
}

// Main Search Component
function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [priceFilter, setPriceFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [categories, setCategories] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [query]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_URL}/api/products`);
      
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }
      
      const data = await response.json();
      let productData: Product[] = [];
      
      if (Array.isArray(data)) {
        productData = data;
      } else if (data?.data && Array.isArray(data.data)) {
        productData = data.data;
      }
      
      const searchTerm = query.toLowerCase();
      const filtered = productData.filter(product => {
        const titleMatch = product.title?.toLowerCase().includes(searchTerm);
        const descMatch = product.description?.toLowerCase().includes(searchTerm);
        const categoryMatch = product.category?.toLowerCase().includes(searchTerm);
        
        return titleMatch || descMatch || categoryMatch;
      });
      
      const sorted = filtered.sort((a, b) => {
        const aTitleMatch = a.title?.toLowerCase().startsWith(searchTerm);
        const bTitleMatch = b.title?.toLowerCase().startsWith(searchTerm);
        
        if (aTitleMatch && !bTitleMatch) return -1;
        if (!aTitleMatch && bTitleMatch) return 1;
        
        const aCategoryMatch = a.category?.toLowerCase().includes(searchTerm);
        const bCategoryMatch = b.category?.toLowerCase().includes(searchTerm);
        
        if (aCategoryMatch && !bCategoryMatch) return -1;
        if (!aCategoryMatch && bCategoryMatch) return 1;
        
        return 0;
      });
      
      const uniqueCategories = Array.from(
        new Set(sorted.map(p => p.category).filter(Boolean))
      ) as string[];
      
      setProducts(sorted);
      setFilteredProducts(sorted);
      setCategories(uniqueCategories);
      
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Failed to search products");
      setProducts([]);
      setFilteredProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...products];
    
    if (categoryFilter !== "all") {
      result = result.filter(product => product.category === categoryFilter);
    }
    
    if (priceFilter !== "all") {
      switch (priceFilter) {
        case "under-1000":
          result = result.filter(p => p.normalPrice < 1000);
          break;
        case "1000-3000":
          result = result.filter(p => p.normalPrice >= 1000 && p.normalPrice <= 3000);
          break;
        case "3000-5000":
          result = result.filter(p => p.normalPrice > 3000 && p.normalPrice <= 5000);
          break;
        case "above-5000":
          result = result.filter(p => p.normalPrice > 5000);
          break;
      }
    }
    
    switch (sortBy) {
      case "price-low-high":
        result.sort((a, b) => a.normalPrice - b.normalPrice);
        break;
      case "price-high-low":
        result.sort((a, b) => b.normalPrice - a.normalPrice);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "relevance":
        break;
    }
    
    setFilteredProducts(result);
  }, [categoryFilter, priceFilter, sortBy, products]);

  const clearFilters = () => {
    setCategoryFilter("all");
    setPriceFilter("all");
    setSortBy("relevance");
    setFilteredProducts(products);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-slate-950 to-slate-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <div className="flex items-center text-sm text-gray-300 mb-2">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
              <ChevronRight size={16} className="mx-2" />
              <span>Search Results</span>
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              Search Results for: <span className="text-amber-400">"{query}"</span>
            </h1>
            <p className="text-gray-300">
              {loading ? "Searching..." : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} found`}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Filter size={20} className="text-amber-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
                </div>
                {(categoryFilter !== "all" || priceFilter !== "all") && (
                  <button 
                    onClick={clearFilters}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                  >
                    <X size={16} />
                    Clear
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Category</h4>
                <div className="space-y-2">
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${
                      categoryFilter === "all" 
                        ? "bg-amber-50 text-amber-700" 
                        : "hover:bg-gray-50 text-gray-700"
                    }`}
                  >
                    <span>All Categories</span>
                    <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                      {products.length}
                    </span>
                  </button>
                  
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setCategoryFilter(category)}
                      className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${
                        categoryFilter === category 
                          ? "bg-amber-50 text-amber-700" 
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span>{category}</span>
                      <span className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {products.filter(p => p.category === category).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
                <div className="space-y-2">
                  {[
                    { id: "all", label: "All Prices" },
                    { id: "under-1000", label: "Under ৳1,000" },
                    { id: "1000-3000", label: "৳1,000 - ৳3,000" },
                    { id: "3000-5000", label: "৳3,000 - ৳5,000" },
                    { id: "above-5000", label: "Above ৳5,000" },
                  ].map((price) => (
                    <button
                      key={price.id}
                      onClick={() => setPriceFilter(price.id)}
                      className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                        priceFilter === price.id 
                          ? "bg-amber-50 text-amber-700" 
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span>{price.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
                <div className="space-y-2">
                  {[
                    { id: "relevance", label: "Relevance" },
                    { id: "price-low-high", label: "Price: Low to High" },
                    { id: "price-high-low", label: "Price: High to Low" },
                    { id: "rating", label: "Highest Rated" },
                  ].map((sort) => (
                    <button
                      key={sort.id}
                      onClick={() => setSortBy(sort.id)}
                      className={`flex items-center w-full p-2 rounded-lg transition-colors ${
                        sortBy === sort.id 
                          ? "bg-amber-50 text-amber-700" 
                          : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span>{sort.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:w-3/4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {loading ? "Searching..." : `Showing ${filteredProducts.length} results`}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Search results for "{query}"
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 ${viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    <Grid size={20} className={viewMode === "grid" ? "text-amber-600" : "text-gray-500"} />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 ${viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                  >
                    <List size={20} className={viewMode === "list" ? "text-amber-600" : "text-gray-500"} />
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                <p className="mt-4 text-gray-600">Searching products for "{query}"...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
                <div className="text-red-600 text-4xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Search Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={() => fetchSearchResults()}
                  className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
                <Package size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-600 mb-6">
                  We couldn't find any products matching "{query}"
                </p>
                <div className="space-y-4 max-w-md mx-auto">
                  <p className="text-sm text-gray-500">Suggestions:</p>
                  <ul className="text-left text-gray-600 space-y-1">
                    <li>• Check your spelling</li>
                    <li>• Try different keywords</li>
                    <li>• Use more general terms</li>
                    <li>• Browse categories instead</li>
                  </ul>
                  <Link
                    href="/"
                    className="inline-block px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors mt-4"
                  >
                    Browse All Products
                  </Link>
                </div>
              </div>
            ) : (
              <div className={viewMode === "grid" 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-6"
              }>
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product._id} 
                    product={product} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
          <p className="text-gray-600">Loading search results...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

// // client/src/app/search/page.tsx

// "use client";

// import { useState, useEffect, Suspense } from "react";
// import { useSearchParams } from "next/navigation";
// import Link from "next/link";
// import { Filter, X, ChevronRight, Package, Grid, List } from "lucide-react";

// interface Product {
//   _id: string;
//   title: string;
//   description?: string;
//   imageUrl?: string;
//   normalPrice: number;
//   originalPrice?: number;
//   category?: string;
//   rating?: number;
//   slug?: string;
// }

// // Main Search Component that uses useSearchParams
// function SearchContent() {
//   const searchParams = useSearchParams();
//   const query = searchParams.get("q") || "";
  
//   const [products, setProducts] = useState<Product[]>([]);
//   const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [categoryFilter, setCategoryFilter] = useState<string>("all");
//   const [priceFilter, setPriceFilter] = useState<string>("all");
//   const [sortBy, setSortBy] = useState<string>("relevance");
//   const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
//   const [categories, setCategories] = useState<string[]>([]);

//   const API_URL = process.env.NEXT_PUBLIC_API_URL;

//   // Fetch products when query changes
//   useEffect(() => {
//     if (query) {
//       fetchSearchResults();
//     }
//   }, [query]);

//   const fetchSearchResults = async () => {
//     try {
//       setLoading(true);
//       setError(null);
      
//       // Fetch products from API - FIXED: Use proper template literal
//       const response = await fetch(`${API_URL}/api/products`);
      
//       if (!response.ok) {
//         throw new Error("Failed to fetch products");
//       }
      
//       const data = await response.json();
//       let productData: Product[] = [];
      
//       // Handle different API response structures
//       if (Array.isArray(data)) {
//         productData = data;
//       } else if (data?.data && Array.isArray(data.data)) {
//         productData = data.data;
//       }
      
//       // Filter products based on search query
//       const searchTerm = query.toLowerCase();
//       const filtered = productData.filter(product => {
//         // Search in title, description, and category
//         const titleMatch = product.title?.toLowerCase().includes(searchTerm);
//         const descMatch = product.description?.toLowerCase().includes(searchTerm);
//         const categoryMatch = product.category?.toLowerCase().includes(searchTerm);
        
//         return titleMatch || descMatch || categoryMatch;
//       });
      
//       // Sort products based on relevance
//       const sorted = filtered.sort((a, b) => {
//         // Prioritize exact title matches
//         const aTitleMatch = a.title?.toLowerCase().startsWith(searchTerm);
//         const bTitleMatch = b.title?.toLowerCase().startsWith(searchTerm);
        
//         if (aTitleMatch && !bTitleMatch) return -1;
//         if (!aTitleMatch && bTitleMatch) return 1;
        
//         // Then prioritize category matches
//         const aCategoryMatch = a.category?.toLowerCase().includes(searchTerm);
//         const bCategoryMatch = b.category?.toLowerCase().includes(searchTerm);
        
//         if (aCategoryMatch && !bCategoryMatch) return -1;
//         if (!aCategoryMatch && bCategoryMatch) return 1;
        
//         return 0;
//       });
      
//       // Extract unique categories
//       const uniqueCategories = Array.from(
//         new Set(sorted.map(p => p.category).filter(Boolean))
//       ) as string[];
      
//       setProducts(sorted);
//       setFilteredProducts(sorted);
//       setCategories(uniqueCategories);
      
//     } catch (err: any) {
//       console.error("Search error:", err);
//       setError(err.message || "Failed to search products");
//       setProducts([]);
//       setFilteredProducts([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Apply filters and sorting
//   useEffect(() => {
//     let result = [...products];
    
//     // Apply category filter
//     if (categoryFilter !== "all") {
//       result = result.filter(product => product.category === categoryFilter);
//     }
    
//     // Apply price filter
//     if (priceFilter !== "all") {
//       switch (priceFilter) {
//         case "under-1000":
//           result = result.filter(p => p.normalPrice < 1000);
//           break;
//         case "1000-3000":
//           result = result.filter(p => p.normalPrice >= 1000 && p.normalPrice <= 3000);
//           break;
//         case "3000-5000":
//           result = result.filter(p => p.normalPrice > 3000 && p.normalPrice <= 5000);
//           break;
//         case "above-5000":
//           result = result.filter(p => p.normalPrice > 5000);
//           break;
//       }
//     }
    
//     // Apply sorting
//     switch (sortBy) {
//       case "price-low-high":
//         result.sort((a, b) => a.normalPrice - b.normalPrice);
//         break;
//       case "price-high-low":
//         result.sort((a, b) => b.normalPrice - a.normalPrice);
//         break;
//       case "rating":
//         result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
//         break;
//       case "relevance":
//         // Already sorted by relevance
//         break;
//     }
    
//     setFilteredProducts(result);
//   }, [categoryFilter, priceFilter, sortBy, products]);

//   const clearFilters = () => {
//     setCategoryFilter("all");
//     setPriceFilter("all");
//     setSortBy("relevance");
//     setFilteredProducts(products);
//   };

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Search Header */}
//       <div className="bg-gradient-to-r from-slate-950 to-slate-800 text-white py-8">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="mb-6">
//             <div className="flex items-center text-sm text-gray-300 mb-2">
//               <Link href="/" className="hover:text-amber-400 transition-colors">
//                 Home
//               </Link>
//               <ChevronRight size={16} className="mx-2" />
//               <span>Search Results</span>
//             </div>
            
//             <h1 className="text-3xl md:text-4xl font-bold mb-2">
//               Search Results for: <span className="text-amber-400">"{query}"</span>
//             </h1>
//             <p className="text-gray-300">
//               {loading ? "Searching..." : `${filteredProducts.length} ${filteredProducts.length === 1 ? 'product' : 'products'} found`}
//             </p>
//           </div>
//         </div>
//       </div>

//       <div className="max-w-7xl mx-auto px-4 py-8">
//         <div className="flex flex-col lg:flex-row gap-8">
//           {/* Filters Sidebar */}
//           <div className="lg:w-1/4">
//             <div className="bg-white rounded-xl shadow-sm border p-6 sticky top-24">
//               <div className="flex items-center justify-between mb-6">
//                 <div className="flex items-center gap-2">
//                   <Filter size={20} className="text-amber-600" />
//                   <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
//                 </div>
//                 {(categoryFilter !== "all" || priceFilter !== "all") && (
//                   <button 
//                     onClick={clearFilters}
//                     className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
//                   >
//                     <X size={16} />
//                     Clear
//                   </button>
//                 )}
//               </div>

//               {/* Category Filter */}
//               <div className="mb-6">
//                 <h4 className="font-medium text-gray-900 mb-3">Category</h4>
//                 <div className="space-y-2">
//                   <button
//                     onClick={() => setCategoryFilter("all")}
//                     className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${
//                       categoryFilter === "all" 
//                         ? "bg-amber-50 text-amber-700" 
//                         : "hover:bg-gray-50 text-gray-700"
//                     }`}
//                   >
//                     <span>All Categories</span>
//                     <span className="text-sm bg-gray-100 px-2 py-1 rounded">
//                       {products.length}
//                     </span>
//                   </button>
                  
//                   {categories.map((category) => (
//                     <button
//                       key={category}
//                       onClick={() => setCategoryFilter(category)}
//                       className={`flex items-center justify-between w-full p-2 rounded-lg transition-colors ${
//                         categoryFilter === category 
//                           ? "bg-amber-50 text-amber-700" 
//                           : "hover:bg-gray-50 text-gray-700"
//                       }`}
//                     >
//                       <span>{category}</span>
//                       <span className="text-sm bg-gray-100 px-2 py-1 rounded">
//                         {products.filter(p => p.category === category).length}
//                       </span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Price Filter */}
//               <div className="mb-6">
//                 <h4 className="font-medium text-gray-900 mb-3">Price Range</h4>
//                 <div className="space-y-2">
//                   {[
//                     { id: "all", label: "All Prices" },
//                     { id: "under-1000", label: "Under ৳1,000" },
//                     { id: "1000-3000", label: "৳1,000 - ৳3,000" },
//                     { id: "3000-5000", label: "৳3,000 - ৳5,000" },
//                     { id: "above-5000", label: "Above ৳5,000" },
//                   ].map((price) => (
//                     <button
//                       key={price.id}
//                       onClick={() => setPriceFilter(price.id)}
//                       className={`flex items-center w-full p-2 rounded-lg transition-colors ${
//                         priceFilter === price.id 
//                           ? "bg-amber-50 text-amber-700" 
//                           : "hover:bg-gray-50 text-gray-700"
//                       }`}
//                     >
//                       <span>{price.label}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* Sort Options */}
//               <div className="mb-6">
//                 <h4 className="font-medium text-gray-900 mb-3">Sort By</h4>
//                 <div className="space-y-2">
//                   {[
//                     { id: "relevance", label: "Relevance" },
//                     { id: "price-low-high", label: "Price: Low to High" },
//                     { id: "price-high-low", label: "Price: High to Low" },
//                     { id: "rating", label: "Highest Rated" },
//                   ].map((sort) => (
//                     <button
//                       key={sort.id}
//                       onClick={() => setSortBy(sort.id)}
//                       className={`flex items-center w-full p-2 rounded-lg transition-colors ${
//                         sortBy === sort.id 
//                           ? "bg-amber-50 text-amber-700" 
//                           : "hover:bg-gray-50 text-gray-700"
//                       }`}
//                     >
//                       <span>{sort.label}</span>
//                     </button>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Results Section */}
//           <div className="lg:w-3/4">
//             {/* Results Header */}
//             <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
//               <div>
//                 <h2 className="text-lg font-semibold text-gray-900">
//                   {loading ? "Searching..." : `Showing ${filteredProducts.length} results`}
//                 </h2>
//                 <p className="text-sm text-gray-600 mt-1">
//                   Search results for "{query}"
//                 </p>
//               </div>
              
//               {/* View Toggle */}
//               <div className="flex items-center gap-4">
//                 <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
//                   <button
//                     onClick={() => setViewMode("grid")}
//                     className={`p-2 ${viewMode === "grid" ? "bg-gray-100" : "hover:bg-gray-50"}`}
//                   >
//                     <Grid size={20} className={viewMode === "grid" ? "text-amber-600" : "text-gray-500"} />
//                   </button>
//                   <button
//                     onClick={() => setViewMode("list")}
//                     className={`p-2 ${viewMode === "list" ? "bg-gray-100" : "hover:bg-gray-50"}`}
//                   >
//                     <List size={20} className={viewMode === "list" ? "text-amber-600" : "text-gray-500"} />
//                   </button>
//                 </div>
//               </div>
//             </div>

//             {/* Loading State */}
//             {loading ? (
//               <div className="text-center py-12">
//                 <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
//                 <p className="mt-4 text-gray-600">Searching products for "{query}"...</p>
//               </div>
//             ) : error ? (
//               <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
//                 <div className="text-red-600 text-4xl mb-4">⚠️</div>
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">Search Error</h3>
//                 <p className="text-gray-600 mb-4">{error}</p>
//                 <button
//                   onClick={() => fetchSearchResults()}
//                   className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
//                 >
//                   Try Again
//                 </button>
//               </div>
//             ) : filteredProducts.length === 0 ? (
//               <div className="bg-white rounded-xl shadow-sm border p-8 text-center">
//                 <Package size={48} className="mx-auto text-gray-400 mb-4" />
//                 <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
//                 <p className="text-gray-600 mb-6">
//                   We couldn't find any products matching "{query}"
//                 </p>
//                 <div className="space-y-4 max-w-md mx-auto">
//                   <p className="text-sm text-gray-500">Suggestions:</p>
//                   <ul className="text-left text-gray-600 space-y-1">
//                     <li>• Check your spelling</li>
//                     <li>• Try different keywords</li>
//                     <li>• Use more general terms</li>
//                     <li>• Browse categories instead</li>
//                   </ul>
//                   <Link
//                     href="/"
//                     className="inline-block px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors mt-4"
//                   >
//                     Browse All Products
//                   </Link>
//                 </div>
//               </div>
//             ) : (
//               <div className={viewMode === "grid" 
//                 ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
//                 : "space-y-4"
//               }>
//                 {filteredProducts.map((product) => (
//                   <ProductCard 
//                     key={product._id} 
//                     product={product} 
//                     viewMode={viewMode}
//                   />
//                 ))}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Product Card Component
// function ProductCard({ product, viewMode }: { product: Product, viewMode: "grid" | "list" }) {
//   if (viewMode === "list") {
//     return (
//       <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border p-6 flex flex-col md:flex-row gap-6">
//         {/* Product Image */}
//         <div className="md:w-1/4">
//           <img
//             src={product.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80"}
//             alt={product.title}
//             className="w-full h-48 object-cover rounded-lg"
//           />
//         </div>
        
//         {/* Product Info */}
//         <div className="md:w-3/4">
//           <div className="flex flex-col h-full">
//             <div className="mb-4">
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 {product.title}
//               </h3>
              
//               <p className="text-gray-600 mb-3 line-clamp-2">
//                 {product.description || "Premium Punjabi wear with traditional craftsmanship"}
//               </p>
              
//               {product.category && (
//                 <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full mb-3">
//                   {product.category}
//                 </span>
//               )}
//             </div>
            
//             <div className="mt-auto flex items-center justify-between">
//               <div>
//                 <div className="text-2xl font-bold text-gray-900">
//                   ৳ {product.normalPrice.toLocaleString()}
//                 </div>
//                 {product.originalPrice && product.originalPrice > product.normalPrice && (
//                   <div className="text-sm text-gray-500 line-through">
//                     ৳ {product.originalPrice.toLocaleString()}
//                   </div>
//                 )}
//               </div>
              
//               <Link
//                 href={`/product/${product.slug || product._id}`}
//                 className="px-6 py-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-lg hover:from-slate-800 hover:to-slate-600 transition-colors"
//               >
//                 View Details
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Grid View (default)
//   return (
//     <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border overflow-hidden group">
//       {/* Product Image */}
//       <div className="relative overflow-hidden">
//         <img
//           src={product.imageUrl || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80"}
//           alt={product.title}
//           className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
//         />
        
//         {/* Category Badge */}
//         {product.category && (
//           <div className="absolute top-4 left-4">
//             <span className="px-3 py-1 bg-black/70 text-white text-xs rounded-full">
//               {product.category}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Product Info */}
//       <div className="p-5">
//         <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
//           {product.title}
//         </h3>
        
//         <p className="text-gray-600 text-sm mb-3 line-clamp-2">
//           {product.description || "Premium Punjabi wear with traditional craftsmanship"}
//         </p>
        
//         {/* Rating */}
//         {product.rating !== undefined && (
//           <div className="flex items-center mb-4">
//             <div className="flex text-yellow-400">
//               {[1, 2, 3, 4, 5].map((star) => (
//                 <svg
//                   key={star}
//                   className={`w-4 h-4 ${star <= Math.floor(product.rating || 0) ? "text-yellow-400" : "text-gray-300"}`}
//                   fill={star <= Math.floor(product.rating || 0) ? "currentColor" : "none"}
//                   viewBox="0 0 20 20"
//                 >
//                   <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
//                 </svg>
//               ))}
//             </div>
//             <span className="text-sm text-gray-500 ml-1">
//               ({product.rating?.toFixed(1) || '0.0'})
//             </span>
//           </div>
//         )}
        
//         {/* Price */}
//         <div className="flex items-center justify-between">
//           <div className="flex items-center gap-2">
//             <span className="text-xl font-bold text-gray-900">
//               ৳ {product.normalPrice.toLocaleString()}
//             </span>
//             {product.originalPrice && product.originalPrice > product.normalPrice && (
//               <span className="text-sm text-gray-500 line-through">
//                 ৳ {product.originalPrice.toLocaleString()}
//               </span>
//             )}
//           </div>
          
//           <Link
//             href={`/product/${product.slug || product._id}`}
//             className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white text-sm rounded-lg hover:from-slate-800 hover:to-slate-600 transition-colors"
//           >
//             View Details
//           </Link>
//         </div>
//       </div>
//     </div>
//   );
// }

// // Main Page Component with Suspense
// export default function SearchPage() {
//   return (
//     <Suspense fallback={
//       <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//         <div className="text-center">
//           <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mb-4"></div>
//           <p className="text-gray-600">Loading search results...</p>
//         </div>
//       </div>
//     }>
//       <SearchContent />
//     </Suspense>
//   );
// }