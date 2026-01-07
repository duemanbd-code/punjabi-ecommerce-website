// client/src/app/best-selling/page.tsx

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Filter,
  Search,
  Grid,
  List,
  X,
  TrendingUp,
  Sparkles,
  Award,
  Clock,
} from "lucide-react";
import ProductFilters from "@/components/ProductFilters";
import { Product } from "@/types/product.types";
import ProductCard from "@/components/ProductCard";

 

// Function to get the correct API URL based on environment
const getApiBaseUrl = (): string => {
  // First check for environment variable
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl) {
    // If env URL is provided, ensure it has the correct protocol
    if (!envUrl.startsWith('http')) {
      // For production environments, default to https
      if (process.env.NODE_ENV === 'production' || 
          (typeof window !== 'undefined' && window.location.hostname !== 'localhost')) {
        return `https://${envUrl}`;
      } else {
        return `http://${envUrl}`;
      }
    }
    return envUrl;
  }
  
  // If no env variable, detect based on current environment
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      console.log('🌐 Using local development API: http://localhost:4000');
      return 'http://localhost:4000';
    } else {
      console.log('🚀 Using production API: https://taskin-panjabi-server.onrender.com');
      return 'https://taskin-panjabi-server.onrender.com';
    }
  }
  
  // Server-side rendering - use environment or default to local
  return process.env.NODE_ENV === 'production' 
    ? 'https://taskin-panjabi-server.onrender.com'
    : 'http://localhost:4000';
};

// Get API URL with /api prefix
const getApiUrl = (): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api`;
};

// Define Size type if needed
interface SizeObject {
  size: string;
  stock: number;
  _id?: string;
}

const BestSellingPage = () => {
  // State variables
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showBestSellers, setShowBestSellers] = useState<boolean>(true);
  const [showNewArrivals, setShowNewArrivals] = useState<boolean>(false);
  const [showDiscount, setShowDiscount] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>(["all"]);
  const [sizes, setSizes] = useState<string[]>(["S", "M", "L", "XL", "XXL"]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(12);

  const API_URL = getApiUrl();

  // Fetch all products and filter best selling
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('🌐 Fetching best selling products from:', `${API_URL}/products`);
        
        const response = await axios.get<{ data: Product[] } | Product[]>(
          `${API_URL}/products`,
          {
            timeout: 15000, // 15 second timeout for production
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            }
          }
        );

        let productData: Product[] = [];

        if (Array.isArray(response.data)) {
          productData = response.data;
        } else if (response.data && response.data.data) {
          productData = response.data.data;
        } else {
          setProducts([]);
          return;
        }

        // Filter only best selling products
        const bestSellingProducts = productData.filter(
          (product) => product.isBestSelling
        );
        
        // Process image URLs to ensure they're full URLs
        const processedProducts = bestSellingProducts.map((product: any) => ({
          ...product,
          imageUrl: getFullImageUrl(product.imageUrl || product.image || product.thumbnail)
        }));
        
        setProducts(processedProducts);

        // Extract unique categories from best selling products
        const uniqueCategories = new Set<string>();
        processedProducts.forEach((product) => {
          if (product.category) {
            uniqueCategories.add(product.category);
          }
        });

        setCategories(["all", ...Array.from(uniqueCategories)]);

        // Extract unique sizes - handle both string array and object array
        const uniqueSizes = new Set<string>();
        processedProducts.forEach((product) => {
          if (
            product.sizes &&
            Array.isArray(product.sizes) &&
            product.sizes.length > 0
          ) {
            // Handle both string array and object array
            product.sizes.forEach((sizeItem) => {
              if (typeof sizeItem === "string") {
                uniqueSizes.add(sizeItem);
              } else if (
                typeof sizeItem === "object" &&
                sizeItem !== null &&
                "size" in sizeItem
              ) {
                uniqueSizes.add((sizeItem as SizeObject).size);
              }
            });
          }
        });

        if (uniqueSizes.size > 0) {
          // Sort sizes logically: S, M, L, XL, XXL, then numbers, then others
          const sortedSizes = Array.from(uniqueSizes).sort((a, b) => {
            const sizeOrder = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
            const indexA = sizeOrder.indexOf(a.toUpperCase());
            const indexB = sizeOrder.indexOf(b.toUpperCase());

            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            // If both are numbers
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
            if (!isNaN(numA)) return -1;
            if (!isNaN(numB)) return 1;

            // Alphabetical for others
            return a.localeCompare(b);
          });

          setSizes(sortedSizes);
        }
      } catch (error: any) {
        console.error("❌ Error fetching best selling products:", error);
        
        if (error.code === 'ECONNABORTED') {
          setError("Request timeout. Server might be starting up. Please try again in a moment.");
        } else if (error.response?.status === 404) {
          setError("Products endpoint not found. Please check the backend server.");
        } else if (error.response?.status === 500) {
          setError("Server error. Please try again later.");
        } else if (error.message === 'Network Error') {
          setError(`Cannot connect to server. Make sure backend is running at: ${getApiBaseUrl()}`);
        } else {
          setError(error.message || "Failed to load best selling products. Please try again later.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Helper function to get full image URL
  const getFullImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) {
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
    }
    
    // Already a full URL
    if (imagePath.startsWith('http') || imagePath.startsWith('data:') || imagePath.startsWith('blob:')) {
      return imagePath;
    }
    
    // Handle "undefined" in path
    if (imagePath.includes('undefined')) {
      console.error('Found "undefined" in image path:', imagePath);
      return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
    }
    
    // Convert relative path to full URL
    const baseUrl = getApiBaseUrl();
    
    // Remove leading slash if present
    const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
    
    // Check if it's a file in uploads folder
    if (imagePath.includes('uploads') || imagePath.includes('images')) {
      // If path already contains base URL, return as is
      if (imagePath.includes(baseUrl)) {
        return imagePath;
      }
      return `${baseUrl}/${cleanPath}`;
    }
    
    // Default to uploads folder
    return `${baseUrl}/uploads/${cleanPath}`;
  };

  // Check if product has selected size (handles both string and object arrays)
  const hasSelectedSize = useCallback(
    (product: Product, selectedSizes: string[]): boolean => {
      if (selectedSizes.length === 0) return true;

      if (!product.sizes || !Array.isArray(product.sizes)) return false;

      // Check each size item individually
      return product.sizes.some((sizeItem) => {
        if (typeof sizeItem === "string") {
          return selectedSizes.includes(sizeItem);
        } else if (typeof sizeItem === "object" && sizeItem !== null && "size" in sizeItem) {
          const sizeObj = sizeItem as SizeObject;
          return sizeObj.size && selectedSizes.includes(sizeObj.size);
        }
        return false;
      });
    },
    []
  );

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          (product.description &&
            product.description.toLowerCase().includes(query)) ||
          (product.category && product.category.toLowerCase().includes(query))
      );
    }

    // Apply price filter
    result = result.filter(
      (product) =>
        product.normalPrice >= priceRange[0] &&
        product.normalPrice <= priceRange[1]
    );

    // Apply rating filter
    if (ratingFilter > 0) {
      result = result.filter(
        (product) => product.rating && product.rating >= ratingFilter
      );
    }

    // Apply size filter
    if (selectedSizes.length > 0) {
      result = result.filter((product) =>
        hasSelectedSize(product, selectedSizes)
      );
    }

    // Apply product status filters
    result = result.filter((product) => {
      if (showBestSellers && !product.isBestSelling) return false;
      if (showNewArrivals && !product.isNew) return false;
      if (
        showDiscount &&
        (!product.discountPrice || product.discountPrice >= product.normalPrice)
      )
        return false;
      return true;
    });

    // Apply sorting
    switch (selectedSort) {
      case "price-low":
        result.sort((a, b) => a.normalPrice - b.normalPrice);
        break;
      case "price-high":
        result.sort((a, b) => b.normalPrice - a.normalPrice);
        break;
      case "rating":
        result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        result.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default: // "featured"
        result.sort((a, b) => {
          // Sort by best selling priority
          if (a.isBestSelling && !b.isBestSelling) return -1;
          if (!a.isBestSelling && b.isBestSelling) return 1;
          if (a.rating && b.rating) {
            if (Math.abs(a.rating - b.rating) > 0.5) {
              return b.rating - a.rating;
            }
          }
          return (b.popularity || 0) - (a.popularity || 0);
        });
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1);
  }, [
    products,
    selectedCategory,
    selectedSort,
    priceRange,
    ratingFilter,
    selectedSizes,
    showBestSellers,
    showNewArrivals,
    showDiscount,
    searchQuery,
    hasSelectedSize,
  ]);

  // Get max price for range slider
  const maxPrice = useMemo(() => {
    return Math.max(...products.map((p) => p.normalPrice), 1000);
  }, [products]);

  // Get paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Get total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset filters
  const resetFilters = useCallback(() => {
    setSelectedCategory("all");
    setSelectedSort("featured");
    setPriceRange([0, maxPrice]);
    setRatingFilter(0);
    setSelectedSizes([]);
    setShowBestSellers(true);
    setShowNewArrivals(false);
    setShowDiscount(false);
    setSearchQuery("");
  }, [maxPrice]);

  // Handle price range change
  const handlePriceRangeChange = (range: [number, number]) => {
    setPriceRange(range);
  };

  // Handle size toggle
  const handleSizeToggle = useCallback((size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  }, []);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedSort !== "featured") count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (ratingFilter > 0) count++;
    if (selectedSizes.length > 0) count++;
    if (showNewArrivals) count++;
    if (showDiscount) count++;
    if (searchQuery.trim() !== "") count++;
    return count;
  }, [
    selectedCategory,
    selectedSort,
    priceRange,
    maxPrice,
    ratingFilter,
    selectedSizes,
    showNewArrivals,
    showDiscount,
    searchQuery,
  ]);

  // Calculate statistics
  const stats = useMemo(() => {
    const avgRating =
      products.length > 0
        ? products.reduce((acc, p) => acc + (p.rating || 0), 0) /
          products.length
        : 0;

    const discountProducts = products.filter(
      (p) => p.discountPrice && p.discountPrice < p.normalPrice
    );

    return {
      total: products.length,
      avgRating: Math.round(avgRating * 10) / 10,
      highRated: products.filter((p) => p.rating && p.rating >= 4.5).length,
      categories: categories.length - 1,
      newArrivals: products.filter((p) => p.isNew).length,
      discount: discountProducts.length,
    };
  }, [products, categories]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-950 to-amber-500 rounded-full mb-4">
              <div className="w-2 h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></div>
              <span className="text-white text-sm md:text-md font-semibold">
                Best Selling
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-amber-600">Best Sellers</span>
            </h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
            <p className="text-gray-500 mt-4">
              Loading from: {getApiBaseUrl()}
            </p>
            {window.location.hostname !== 'localhost' && (
              <p className="text-gray-400 text-sm mt-2">
                Production backend might take 30-50 seconds to wake up on first request
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-950 to-amber-500 rounded-full mb-4">
              <div className="w-2 h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></div>
              <span className="text-white text-sm md:text-md font-semibold">
                Best Selling
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-amber-600">Best Sellers</span>
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <p className="text-red-600 font-medium text-lg mb-4">
                Error: {error}
              </p>
              <p className="text-gray-600 text-sm mb-4">
                Backend URL: {getApiBaseUrl()}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-slate-950 to-amber-500 text-white rounded-lg hover:from-slate-800 hover:to-amber-600 transition-colors font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full mb-6">
              <TrendingUp className="w-4 h-4 text-white mr-2" fill="white" />
              <span className="text-white font-semibold">Best Selling</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Best <span className="text-amber-400">Collections</span>
            </h1>

            <div className="relative max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-800 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-full bg-white text-slate-800 backdrop-blu border border-white/20 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-800 hover:text-slate-950"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="lg:w-1/4 hidden lg:block">
            <ProductFilters
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={setSelectedCategory}
              priceRange={priceRange}
              onPriceRangeChange={handlePriceRangeChange}
              maxPrice={maxPrice}
              ratingFilter={ratingFilter}
              onRatingChange={setRatingFilter}
              sizes={sizes}
              selectedSizes={selectedSizes}
              onSizeToggle={handleSizeToggle}
              showBestSellers={showBestSellers}
              onBestSellersToggle={() => setShowBestSellers(!showBestSellers)}
              showNewArrivals={showNewArrivals}
              onNewArrivalsToggle={() => setShowNewArrivals(!showNewArrivals)}
              showDiscount={showDiscount}
              onDiscountToggle={() => setShowDiscount(!showDiscount)}
              sortOption={selectedSort}
              onSortChange={setSelectedSort}
              totalProducts={products.length}
              bestSellersCount={products.filter((p) => p.isBestSelling).length}
              newArrivalsCount={stats.newArrivals}
              discountCount={stats.discount}
              avgRating={stats.avgRating}
              categoriesCount={categories.length - 1}
              activeFilterCount={activeFilterCount}
              onResetFilters={resetFilters}
            />
          </div>

          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(true)}
            className="lg:hidden flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>

          {/* Products Section */}
          <div className="lg:w-3/4">
            {/* Header Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedCategory === "all"
                    ? "All Best Sellers"
                    : selectedCategory + " Best Sellers"}
                </h2>
                <p className="text-gray-600 mt-1">
                  Showing {filteredProducts.length} of {products.length} best
                  selling products
                </p>
              </div>

              <div className="flex items-center gap-4">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search best sellers..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-64"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                {/* View Toggle */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "grid"
                        ? "bg-white text-amber-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-md transition-colors ${
                      viewMode === "list"
                        ? "bg-white text-amber-600 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {selectedCategory !== "all" && (
                  <div className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                    Category: {selectedCategory}
                    <button
                      onClick={() => setSelectedCategory("all")}
                      className="ml-2 hover:text-amber-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {priceRange[0] > 0 && (
                  <div className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                    Min: ৳{priceRange[0].toLocaleString()}
                    <button
                      onClick={() => handlePriceRangeChange([0, priceRange[1]])}
                      className="ml-2 hover:text-amber-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {priceRange[1] < maxPrice && (
                  <div className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                    Max: ৳{priceRange[1].toLocaleString()}
                    <button
                      onClick={() =>
                        handlePriceRangeChange([priceRange[0], maxPrice])
                      }
                      className="ml-2 hover:text-amber-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {ratingFilter > 0 && (
                  <div className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                    {ratingFilter}+ Stars
                    <button
                      onClick={() => setRatingFilter(0)}
                      className="ml-2 hover:text-amber-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {selectedSizes.length > 0 && (
                  <div className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                    Sizes: {selectedSizes.join(", ")}
                    <button
                      onClick={() => setSelectedSizes([])}
                      className="ml-2 hover:text-amber-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {showNewArrivals && (
                  <div className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                    New Arrivals
                    <button
                      onClick={() => setShowNewArrivals(false)}
                      className="ml-2 hover:text-amber-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {showDiscount && (
                  <div className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                    On Discount
                    <button
                      onClick={() => setShowDiscount(false)}
                      className="ml-2 hover:text-amber-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {searchQuery && (
                  <div className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery("")}
                      className="ml-2 hover:text-amber-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center text-sm text-gray-600 hover:text-amber-600"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Products Grid/List */}
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No Best Sellers Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? `No best selling products found for "${searchQuery}". Try different keywords or clear filters.`
                    : "No best selling products match your current filters. Try adjusting your criteria."}
                </p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-3 bg-gradient-to-r from-slate-950 to-amber-500 text-white rounded-lg hover:from-slate-800 hover:to-amber-600 transition-colors font-medium"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div
                  className={`${
                    viewMode === "grid"
                      ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                      : "space-y-6"
                  }`}
                >
                  {paginatedProducts.map((product) => (
                    <ProductCard
                      key={product._id || product.id}
                      product={product}
                      viewMode={viewMode}
                      showQuickView={true}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-gray-600 text-sm">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage * itemsPerPage,
                          filteredProducts.length
                        )}{" "}
                        of {filteredProducts.length} products
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>

                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                              pageNum = totalPages - 4 + i;
                            } else {
                              pageNum = currentPage - 2 + i;
                            }

                            return (
                              <button
                                key={pageNum}
                                onClick={() => setCurrentPage(pageNum)}
                                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                                  currentPage === pageNum
                                    ? "bg-gradient-to-r from-slate-950 to-amber-500 text-white"
                                    : "border border-gray-300 hover:bg-gray-50"
                                }`}
                              >
                                {pageNum}
                              </button>
                            );
                          }
                        )}

                        <button
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Stats Footer */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {products.filter((p) => p.isBestSelling).length}
                        </div>
                        <div className="text-sm text-gray-600">
                          Best Sellers
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <Sparkles className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {products.filter((p) => p.isNew).length}
                        </div>
                        <div className="text-sm text-gray-600">
                          New Arrivals
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {Math.round(
                            (products.reduce(
                              (acc, p) => acc + (p.rating || 0),
                              0
                            ) /
                              products.length) *
                              10
                          ) / 10}
                        </div>
                        <div className="text-sm text-gray-600">Avg Rating</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <Clock className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {categories.length - 1}
                        </div>
                        <div className="text-sm text-gray-600">Categories</div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <div className="relative w-screen max-w-md">
              <div className="flex h-full flex-col bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Filters
                  </h2>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="p-2 text-gray-400 hover:text-gray-500"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Filters Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <ProductFilters
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onCategoryChange={setSelectedCategory}
                    priceRange={priceRange}
                    onPriceRangeChange={handlePriceRangeChange}
                    maxPrice={maxPrice}
                    ratingFilter={ratingFilter}
                    onRatingChange={setRatingFilter}
                    sizes={sizes}
                    selectedSizes={selectedSizes}
                    onSizeToggle={handleSizeToggle}
                    showBestSellers={showBestSellers}
                    onBestSellersToggle={() =>
                      setShowBestSellers(!showBestSellers)
                    }
                    showNewArrivals={showNewArrivals}
                    onNewArrivalsToggle={() =>
                      setShowNewArrivals(!showNewArrivals)
                    }
                    showDiscount={showDiscount}
                    onDiscountToggle={() => setShowDiscount(!showDiscount)}
                    sortOption={selectedSort}
                    onSortChange={setSelectedSort}
                    totalProducts={products.length}
                    bestSellersCount={
                      products.filter((p) => p.isBestSelling).length
                    }
                    newArrivalsCount={stats.newArrivals}
                    discountCount={stats.discount}
                    avgRating={stats.avgRating}
                    categoriesCount={categories.length - 1}
                    activeFilterCount={activeFilterCount}
                    onResetFilters={resetFilters}
                    isMobile={true}
                    onClose={() => setShowMobileFilters(false)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BestSellingPage;