// client/src/components/AllCollectionsSection.tsx 

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import {
  Search,
  Grid,
  List,
  ChevronDown,
  X,
  Sparkles,
  Filter,
  Award,
  Zap,
  Percent,
  Tag as TagIcon,
  Star,
} from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { Product } from "@/types/product.types";

const AllCollectionsPage = () => {
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
  const [showBestSellers, setShowBestSellers] = useState<boolean>(false);
  const [showNewArrivals, setShowNewArrivals] = useState<boolean>(false);
  const [showDiscount, setShowDiscount] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // UI state
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(12);

  // Sizes available
  const sizes = ["S", "M", "L", "XL", "XXL", "3XL"];

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<{ data: Product[] } | Product[]>(
          `${API_URL}/api/products`
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

        setProducts(productData);

        // Extract unique categories
        const uniqueCategories = new Set<string>();
        productData.forEach((product) => {
          if (product.category) {
            uniqueCategories.add(product.category);
          }
        });

        setCategories(["all", ...Array.from(uniqueCategories)]);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load any products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Apply filters
  useEffect(() => {
    let result = [...products];

    // Apply category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Apply search filter - FIXED: Use title instead of name
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (product) =>
          product.title.toLowerCase().includes(query) || // Use title instead of name
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          (product.tags || []).some((tag: string) =>
            tag.toLowerCase().includes(query)
          ) ||
          (product.keywords || []).some((keyword: string) =>
            keyword.toLowerCase().includes(query)
          )
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
      result = result.filter(
        (product) =>
          product.sizes?.some((size) => selectedSizes.includes(size.size)) ||
          product.tags?.some((tag) => selectedSizes.includes(tag))
      );
    }

    // Apply best sellers filter
    if (showBestSellers) {
      result = result.filter((product) => product.isBestSelling);
    }

    // Apply new arrivals filter
    if (showNewArrivals) {
      result = result.filter((product) => product.isNew);
    }

    // Apply discount filter
    if (showDiscount) {
      result = result.filter(
        (product) =>
          product.originalPrice && product.originalPrice > product.normalPrice
      );
    }

    // Apply sorting - FIXED: Use createdAt safely
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
          if (a.isBestSelling && !b.isBestSelling) return -1;
          if (!a.isBestSelling && b.isBestSelling) return 1;
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
        break;
    }

    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filters change
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
    setShowBestSellers(false);
    setShowNewArrivals(false);
    setShowDiscount(false);
    setSearchQuery("");
  }, [maxPrice]);

  // Toggle size selection
  const toggleSizeSelection = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategory !== "all") count++;
    if (selectedSort !== "featured") count++;
    if (priceRange[0] > 0 || priceRange[1] < maxPrice) count++;
    if (ratingFilter > 0) count++;
    if (selectedSizes.length > 0) count++;
    if (showBestSellers) count++;
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
    showBestSellers,
    showNewArrivals,
    showDiscount,
    searchQuery,
  ]);

  // Collection stats
  const collectionStats = useMemo(() => {
    const discountProducts = products.filter(
      (p) => p.originalPrice && p.originalPrice > p.normalPrice
    );

    return {
      totalProducts: products.length,
      bestSellersCount: products.filter((p) => p.isBestSelling).length,
      newArrivalsCount: products.filter((p) => p.isNew).length,
      discountCount: discountProducts.length,
      avgRating:
        products.length > 0
          ? products.reduce((acc, p) => acc + (p.rating || 0), 0) /
            products.length
          : 0,
      categoriesCount: categories.length - 1,
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
                All Collections
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-amber-600">Collections</span>
            </h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            </div>
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
                All Collections
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Our <span className="text-amber-600">Collections</span>
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 max-w-md mx-auto">
              <p className="text-red-600 font-medium text-lg mb-4">
                Error: {error}
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
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Sparkles className="w-4 h-4 mr-2 text-amber-300" />
              <span className="text-sm font-semibold">Premium Collections</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Our <span className="text-amber-400">Collections</span>
            </h1>
            {/* Search Bar */}
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
            <div className="sticky top-8">
              <ProductFilters
                categories={categories}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                maxPrice={maxPrice}
                ratingFilter={ratingFilter}
                onRatingChange={setRatingFilter}
                sizes={sizes}
                selectedSizes={selectedSizes}
                onSizeToggle={toggleSizeSelection}
                showBestSellers={showBestSellers}
                onBestSellersToggle={() => setShowBestSellers(!showBestSellers)}
                showNewArrivals={showNewArrivals}
                onNewArrivalsToggle={() => setShowNewArrivals(!showNewArrivals)}
                showDiscount={showDiscount}
                onDiscountToggle={() => setShowDiscount(!showDiscount)}
                sortOption={selectedSort}
                onSortChange={setSelectedSort}
                totalProducts={collectionStats.totalProducts}
                bestSellersCount={collectionStats.bestSellersCount}
                newArrivalsCount={collectionStats.newArrivalsCount}
                discountCount={collectionStats.discountCount}
                avgRating={collectionStats.avgRating}
                categoriesCount={collectionStats.categoriesCount}
                activeFilterCount={activeFilterCount}
                onResetFilters={resetFilters}
              />
            </div>
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
                    ? "All Products"
                    : selectedCategory}
                </h2>
                <p className="text-gray-600 mt-1">
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </p>
              </div>

              <div className="flex items-center gap-4">
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

                {/* Sort Dropdown */}
                <div className="relative">
                  <select
                    value={selectedSort}
                    onChange={(e) => setSelectedSort(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2.5 text-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="rating">Highest Rated</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
                      onClick={() => setPriceRange([0, priceRange[1]])}
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
                      onClick={() => setPriceRange([priceRange[0], maxPrice])}
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
                {selectedSizes.map((size) => (
                  <div
                    key={size}
                    className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm"
                  >
                    Size: {size}
                    <button
                      onClick={() => toggleSizeSelection(size)}
                      className="ml-2 hover:text-amber-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {showBestSellers && (
                  <div className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                    <Award className="w-3 h-3 mr-1" />
                    Best Sellers
                    <button
                      onClick={() => setShowBestSellers(false)}
                      className="ml-2 hover:text-amber-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                {showNewArrivals && (
                  <div className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
                    <Zap className="w-3 h-3 mr-1" />
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
                    <Percent className="w-3 h-3 mr-1" />
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
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  No Products Found
                </h3>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  {searchQuery
                    ? `No products found for "${searchQuery}". Try different keywords or clear filters.`
                    : "No products match your current filters. Try adjusting your criteria."}
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
                        <Award className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {collectionStats.bestSellersCount}
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
                        <Zap className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {collectionStats.newArrivalsCount}
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
                        <Star className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {collectionStats.avgRating.toFixed(1)}
                        </div>
                        <div className="text-sm text-gray-600">Avg Rating</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <TagIcon className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {collectionStats.categoriesCount}
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
                    onPriceRangeChange={setPriceRange}
                    maxPrice={maxPrice}
                    ratingFilter={ratingFilter}
                    onRatingChange={setRatingFilter}
                    sizes={sizes}
                    selectedSizes={selectedSizes}
                    onSizeToggle={toggleSizeSelection}
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
                    totalProducts={collectionStats.totalProducts}
                    bestSellersCount={collectionStats.bestSellersCount}
                    newArrivalsCount={collectionStats.newArrivalsCount}
                    discountCount={collectionStats.discountCount}
                    avgRating={collectionStats.avgRating}
                    categoriesCount={collectionStats.categoriesCount}
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

export default AllCollectionsPage;



// client/src/components/AllCollectionsSection.tsx

// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";
// import axios from "axios";
// import ProductCard from "./ProductCard";
// import Link from "next/link";
// import {
//   ChevronLeft,
//   ChevronRight,
//   Pause,
//   Play,
//   ArrowRight,
//   Filter,
// } from "lucide-react";
// import { Product } from "@/types/product.types";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// const AllCollectionsSection = () => {
//   const [allproduct, setAllproduct] = useState<Product[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedCategory, setSelectedCategory] = useState<string>("all");
//   const [categories, setCategories] = useState<string[]>([]);

//   // Carousel state
//   const [currentSlide, setCurrentSlide] = useState<number>(0);
//   const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(true);
//   const [isMobile, setIsMobile] = useState<boolean>(false);
//   const [showCategoryFilter, setShowCategoryFilter] = useState<boolean>(false);

//   // Refs
//   const containerRef = useRef<HTMLDivElement>(null);
//   const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
//   const autoScrollRestoreTimeout = useRef<NodeJS.Timeout | null>(null);
//   const categoryFilterRef = useRef<HTMLDivElement>(null);

//   // Responsive cards per view
//   const getCardsPerView = () => {
//     if (typeof window === "undefined")
//       return { mobile: 1, tablet: 2, laptop: 3, desktop: 4 };

//     const width = window.innerWidth;
//     if (width < 640) return { current: 1, total: 1 };
//     if (width < 768) return { current: 1.5, total: 2 };
//     if (width < 1024) return { current: 2, total: 2 };
//     if (width < 1280) return { current: 3, total: 3 };
//     return { current: 4, total: 4 };
//   };

//   useEffect(() => {
//     const fetchProduct = async () => {
//       try {
//         setLoading(true);
//         setError(null);
//         const response = await axios.get<{ data: Product[] } | Product[]>(
//           `${API_URL}/api/products`
//         );

//         let productData: Product[] = [];

//         if (Array.isArray(response.data)) {
//           productData = response.data;
//         } else if (response.data && response.data.data) {
//           productData = response.data.data;
//         } else {
//           setAllproduct([]);
//           return;
//         }

//         setAllproduct(productData);

//         // Extract unique categories
//         const uniqueCategories = new Set<string>();
//         productData.forEach((product) => {
//           if (product.category) {
//             uniqueCategories.add(product.category);
//           }
//         });

//         setCategories(["all", ...Array.from(uniqueCategories)]);
//       } catch (error) {
//         console.error("Error fetching products:", error);
//         setError("Failed to load products. Please try again later.");
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchProduct();
//   }, []);

//   // Check if mobile
//   useEffect(() => {
//     const checkMobile = () => {
//       const mobile = window.innerWidth < 768;
//       setIsMobile(mobile);
//       if (!mobile) setShowCategoryFilter(false);
//     };
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Close category filter on outside click
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (
//         categoryFilterRef.current &&
//         !categoryFilterRef.current.contains(event.target as Node)
//       ) {
//         setShowCategoryFilter(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Filter products based on selected category
//   const filteredProducts =
//     selectedCategory === "all"
//       ? allproduct
//       : allproduct.filter((product) => product.category === selectedCategory);

//   // Calculate total slides
//   const totalSlides = Math.max(
//     1,
//     Math.ceil(filteredProducts.length / getCardsPerView().total)
//   );

//   // Navigation functions
//   const nextSlide = useCallback(() => {
//     setCurrentSlide((prev) => {
//       const nextSlide = prev + 1;
//       if (nextSlide >= totalSlides) return 0;
//       return nextSlide;
//     });
//   }, [totalSlides]);

//   const prevSlide = useCallback(() => {
//     setCurrentSlide((prev) => {
//       const prevSlide = prev - 1;
//       if (prevSlide < 0) return totalSlides - 1;
//       return prevSlide;
//     });
//   }, [totalSlides]);

//   const goToSlide = useCallback((index: number) => {
//     setCurrentSlide(index);
//   }, []);

//   // Handle manual navigation with auto-scroll pause/resume
//   const handlePrevSlide = useCallback(() => {
//     prevSlide();
//     setIsAutoScrolling(false);

//     if (autoScrollRestoreTimeout.current) {
//       clearTimeout(autoScrollRestoreTimeout.current);
//     }

//     autoScrollRestoreTimeout.current = setTimeout(() => {
//       setIsAutoScrolling(true);
//     }, 3000);
//   }, [prevSlide]);

//   const handleNextSlide = useCallback(() => {
//     nextSlide();
//     setIsAutoScrolling(false);

//     if (autoScrollRestoreTimeout.current) {
//       clearTimeout(autoScrollRestoreTimeout.current);
//     }

//     autoScrollRestoreTimeout.current = setTimeout(() => {
//       setIsAutoScrolling(true);
//     }, 3000);
//   }, [nextSlide]);

//   // Toggle autoplay
//   const toggleAutoplay = useCallback(() => {
//     setIsAutoScrolling(!isAutoScrolling);
//   }, [isAutoScrolling]);

//   // Auto-scroll functionality
//   useEffect(() => {
//     if (!isAutoScrolling || filteredProducts.length === 0 || totalSlides <= 1) {
//       if (autoScrollInterval.current) {
//         clearInterval(autoScrollInterval.current);
//         autoScrollInterval.current = null;
//       }
//       return;
//     }

//     autoScrollInterval.current = setInterval(() => {
//       nextSlide();
//     }, 3000);

//     return () => {
//       if (autoScrollInterval.current) {
//         clearInterval(autoScrollInterval.current);
//         autoScrollInterval.current = null;
//       }
//     };
//   }, [isAutoScrolling, filteredProducts.length, totalSlides, nextSlide]);

//   // Clean up timeouts on unmount
//   useEffect(() => {
//     return () => {
//       if (autoScrollInterval.current) {
//         clearInterval(autoScrollInterval.current);
//       }
//       if (autoScrollRestoreTimeout.current) {
//         clearTimeout(autoScrollRestoreTimeout.current);
//       }
//     };
//   }, []);

//   // Get products for current slide
//   const getCurrentSlideProducts = useCallback(() => {
//     const cardsPerView = getCardsPerView();
//     const startIndex = currentSlide * cardsPerView.total;
//     const endIndex = startIndex + cardsPerView.total;
//     return filteredProducts.slice(startIndex, endIndex);
//   }, [currentSlide, filteredProducts]);

//   // Handle window resize
//   useEffect(() => {
//     const handleResize = () => {
//       setCurrentSlide(0);
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   // Loading state
//   if (loading) {
//     return (
//       <div className="min-h-[60vh] bg-gradient-to-b from-gray-50 to-white py-8 sm:py-12">
//         <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
//           <div className="text-center mb-8 sm:mb-12">
//             <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-950 to-amber-500 rounded-full mb-3 sm:mb-4">
//               <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></div>
//               <span className="text-white text-xs sm:text-sm md:text-md font-semibold">
//                 All Collections
//               </span>
//             </div>
//             <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
//               Our <span className="text-amber-600">Collections</span>
//             </h1>
//             <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
//               Loading our exclusive collections...
//             </p>
//             <div className="flex justify-center">
//               <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-amber-600"></div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Error state
//   if (error) {
//     return (
//       <div className="min-h-[60vh] bg-gradient-to-b from-gray-50 to-white py-8 sm:py-12">
//         <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
//           <div className="text-center mb-8 sm:mb-12">
//             <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-950 to-amber-500 rounded-full mb-3 sm:mb-4">
//               <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></div>
//               <span className="text-white text-xs sm:text-sm md:text-md font-semibold">
//                 All Collections
//               </span>
//             </div>
//             <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
//               Our <span className="text-amber-600">Collections</span>
//             </h1>
//             <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-6 max-w-md mx-auto">
//               <p className="text-red-600 font-medium text-sm sm:text-base md:text-lg mb-4">
//                 Error: {error}
//               </p>
//               <button
//                 onClick={() => window.location.reload()}
//                 className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-950 to-amber-500 text-white rounded-lg hover:from-slate-800 hover:to-amber-600 transition-colors font-medium text-sm sm:text-base"
//               >
//                 Try Again
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-white py-6 sm:py-8 md:py-12">
//       <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
//         {/* Page Header */}
//         <div className="relative mb-8 sm:mb-10 md:mb-12">
//           <div className="text-center">
//             <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-950 to-amber-500 rounded-full mb-3 sm:mb-4">
//               <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></div>
//               <span className="text-white text-xs sm:text-sm md:text-md font-semibold">
//                 All Collections
//               </span>
//             </div>
//             <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
//               Our <span className="text-amber-600">Collections</span>
//             </h1>
//             <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-8 px-4">
//               Discover our wide range of premium products.
//             </p>
//           </div>

//           {/* View All Button - Hidden on mobile */}
//           {filteredProducts.length > 0 && (
//             <div className="hidden sm:block absolute top-0 right-0">
//               <Link
//                 href="/all-collections"
//                 className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5
//                   bg-gradient-to-r from-slate-900 to-slate-700
//                   hover:from-slate-950 hover:to-slate-800
//                   text-white hover:text-amber-500
//                   text-xs sm:text-sm md:text-base font-semibold rounded-full
//                   transition-all duration-300
//                   shadow-lg hover:shadow-xl"
//               >
//                 View All
//                 <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
//               </Link>
//             </div>
//           )}
//         </div>

//         {/* Category Filter */}
//         <div className="mb-6 sm:mb-8 md:mb-12" ref={categoryFilterRef}>
//           {/* Mobile: Filter Button */}
//           {isMobile && (
//             <div className="mb-4">
//               <button
//                 onClick={() => setShowCategoryFilter(!showCategoryFilter)}
//                 className="w-full flex items-center justify-center gap-2 px-4 py-3
//                   bg-gradient-to-r from-slate-950 to-amber-500 text-white
//                   rounded-lg font-medium shadow-lg"
//               >
//                 <Filter className="w-4 h-4" />
//                 Filter:{" "}
//                 {selectedCategory === "all" ? "All Products" : selectedCategory}
//                 <ChevronRight
//                   className={`w-4 h-4 transition-transform ${
//                     showCategoryFilter ? "rotate-90" : ""
//                   }`}
//                 />
//               </button>
//             </div>
//           )}

//           {/* Desktop: Full Category Bar */}
//           {!isMobile && (
//             <div className="mb-4 md:mb-6">
//               <div className="flex flex-wrap justify-center gap-2 md:gap-3">
//                 <button
//                   onClick={() => setSelectedCategory("all")}
//                   className={`px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full font-medium transition-all duration-300 text-xs sm:text-sm md:text-base ${
//                     selectedCategory === "all"
//                       ? "bg-gradient-to-r from-slate-950 to-amber-500 text-white shadow-lg transform scale-105"
//                       : "bg-white text-gray-700 hover:text-amber-600 hover:bg-amber-50 border border-gray-300"
//                   }`}
//                 >
//                   All Products
//                 </button>
//                 {categories
//                   .filter((cat) => cat !== "all")
//                   .map((category) => (
//                     <button
//                       key={category}
//                       onClick={() => setSelectedCategory(category)}
//                       className={`px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full font-medium transition-all duration-300 text-xs sm:text-sm md:text-base ${
//                         selectedCategory === category
//                           ? "bg-gradient-to-r from-slate-950 to-amber-500 text-white shadow-lg transform scale-105"
//                           : "bg-white text-gray-700 hover:text-amber-600 hover:bg-amber-50 border border-gray-300"
//                       }`}
//                     >
//                       {category.charAt(0).toUpperCase() + category.slice(1)}
//                     </button>
//                   ))}
//               </div>
//             </div>
//           )}

//           {/* Mobile: Dropdown Category Filter */}
//           {isMobile && showCategoryFilter && (
//             <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[90vw] max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
//               <div className="p-4">
//                 <div className="grid grid-cols-2 gap-2">
//                   <button
//                     onClick={() => {
//                       setSelectedCategory("all");
//                       setShowCategoryFilter(false);
//                     }}
//                     className={`p-3 rounded-lg text-sm font-medium transition-all ${
//                       selectedCategory === "all"
//                         ? "bg-gradient-to-r from-slate-950 to-amber-500 text-white"
//                         : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                     }`}
//                   >
//                     All Products
//                   </button>
//                   {categories
//                     .filter((cat) => cat !== "all")
//                     .map((category) => (
//                       <button
//                         key={category}
//                         onClick={() => {
//                           setSelectedCategory(category);
//                           setShowCategoryFilter(false);
//                         }}
//                         className={`p-3 rounded-lg text-sm font-medium transition-all ${
//                           selectedCategory === category
//                             ? "bg-gradient-to-r from-slate-950 to-amber-500 text-white"
//                             : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                         }`}
//                       >
//                         {category.charAt(0).toUpperCase() + category.slice(1)}
//                       </button>
//                     ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Selected Category Info */}
//           <div className="text-center">
//             <p className="text-gray-600 text-sm sm:text-base">
//               Showing {filteredProducts.length}{" "}
//               {selectedCategory === "all"
//                 ? "products"
//                 : selectedCategory + " products"}
//             </p>
//           </div>
//         </div>

//         {/* Products Carousel */}
//         {filteredProducts.length === 0 ? (
//           <div className="text-center py-8 sm:py-12 md:py-16 bg-white rounded-xl sm:rounded-2xl shadow-sm">
//             <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">😕</div>
//             <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">
//               No Products Found
//             </h3>
//             <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
//               {selectedCategory === "all"
//                 ? "No products available at the moment."
//                 : `No products found in the ${selectedCategory} category.`}
//             </p>
//             {selectedCategory !== "all" && (
//               <button
//                 onClick={() => setSelectedCategory("all")}
//                 className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-950 to-amber-500 text-white rounded-lg hover:from-slate-800 hover:to-amber-600 transition-colors font-medium text-sm sm:text-base"
//               >
//                 View All Products
//               </button>
//             )}
//           </div>
//         ) : (
//           <div
//             className="relative px-4 sm:px-6 md:px-8 lg:px-10"
//             ref={containerRef}
//           >
//             {/* Custom Navigation Buttons - Hide on mobile if only one slide */}
//             {totalSlides > 1 && (
//               <>
//                 <button
//                   onClick={handlePrevSlide}
//                   className={`absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10 
//                     ${isMobile ? "w-8 h-8" : "w-10 h-10 md:w-12 md:h-12"} 
//                     bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg 
//                     flex items-center justify-center transition-all duration-300 
//                     hover:bg-white hover:shadow-xl hover:scale-110 active:scale-95 
//                     disabled:opacity-50 disabled:cursor-not-allowed`}
//                   aria-label="Previous slide"
//                   disabled={currentSlide === 0}
//                 >
//                   <ChevronLeft
//                     className={`${
//                       isMobile ? "w-4 h-4" : "w-5 h-5 md:w-6 md:h-6"
//                     } text-gray-700`}
//                   />
//                 </button>

//                 <button
//                   onClick={handleNextSlide}
//                   className={`absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10 
//                     ${isMobile ? "w-8 h-8" : "w-10 h-10 md:w-12 md:h-12"} 
//                     bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg 
//                     flex items-center justify-center transition-all duration-300 
//                     hover:bg-white hover:shadow-xl hover:scale-110 active:scale-95 
//                     disabled:opacity-50 disabled:cursor-not-allowed`}
//                   aria-label="Next slide"
//                   disabled={currentSlide === totalSlides - 1}
//                 >
//                   <ChevronRight
//                     className={`${
//                       isMobile ? "w-4 h-4" : "w-5 h-5 md:w-6 md:h-6"
//                     } text-gray-700`}
//                   />
//                 </button>
//               </>
//             )}

//             {/* Autoplay Toggle - Hide on mobile */}
//             {!isMobile && totalSlides > 1 && (
//               <div className="absolute -top-12 right-0 z-10">
//                 <button
//                   onClick={toggleAutoplay}
//                   className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm 
//                     border border-gray-200 rounded-lg text-xs font-medium text-gray-600 
//                     hover:bg-white hover:shadow-lg transition-all shadow-sm"
//                   title={
//                     isAutoScrolling ? "Pause auto-scroll" : "Resume auto-scroll"
//                   }
//                 >
//                   {isAutoScrolling ? (
//                     <>
//                       <Pause className="w-3 h-3" />
//                       Pause
//                     </>
//                   ) : (
//                     <>
//                       <Play className="w-3 h-3" />
//                       Play
//                     </>
//                   )}
//                 </button>
//               </div>
//             )}

//             {/* Products Grid - Responsive */}
//             <div className="overflow-hidden">
//               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
//                 {getCurrentSlideProducts().map((product) => (
//                   <div
//                     key={product._id || product.id}
//                     className="animate-fadeIn"
//                   >
//                     <ProductCard
//                       product={product}
//                       viewMode="grid"
//                       showQuickView={!isMobile} // Hide quick view on mobile for better UX
//                     />
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Carousel Indicators */}
//             {totalSlides > 1 && (
//               <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 sm:mt-8">
//                 {/* Mobile: Compact indicators */}
//                 {isMobile ? (
//                   <div className="flex items-center gap-3">
//                     <button
//                       onClick={handlePrevSlide}
//                       disabled={currentSlide === 0}
//                       className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
//                         currentSlide === 0
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                       }`}
//                       aria-label="Previous slide"
//                     >
//                       <ChevronLeft className="w-5 h-5 text-gray-600" />
//                     </button>

//                     <div className="flex items-center gap-1.5">
//                       {Array.from({ length: Math.min(totalSlides, 5) }).map(
//                         (_, index) => (
//                           <button
//                             key={index}
//                             onClick={() => goToSlide(index)}
//                             className={`transition-all duration-300 ${
//                               index === currentSlide
//                                 ? "w-6 h-2 bg-amber-500 rounded-full"
//                                 : "w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400"
//                             }`}
//                             aria-label={`Go to slide ${index + 1}`}
//                           />
//                         )
//                       )}
//                       {totalSlides > 5 && (
//                         <span className="text-xs text-gray-500 ml-1">
//                           {currentSlide + 1}/{totalSlides}
//                         </span>
//                       )}
//                     </div>

//                     <button
//                       onClick={handleNextSlide}
//                       disabled={currentSlide === totalSlides - 1}
//                       className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
//                         currentSlide === totalSlides - 1
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                       }`}
//                       aria-label="Next slide"
//                     >
//                       <ChevronRight className="w-5 h-5 text-gray-600" />
//                     </button>
//                   </div>
//                 ) : (
//                   /* Desktop: Full indicators */
//                   <>
//                     <button
//                       onClick={handlePrevSlide}
//                       disabled={currentSlide === 0}
//                       className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
//                         currentSlide === 0
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                       }`}
//                       aria-label="Previous slide"
//                     >
//                       <ChevronLeft className="w-5 h-5 text-gray-600" />
//                     </button>

//                     <div className="flex items-center gap-2">
//                       {Array.from({ length: totalSlides }).map((_, index) => (
//                         <button
//                           key={index}
//                           onClick={() => goToSlide(index)}
//                           className={`transition-all duration-300 ${
//                             index === currentSlide
//                               ? "w-8 h-2 bg-amber-500 rounded-full"
//                               : "w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400"
//                           }`}
//                           aria-label={`Go to slide ${index + 1}`}
//                         />
//                       ))}
//                     </div>

//                     <button
//                       onClick={handleNextSlide}
//                       disabled={currentSlide === totalSlides - 1}
//                       className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${
//                         currentSlide === totalSlides - 1
//                           ? "opacity-50 cursor-not-allowed"
//                           : ""
//                       }`}
//                       aria-label="Next slide"
//                     >
//                       <ChevronRight className="w-5 h-5 text-gray-600" />
//                     </button>
//                   </>
//                 )}

//                 {/* Mobile: Autoplay toggle */}
//                 {isMobile && totalSlides > 1 && (
//                   <button
//                     onClick={toggleAutoplay}
//                     className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm 
//                       border border-gray-200 rounded-lg text-xs font-medium text-gray-600 
//                       hover:bg-white hover:shadow-lg transition-all shadow-sm mt-2"
//                   >
//                     {isAutoScrolling ? (
//                       <>
//                         <Pause className="w-3 h-3" />
//                         Pause Auto
//                       </>
//                     ) : (
//                       <>
//                         <Play className="w-3 h-3" />
//                         Play Auto
//                       </>
//                     )}
//                   </button>
//                 )}
//               </div>
//             )}

//             {/* Mobile: View All Button at bottom */}
//             {isMobile && filteredProducts.length > 0 && (
//               <div className="flex justify-center mt-6">
//                 <Link
//                   href="/all-collections"
//                   className="inline-flex items-center px-6 py-3
//                     bg-gradient-to-r from-slate-900 to-slate-700
//                     hover:from-slate-950 hover:to-slate-800
//                     text-white hover:text-amber-500
//                     font-semibold rounded-full
//                     transition-all duration-300
//                     shadow-lg hover:shadow-xl text-base"
//                 >
//                   View All Products
//                   <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
//                 </Link>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default AllCollectionsSection;
