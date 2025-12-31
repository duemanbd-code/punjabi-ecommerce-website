// client/src/components/ProductFilters.tsx

import React, { memo, useCallback } from 'react';
import { 
  Filter, 
  X, 
  Star, 
  TrendingUp,
  Sparkles,
  Clock,
  Tag,
  Check,
  Package,
  DollarSign,
  Zap,
  Award,
  Percent
} from 'lucide-react';

interface ProductFiltersProps {
  // Categories
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  
  // Price
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  maxPrice: number;
  
  // Rating
  ratingFilter: number;
  onRatingChange: (rating: number) => void;
  
  // Sizes
  sizes: string[];
  selectedSizes: string[];
  onSizeToggle: (size: string) => void;
  
  // Product Status Filters
  showBestSellers: boolean;
  onBestSellersToggle: () => void;
  showNewArrivals: boolean;
  onNewArrivalsToggle: () => void;
  showDiscount: boolean;
  onDiscountToggle: () => void;
  
  // Sort
  sortOption: string;
  onSortChange: (option: string) => void;
  
  // Stats
  totalProducts: number;
  bestSellersCount: number;
  newArrivalsCount: number;
  discountCount: number;
  avgRating: number;
  categoriesCount: number;
  
  // Reset
  activeFilterCount: number;
  onResetFilters: () => void;
  
  // UI
  isMobile?: boolean;
  onClose?: () => void;
}

