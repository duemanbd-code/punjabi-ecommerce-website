// client/src/components/AllCollectionsSection.tsx

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
  Filter,
} from "lucide-react";
import { Product } from "@/types/product.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

const AllCollectionsSection = () => {
  const [allproduct, setAllproduct] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [categories, setCategories] = useState<string[]>([]);

  // Carousel state
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState<boolean>(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const autoScrollRestoreTimeout = useRef<NodeJS.Timeout | null>(null);
  const categoryFilterRef = useRef<HTMLDivElement>(null);

  // Minimum swipe distance
  const minSwipeDistance = 50;

  // Get cards per row based on screen size
  const getCardsPerRow = useCallback(() => {
    if (typeof window === "undefined") return 4;
    const width = window.innerWidth;
    if (width < 640) return 2; // Mobile: 2 cards
    if (width < 768) return 2; // Small tablet: 2 cards
    if (width < 1024) return 2; // Tablet: 2 cards
    if (width < 1280) return 3; // Small desktop: 3 cards
    return 4; // Large desktop: 4 cards
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get<{ data: Product[] } | Product[]>(
          `${API_URL}/api/products?limit=50`
        );

        let productData: Product[] = [];

        if (Array.isArray(response.data)) {
          productData = response.data;
        } else if (response.data && response.data.data) {
          productData = response.data.data;
        } else {
          setAllproduct([]);
          return;
        }

        setAllproduct(productData);

        const uniqueCategories = new Set<string>();
        productData.forEach((product) => {
          if (product.category) {
            uniqueCategories.add(product.category);
          }
        });

        setCategories(["all", ...Array.from(uniqueCategories)]);
      } catch (error) {
        console.error("Error fetching products:", error);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowCategoryFilter(false);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(event.target as Node)) {
        setShowCategoryFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredProducts = useMemo(() => {
    const productsArray = Array.isArray(allproduct) ? allproduct : [];
    if (selectedCategory === "all") return productsArray;
    return productsArray.filter((product) => product.category === selectedCategory);
  }, [allproduct, selectedCategory]);

  const cardsPerRow = getCardsPerRow();
  const totalProducts = filteredProducts.length;
  
  // Calculate total number of pages
  const totalPages = Math.ceil(totalProducts / cardsPerRow);
  
  // Reset page when category or screen size changes
  useEffect(() => {
    setCurrentPage(0);
  }, [selectedCategory, cardsPerRow]);

  // Get products for current page
  const getCurrentPageProducts = useCallback(() => {
    const startIndex = currentPage * cardsPerRow;
    const endIndex = startIndex + cardsPerRow;
    return filteredProducts.slice(startIndex, endIndex);
  }, [currentPage, filteredProducts, cardsPerRow]);

  // Navigation functions
  const nextPage = useCallback(() => {
    setCurrentPage((prev) => {
      const nextPage = prev + 1;
      if (nextPage >= totalPages) {
        return 0; // Loop back to first page
      }
      return nextPage;
    });
  }, [totalPages]);

  const prevPage = useCallback(() => {
    setCurrentPage((prev) => {
      const prevPage = prev - 1;
      if (prevPage < 0) {
        return totalPages - 1; // Loop to last page
      }
      return prevPage;
    });
  }, [totalPages]);

  const goToPage = useCallback((pageIndex: number) => {
    setCurrentPage(Math.min(pageIndex, totalPages - 1));
  }, [totalPages]);

  // Handle manual navigation with auto-scroll pause/resume
  const handlePrevPage = useCallback(() => {
    prevPage();
    setIsAutoScrolling(false);

    if (autoScrollRestoreTimeout.current) {
      clearTimeout(autoScrollRestoreTimeout.current);
    }

    autoScrollRestoreTimeout.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 8000);
  }, [prevPage]);

  const handleNextPage = useCallback(() => {
    nextPage();
    setIsAutoScrolling(false);

    if (autoScrollRestoreTimeout.current) {
      clearTimeout(autoScrollRestoreTimeout.current);
    }

    autoScrollRestoreTimeout.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 8000);
  }, [nextPage]);

  // Toggle autoplay
  const toggleAutoplay = useCallback(() => {
    setIsAutoScrolling(!isAutoScrolling);
  }, [isAutoScrolling]);

  // Touch handlers for mobile swipe
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe) {
      handleNextPage();
    } else if (isRightSwipe) {
      handlePrevPage();
    }
  };

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling || totalProducts <= cardsPerRow) {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
      return;
    }

    autoScrollInterval.current = setInterval(() => {
      nextPage();
    }, 5000);

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
    };
  }, [isAutoScrolling, totalProducts, cardsPerRow, nextPage]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
      if (autoScrollRestoreTimeout.current) {
        clearTimeout(autoScrollRestoreTimeout.current);
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setCurrentPage(0);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const currentProducts = getCurrentPageProducts();

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-gray-50 to-white py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-950 to-amber-500 rounded-full mb-3 sm:mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></div>
              <span className="text-white text-xs sm:text-sm md:text-md font-semibold">
                All Collections
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Our <span className="text-amber-600">Collections</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base md:text-lg mb-6 sm:mb-8">
              Loading our exclusive collections...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-amber-600"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[60vh] bg-gradient-to-b from-gray-50 to-white py-8 sm:py-12">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-12">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-950 to-amber-500 rounded-full mb-3 sm:mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></div>
              <span className="text-white text-xs sm:text-sm md:text-md font-semibold">
                All Collections
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Our <span className="text-amber-600">Collections</span>
            </h1>
            <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-6 max-w-md mx-auto">
              <p className="text-red-600 font-medium text-sm sm:text-base md:text-lg mb-4">
                Error: {error}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-950 to-amber-500 text-white rounded-lg hover:from-slate-800 hover:to-amber-600 transition-colors font-medium text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const safeFilteredProducts = Array.isArray(filteredProducts) ? filteredProducts : [];
  const safeCategories = Array.isArray(categories) ? categories : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-white py-6 sm:py-8 md:py-12">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Page Header */}
        <div className="relative mb-8 sm:mb-10 md:mb-12">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-950 to-amber-500 rounded-full mb-3 sm:mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></div>
              <span className="text-white text-xs sm:text-sm md:text-md font-semibold">
                All Collections
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 md:mb-6">
              Our <span className="text-amber-600">Collections</span>
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto mb-4 sm:mb-6 md:mb-8 px-4">
              Discover our wide range of premium products.
            </p>
          </div>

          {/* View All Button - Hidden on mobile */}
          {safeFilteredProducts.length > 0 && !isMobile && (
            <div className="hidden sm:block absolute top-0 right-0">
              <Link
                href="/all-collections"
                className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5
                  bg-gradient-to-r from-slate-900 to-slate-700
                  hover:from-slate-950 hover:to-slate-800
                  text-white hover:text-amber-500
                  text-xs sm:text-sm md:text-base font-semibold rounded-full
                  transition-all duration-300
                  shadow-lg hover:shadow-xl"
              >
                View All
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-6 sm:mb-8 md:mb-12" ref={categoryFilterRef}>
          {/* Mobile: Filter Button */}
          {isMobile && (
            <div className="mb-4">
              <button
                onClick={() => setShowCategoryFilter(!showCategoryFilter)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3
                  bg-gradient-to-r from-slate-950 to-amber-500 text-white
                  rounded-lg font-medium shadow-lg"
              >
                <Filter className="w-4 h-4" />
                Filter:{" "}
                {selectedCategory === "all" ? "All Products" : selectedCategory}
                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    showCategoryFilter ? "rotate-90" : ""
                  }`}
                />
              </button>
            </div>
          )}

          {/* Desktop: Full Category Bar */}
          {!isMobile && (
            <div className="mb-4 md:mb-6">
              <div className="flex flex-wrap justify-center gap-2 md:gap-3">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full font-medium transition-all duration-300 text-xs sm:text-sm md:text-base ${
                    selectedCategory === "all"
                      ? "bg-gradient-to-r from-slate-950 to-amber-500 text-white shadow-lg transform scale-105"
                      : "bg-white text-gray-700 hover:text-amber-600 hover:bg-amber-50 border border-gray-300"
                  }`}
                >
                  All Products
                </button>
                {safeCategories
                  .filter((cat) => cat !== "all")
                  .map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-3 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-3 rounded-full font-medium transition-all duration-300 text-xs sm:text-sm md:text-base ${
                        selectedCategory === category
                          ? "bg-gradient-to-r from-slate-950 to-amber-500 text-white shadow-lg transform scale-105"
                          : "bg-white text-gray-700 hover:text-amber-600 hover:bg-amber-50 border border-gray-300"
                      }`}
                    >
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Mobile: Dropdown Category Filter */}
          {isMobile && showCategoryFilter && (
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[90vw] max-w-sm bg-white rounded-xl shadow-2xl border border-gray-200 z-50">
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setSelectedCategory("all");
                      setShowCategoryFilter(false);
                    }}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      selectedCategory === "all"
                        ? "bg-gradient-to-r from-slate-950 to-amber-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    All Products
                  </button>
                  {safeCategories
                    .filter((cat) => cat !== "all")
                    .map((category) => (
                      <button
                        key={category}
                        onClick={() => {
                          setSelectedCategory(category);
                          setShowCategoryFilter(false);
                        }}
                        className={`p-3 rounded-lg text-sm font-medium transition-all ${
                          selectedCategory === category
                            ? "bg-gradient-to-r from-slate-950 to-amber-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* Selected Category Info */}
          <div className="text-center">
            <p className="text-gray-600 text-sm sm:text-base">
              Showing {safeFilteredProducts.length}{" "}
              {selectedCategory === "all"
                ? "products"
                : selectedCategory + " products"}
            </p>
          </div>
        </div>

        {/* Products Carousel */}
        {safeFilteredProducts.length === 0 ? (
          <div className="text-center py-8 sm:py-12 md:py-16 bg-white rounded-xl sm:rounded-2xl shadow-sm">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">😕</div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-900 mb-2">
              No Products Found
            </h3>
            <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6">
              {selectedCategory === "all"
                ? "No products available at the moment."
                : `No products found in the ${selectedCategory} category.`}
            </p>
            {selectedCategory !== "all" && (
              <button
                onClick={() => setSelectedCategory("all")}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-950 to-amber-500 text-white rounded-lg hover:from-slate-800 hover:to-amber-600 transition-colors font-medium text-sm sm:text-base"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          <div
            className="relative px-4 sm:px-6 md:px-8 lg:px-10"
            ref={containerRef}
          >
            {/* Custom Navigation Buttons */}
            {totalProducts > cardsPerRow && (
              <>
                <button
                  onClick={handlePrevPage}
                  className={`absolute left-0 sm:left-2 top-1/2 -translate-y-1/2 z-10
                    ${isMobile ? "w-8 h-8" : "w-10 h-10 md:w-12 md:h-12"}
                    bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg
                    flex items-center justify-center transition-all duration-300
                    hover:bg-white hover:shadow-xl hover:scale-110 active:scale-95`}
                  aria-label="Previous page"
                >
                  <ChevronLeft
                    className={`${
                      isMobile ? "w-4 h-4" : "w-5 h-5 md:w-6 md:h-6"
                    } text-gray-700`}
                  />
                </button>

                <button
                  onClick={handleNextPage}
                  className={`absolute right-0 sm:right-2 top-1/2 -translate-y-1/2 z-10
                    ${isMobile ? "w-8 h-8" : "w-10 h-10 md:w-12 md:h-12"}
                    bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg
                    flex items-center justify-center transition-all duration-300
                    hover:bg-white hover:shadow-xl hover:scale-110 active:scale-95`}
                  aria-label="Next page"
                >
                  <ChevronRight
                    className={`${
                      isMobile ? "w-4 h-4" : "w-5 h-5 md:w-6 md:h-6"
                    } text-gray-700`}
                  />
                </button>
              </>
            )}

            {/* Autoplay Toggle */}
            {!isMobile && totalProducts > cardsPerRow && (
              <div className="absolute -top-12 right-0 z-10">
                <button
                  onClick={toggleAutoplay}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm
                    border border-gray-200 rounded-lg text-xs font-medium text-gray-600
                    hover:bg-white hover:shadow-lg transition-all shadow-sm"
                  title={
                    isAutoScrolling ? "Pause auto-scroll" : "Resume auto-scroll"
                  }
                >
                  {isAutoScrolling ? (
                    <>
                      <Pause className="w-3 h-3" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3" />
                      Play
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Products Grid with Touch Support */}
            <div 
              className="overflow-hidden"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Responsive grid - ALWAYS shows 2 columns on mobile */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 transition-all duration-500 ease-in-out">
                {currentProducts.map((product) => (
                  <div
                    key={product._id || product.id}
                    className="animate-fadeIn"
                  >
                    <ProductCard
                      product={product}
                      viewMode="grid"
                      showQuickView={!isMobile}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Carousel Indicators */}
            {totalProducts > cardsPerRow && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 sm:mt-8">
                {/* Mobile: Compact indicators */}
                {isMobile ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrevPage}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: Math.min(totalPages, 5) }).map(
                        (_, index) => (
                          <button
                            key={index}
                            onClick={() => goToPage(index)}
                            className={`transition-all duration-300 ${
                              index === currentPage
                                ? "w-6 h-2 bg-amber-500 rounded-full"
                                : "w-1.5 h-1.5 bg-gray-300 rounded-full hover:bg-gray-400"
                            }`}
                            aria-label={`Go to page ${index + 1}`}
                          />
                        )
                      )}
                      {totalPages > 5 && (
                        <span className="text-xs text-gray-500 ml-1">
                          {currentPage + 1}/{totalPages}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleNextPage}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </div>
                ) : (
                  /* Desktop: Full indicators */
                  <>
                    <button
                      onClick={handlePrevPage}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToPage(index)}
                          className={`transition-all duration-300 ${
                            index === currentPage
                              ? "w-8 h-2 bg-amber-500 rounded-full"
                              : "w-2 h-2 bg-gray-300 rounded-full hover:bg-gray-400"
                          }`}
                          aria-label={`Go to page ${index + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNextPage}
                      className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                      aria-label="Next page"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                  </>
                )}

                {/* Mobile: Autoplay toggle */}
                {isMobile && totalProducts > cardsPerRow && (
                  <button
                    onClick={toggleAutoplay}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm
                      border border-gray-200 rounded-lg text-xs font-medium text-gray-600
                      hover:bg-white hover:shadow-lg transition-all shadow-sm mt-2"
                  >
                    {isAutoScrolling ? (
                      <>
                        <Pause className="w-3 h-3" />
                        Pause Auto
                      </>
                    ) : (
                      <>
                        <Play className="w-3 h-3" />
                        Play Auto
                      </>
                    )}
                  </button>
                )}
              </div>
            )}

            {/* Mobile: View All Button at bottom */}
            {isMobile && safeFilteredProducts.length > 0 && (
              <div className="flex justify-center mt-6">
                <Link
                  href="/all-collections"
                  className="inline-flex items-center px-6 py-3
                    bg-gradient-to-r from-slate-900 to-slate-700
                    hover:from-slate-950 hover:to-slate-800
                    text-white hover:text-amber-500
                    font-semibold rounded-full
                    transition-all duration-300
                    shadow-lg hover:shadow-xl text-base"
                >
                  View All Products
                  <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCollectionsSection;