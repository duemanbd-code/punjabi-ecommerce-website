// client/src/app/category/[slug]/page.tsx

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import ProductFilters from "@/components/ProductFilters";
import { 
  Search, Grid, List, X, Tag, ArrowRight, 
  ChevronDown, Filter, Sparkles,
  Award, Zap, Percent
} from "lucide-react";

  const API_URL=process.env.NEXT_PUBLIC_API_URL

interface Product {
  _id: string;
  id?: string;
  title: string;
  description: string;
  category: string;
  normalPrice: number;
  originalPrice?: number;
  rating?: number;
  imageUrl: string;
  image?: string;
  isBestSelling?: boolean;
  isNew?: boolean;
  featured?: boolean;
  stock?: number;
  sizes?: { size: string; stock: number }[];
  tags?: string[];
  createdAt?: string;
}

interface CategoryInfo {
  name: string;
  slug: string;
  description?: string;
}

const fixedCategories = [
  { 
    slug: "classic-panjabi", 
    name: "Classic Panjabi", 
    description: "Traditional classic panjabi designs with intricate embroidery" 
  },
  { 
    slug: "cotton-panjabi", 
    name: "Cotton Panjabi", 
    description: "Comfortable cotton panjabi suits perfect for daily wear" 
  },
  { 
    slug: "linen-panjabi", 
    name: "Linen Panjabi", 
    description: "Premium linen panjabi collection offering elegance and comfort" 
  },
];

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [categoryInfo, setCategoryInfo] = useState<CategoryInfo | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);
  
  // Filters - IDENTICAL TO ALL COLLECTIONS PAGE
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedSort, setSelectedSort] = useState<string>("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000]);
  const [ratingFilter, setRatingFilter] = useState<number>(0);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [showBestSellers, setShowBestSellers] = useState<boolean>(false);
  const [showNewArrivals, setShowNewArrivals] = useState<boolean>(false);
  const [showDiscount, setShowDiscount] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // UI
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(12);

  const sizes = ["S", "M", "L", "XL", "XXL", "3XL"];

  // Fetch products
  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        setLoading(true);
        const fixedCategory = fixedCategories.find(cat => cat.slug === slug);

        if (fixedCategory) {
          setCategoryInfo(fixedCategory);
          const response = await axios.get(`${API_URL}/api/products/category/${slug}`);
          if (response.data.success) {
            const productsData = response.data.data.map((p: Product) => ({
              ...p,
              image: p.imageUrl || p.image
            }));
            setProducts(productsData);
          }
        } else {
          const categoryName = slug.split("-").map(w => w[0].toUpperCase() + w.slice(1)).join(" ");
          setCategoryInfo({ 
            name: categoryName, 
            slug, 
            description: `Explore our ${categoryName} collection` 
          });
          const response = await axios.get(`${API_URL}/api/products`);
          if (response.data.success) {
            const allProducts = response.data.data;
            const categoryProducts = allProducts.filter((p: Product) => 
              p.category?.toLowerCase().includes(slug.toLowerCase())
            );
            setProducts(categoryProducts.map((p: Product) => ({
              ...p,
              image: p.imageUrl || p.image
            })));
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchCategoryProducts();
  }, [slug]);

  // Apply filters - IDENTICAL TO ALL COLLECTIONS PAGE
  useEffect(() => {
    let filtered = [...products];

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.title.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Price filter
    filtered = filtered.filter(p => p.normalPrice >= priceRange[0] && p.normalPrice <= priceRange[1]);
    
    // Rating filter
    if (ratingFilter > 0) {
      filtered = filtered.filter(product => 
        product.rating && product.rating >= ratingFilter
      );
    }

    // Size filter
    if (selectedSizes.length > 0) {
      filtered = filtered.filter(product => 
        product.sizes?.some(s => selectedSizes.includes(s.size)) || 
        product.tags?.some(tag => selectedSizes.includes(tag))
      );
    }

    // Apply best sellers filter
    if (showBestSellers) {
      filtered = filtered.filter(product => product.isBestSelling);
    }

    // Apply new arrivals filter
    if (showNewArrivals) {
      filtered = filtered.filter(product => product.isNew);
    }

    // Apply discount filter
    if (showDiscount) {
      filtered = filtered.filter(product => 
        product.originalPrice && product.originalPrice > product.normalPrice
      );
    }

    // Sorting - IDENTICAL TO ALL COLLECTIONS PAGE
    switch (selectedSort) {
      case "price-low":
        filtered.sort((a, b) => a.normalPrice - b.normalPrice);
        break;
      case "price-high":
        filtered.sort((a, b) => b.normalPrice - a.normalPrice);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        });
        break;
      default: // "featured"
        filtered.sort((a, b) => {
          if (a.isBestSelling && !b.isBestSelling) return -1;
          if (!a.isBestSelling && b.isBestSelling) return 1;
          if (a.isNew && !b.isNew) return -1;
          if (!a.isNew && b.isNew) return 1;
          return (b.rating || 0) - (a.rating || 0);
        });
        break;
    }

    setFilteredProducts(filtered);
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
    searchQuery
  ]);

  // Get max price for range slider
  const maxPrice = useMemo(() => {
    return Math.max(...products.map(p => p.normalPrice), 50000);
  }, [products]);

  // Get paginated products
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredProducts.slice(startIndex, endIndex);
  }, [filteredProducts, currentPage, itemsPerPage]);

  // Get total pages
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  // Reset filters - IDENTICAL TO ALL COLLECTIONS PAGE
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

  // Toggle size selection - IDENTICAL TO ALL COLLECTIONS PAGE
  const toggleSizeSelection = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Get active filter count - IDENTICAL TO ALL COLLECTIONS PAGE
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
    searchQuery
  ]);

  // Collection stats - IDENTICAL TO ALL COLLECTIONS PAGE
  const collectionStats = useMemo(() => {
    const discountProducts = products.filter(p => 
      p.originalPrice && p.originalPrice > p.normalPrice
    );
    
    const categories = new Set(products.map(p => p.category));
    
    return {
      totalProducts: products.length,
      bestSellersCount: products.filter(p => p.isBestSelling).length,
      newArrivalsCount: products.filter(p => p.isNew).length,
      discountCount: discountProducts.length,
      avgRating: products.length > 0 
        ? products.reduce((acc, p) => acc + (p.rating || 0), 0) / products.length 
        : 0,
      categoriesCount: categories.size
    };
  }, [products]);

  // Get all categories from products
  const allCategories = useMemo(() => {
    const categories = new Set(products.map(p => p.category));
    return ["all", ...Array.from(categories)];
  }, [products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Loading collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <X className="text-slate-600" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">Error Loading Category</h1>
          <p className="text-slate-600 mb-8">{error}</p>
          <Link 
            href="/category"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-slate-950 to-amber-500 text-white rounded-lg hover:from-slate-800 hover:to-amber-600 transition-all font-medium"
          >
            <ArrowRight className="rotate-180" size={18} />
            Browse Categories
          </Link>
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
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
              <Tag className="w-4 h-4 mr-2 text-amber-300" />
              <span className="text-sm font-semibold">{categoryInfo?.name}</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              {categoryInfo?.name} <span className="text-amber-400">Collection</span>
            </h1>
            {/* <p className="text-lg md:text-xl text-gray-200 mb-8">
              {categoryInfo?.description || "Explore our premium collection of curated products"}
            </p> */}
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
                categories={allCategories}
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
                  {selectedCategory === "all" ? "All Products" : selectedCategory}
                </h2>
                <p className="text-gray-600 mt-1">
                  Showing {filteredProducts.length} of {products.length} products
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

            {/* Active Filters - IDENTICAL TO ALL COLLECTIONS PAGE */}
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
                {selectedSizes.map(size => (
                  <div key={size} className="inline-flex items-center bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full text-sm">
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
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No Products Found</h3>
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
                <div className={`${viewMode === "grid" 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "space-y-6"
                }`}>
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
                        Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
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
                        })}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Related Categories */}
        {/* <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Tag className="text-white" size={20} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Explore More Collections</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {fixedCategories
              .filter((cat) => cat.slug !== slug)
              .map((relatedCat) => (
                <Link
                  key={relatedCat.slug}
                  href={`/category/${relatedCat.slug}`}
                  className="group bg-white border border-gray-200 rounded-xl p-6 hover:border-amber-300 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 bg-slate-100 rounded-lg group-hover:bg-amber-50 transition-colors">
                      <Tag className="text-slate-600 group-hover:text-amber-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">{relatedCat.name}</h3>
                      <p className="text-sm text-gray-600">{relatedCat.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-amber-600 font-medium">View Collection</span>
                    <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-amber-50 transition-colors">
                      <ArrowRight className="text-slate-600 group-hover:text-amber-600" size={16} />
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div> */}
      </div>

      {/* Mobile Filters Modal */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 overflow-hidden lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <div className="relative w-screen max-w-md">
              <div className="flex h-full flex-col bg-white shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
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
                    categories={allCategories}
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
}