const ProductFilters = memo(function ProductFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  maxPrice,
  ratingFilter,
  onRatingChange,
  sizes,
  selectedSizes,
  onSizeToggle,
  showBestSellers,
  onBestSellersToggle,
  showNewArrivals,
  onNewArrivalsToggle,
  showDiscount,
  onDiscountToggle,
  sortOption,
  onSortChange,
  totalProducts,
  bestSellersCount,
  newArrivalsCount,
  discountCount,
  avgRating,
  categoriesCount,
  activeFilterCount,
  onResetFilters,
  isMobile = false,
  onClose = () => {}
}: ProductFiltersProps) {
  
  const handlePriceRangeChange = useCallback((index: number, value: number) => {
    const newRange = [...priceRange] as [number, number];
    newRange[index] = value;
    if (newRange[0] > newRange[1]) {
      if (index === 0) newRange[1] = value;
      if (index === 1) newRange[0] = value;
    }
    onPriceRangeChange(newRange);
  }, [priceRange, onPriceRangeChange]);

  const sortOptions = [
    { value: "featured", label: "Featured", icon: <Sparkles size={16} /> },
    { value: "newest", label: "Newest", icon: <Clock size={16} /> },
    { value: "price-low", label: "Price: Low to High", icon: <TrendingUp size={16} /> },
    { value: "price-high", label: "Price: High to Low", icon: <TrendingUp size={16} className="rotate-180" /> },
    { value: "rating", label: "Highest Rated", icon: <Star size={16} /> }
  ];

  const FilterSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
        <Filter className="w-4 h-4" />
        {title}
      </h3>
      {children}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">Filters</h2>
        {activeFilterCount > 0 && (
          <button
            onClick={onResetFilters}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Clear all ({activeFilterCount})
          </button>
        )}
        {isMobile && (
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Categories Filter */}
      {/* <FilterSection title="Categories">
        <div className="space-y-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                selectedCategory === category
                  ? "bg-gradient-to-r from-slate-50 to-amber-50 text-amber-700 font-medium border border-amber-200"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
              {selectedCategory === category && (
                <Check className="float-right w-4 h-4 mt-0.5" />
              )}
            </button>
          ))}
        </div>
      </FilterSection> */}

      {/* Price Filter */}
      <FilterSection title="Price Range">
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-slate-600">৳{priceRange[0].toLocaleString()}</span>
            <span className="text-slate-600">৳{priceRange[1].toLocaleString()}</span>
          </div>
          <div className="relative pt-1">
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={priceRange[0]}
              onChange={(e) => handlePriceRangeChange(0, parseInt(e.target.value))}
              className="absolute w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
            />
            <input
              type="range"
              min="0"
              max={maxPrice}
              value={priceRange[1]}
              onChange={(e) => handlePriceRangeChange(1, parseInt(e.target.value))}
              className="absolute w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-500 [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-lg"
            />
          </div>
          <div className="flex justify-between text-xs text-slate-500">
            <span>৳0</span>
            <span>৳{maxPrice.toLocaleString()}</span>
          </div>
        </div>
      </FilterSection>

      {/* Size Filter */}
      <FilterSection title="Sizes">
        <div className="grid grid-cols-3 gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => onSizeToggle(size)}
              className={`p-2 rounded-lg border transition-all ${
                selectedSizes.includes(size)
                  ? "border-amber-500 bg-amber-50 text-amber-700 font-semibold"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Product Status Filters */}
      <FilterSection title="Product Type">
        <div className="space-y-2">
          <button
            onClick={onBestSellersToggle}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
              showBestSellers
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span>Best Sellers</span>
            </div>
            <span className="text-sm text-slate-500">{bestSellersCount}</span>
          </button>
          
          <button
            onClick={onNewArrivalsToggle}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
              showNewArrivals
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>New Arrivals</span>
            </div>
            <span className="text-sm text-slate-500">{newArrivalsCount}</span>
          </button>
          
          <button
            onClick={onDiscountToggle}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border transition-all ${
              showDiscount
                ? "border-amber-500 bg-amber-50 text-amber-700"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4" />
              <span>On Discount</span>
            </div>
            <span className="text-sm text-slate-500">{discountCount}</span>
          </button>
        </div>
      </FilterSection>

      {/* Rating Filter */}
      {/* <FilterSection title="Customer Rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => onRatingChange(ratingFilter === rating ? 0 : rating)}
              className={`w-full flex items-center px-3 py-2 rounded-lg transition-colors ${
                ratingFilter === rating
                  ? "bg-gradient-to-r from-slate-50 to-amber-50 text-amber-700 font-medium border border-amber-200"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className={`${
                      i < rating
                        ? "text-amber-500 fill-amber-500"
                        : "text-slate-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm">{rating}+ Stars</span>
              {ratingFilter === rating && (
                <Check className="ml-auto w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </FilterSection> */}

      {/* Sort Options */}
      {/* <FilterSection title="Sort By">
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => onSortChange(option.value)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                sortOption === option.value
                  ? "bg-gradient-to-r from-slate-50 to-amber-50 text-amber-700 font-medium border border-amber-200"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option.icon}
              <span className="text-sm">{option.label}</span>
              {sortOption === option.value && (
                <Check className="ml-auto w-4 h-4" />
              )}
            </button>
          ))}
        </div>
      </FilterSection> */}

      {/* Quick Stats */}
      {/* <div className="bg-gradient-to-br from-slate-50 to-amber-50 rounded-xl border border-amber-100 p-5">
        <h3 className="font-semibold text-slate-900 mb-4">Collection Stats</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Total Products</span>
            <span className="font-semibold text-slate-900">{totalProducts}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Categories</span>
            <span className="font-semibold text-slate-900">{categoriesCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Best Sellers</span>
            <span className="font-semibold text-slate-900">{bestSellersCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">New Arrivals</span>
            <span className="font-semibold text-slate-900">{newArrivalsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">On Discount</span>
            <span className="font-semibold text-slate-900">{discountCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Avg Rating</span>
            <span className="font-semibold text-slate-900">{avgRating.toFixed(1)}</span>
          </div>
        </div>
      </div> */}

      {/* Mobile Apply Button */}
      {isMobile && (
        <div className="sticky bottom-0 pt-4 bg-white border-t border-slate-200">
          <div className="flex gap-3">
            <button
              onClick={onResetFilters}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-950 to-amber-500 text-white rounded-lg font-medium hover:from-slate-800 hover:to-amber-600 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

export default ProductFilters;