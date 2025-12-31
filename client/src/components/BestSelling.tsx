// client/src/components/BestSelling.tsx

"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  ArrowRight,
  Filter,
} from "lucide-react";
import {
  fetchAllProducts,
  fetchBestSellingProducts,
} from "@/lib/utils/product.api";
import { Product } from "@/types/product.types";

interface Category {
  key: string;
  label: string;
}

export default function BestSelling() {
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [showCategoryFilter, setShowCategoryFilter] = useState<boolean>(false);

  // Carousel state
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [isAutoScrolling, setIsAutoScrolling] = useState<boolean>(true);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);
  const autoScrollRestoreTimeout = useRef<NodeJS.Timeout | null>(null);
  const categoryFilterRef = useRef<HTMLDivElement>(null);

  
  const API_URL=process.env.NEXT_PUBLIC_API_URL

  // Check if mobile
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

  // Close category filter on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryFilterRef.current && !categoryFilterRef.current.contains(event.target as Node)) {
        setShowCategoryFilter(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch best selling products
        const bestSellingProducts = await fetchBestSellingProducts();
        setProducts(bestSellingProducts);

        // Fetch all products for categories
        const allProducts = await fetchAllProducts();

        // Extract unique categories from best selling products
        const uniqueCategories = new Set<string>();
        const allCategories: Category[] = [
          { key: "all", label: "Popular" },
        ];

        allProducts.forEach((product) => {
          if (product.category) {
            const categoryKey = product.category.toLowerCase().trim();
            const categoryLabel =
              product.category.charAt(0).toUpperCase() +
              product.category.slice(1);

            if (!uniqueCategories.has(categoryKey)) {
              uniqueCategories.add(categoryKey);
              allCategories.push({
                key: categoryKey,
                label: categoryLabel,
              });
            }
          }
        });

        setCategories(allCategories);
      } catch (error: any) {
        console.error("Error fetching products:", error);
        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filter products when activeFilter changes
  useEffect(() => {
    if (activeFilter === "all") {
      setFilteredProducts(products.slice(0, 12)); // Show 12 best sellers for carousel
    } else {
      // Filter by category
      const categoryProducts = products
        .filter(
          (product) =>
            product.category?.toLowerCase() === activeFilter.toLowerCase()
        )
        .slice(0, 12);
      setFilteredProducts(categoryProducts);
    }
    setCurrentSlide(0); // Reset carousel when filter changes
  }, [activeFilter, products]);

  // Calculate number of slides based on screen size
  const getSlidesPerView = useCallback(() => {
    if (typeof window === "undefined") return 4;

    const width = window.innerWidth;
    if (width < 640) return 1;
    if (width < 768) return 1.5;
    if (width < 1024) return 2;
    if (width < 1280) return 3;
    return 4;
  }, []);

  // Calculate total slides
  const totalSlides = Math.max(
    1,
    Math.ceil(filteredProducts.length / Math.ceil(getSlidesPerView()))
  );

  // Navigation functions
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const nextSlide = prev + 1;
      if (nextSlide >= totalSlides) return 0;
      return nextSlide;
    });
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const prevSlide = prev - 1;
      if (prevSlide < 0) return totalSlides - 1;
      return prevSlide;
    });
  }, [totalSlides]);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Handle manual navigation with auto-scroll pause/resume
  const handlePrevSlide = useCallback(() => {
    prevSlide();
    // Pause autoplay briefly on manual navigation
    setIsAutoScrolling(false);

    if (autoScrollRestoreTimeout.current) {
      clearTimeout(autoScrollRestoreTimeout.current);
    }

    // Restart auto-scroll after 3 seconds of inactivity
    autoScrollRestoreTimeout.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 3000);
  }, [prevSlide]);

  const handleNextSlide = useCallback(() => {
    nextSlide();
    // Pause autoplay briefly on manual navigation
    setIsAutoScrolling(false);

    if (autoScrollRestoreTimeout.current) {
      clearTimeout(autoScrollRestoreTimeout.current);
    }

    // Restart auto-scroll after 3 seconds of inactivity
    autoScrollRestoreTimeout.current = setTimeout(() => {
      setIsAutoScrolling(true);
    }, 3000);
  }, [nextSlide]);

  const toggleAutoplay = useCallback(() => {
    setIsAutoScrolling(!isAutoScrolling);
  }, [isAutoScrolling]);

  // Auto-scroll functionality
  useEffect(() => {
    if (!isAutoScrolling || filteredProducts.length === 0 || totalSlides <= 1) {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
      return;
    }

    autoScrollInterval.current = setInterval(() => {
      nextSlide();
    }, 3000);

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
        autoScrollInterval.current = null;
      }
    };
  }, [isAutoScrolling, filteredProducts.length, totalSlides, nextSlide]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (autoScrollRestoreTimeout.current) {
        clearTimeout(autoScrollRestoreTimeout.current);
      }
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, []);

  // Handle mouse hover (desktop only)
  const handleMouseEnter = useCallback(() => {
    if (!isMobile) {
      setIsAutoScrolling(false);
      if (autoScrollRestoreTimeout.current) {
        clearTimeout(autoScrollRestoreTimeout.current);
        autoScrollRestoreTimeout.current = null;
      }
    }
  }, [isMobile]);

  const handleMouseLeave = useCallback(() => {
    if (!isMobile) {
      setIsAutoScrolling(true);
    }
  }, [isMobile]);

  // Get products for current slide
  const getCurrentSlideProducts = useCallback(() => {
    const slidesPerView = Math.ceil(getSlidesPerView());
    const startIndex = currentSlide * slidesPerView;
    const endIndex = startIndex + slidesPerView;
    return filteredProducts.slice(startIndex, endIndex);
  }, [currentSlide, filteredProducts, getSlidesPerView]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setCurrentSlide(0);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Loading state
  if (loading) {
    return (
      <section id="best-selling" className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-950 to-amber-500 rounded-full mb-3 sm:mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></div>
              <span className="text-white text-xs sm:text-sm md:text-md font-semibold">
                Best Selling
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
              Customer{" "}
              <span className="bg-gradient-to-r from-slate-950 to-amber-500 bg-clip-text text-transparent">
                Favorites
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-slate-600 mb-6 sm:mb-8">
              Loading our most popular products...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-b-2 border-amber-600"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="best-selling" className="py-8 sm:py-12 md:py-16 bg-white">
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
          <div className="text-center mb-8 sm:mb-10 md:mb-12">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-950 to-amber-500 rounded-full mb-3 sm:mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></div>
              <span className="text-white text-xs sm:text-sm md:text-md font-semibold">
                Best Selling
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
              Customer{" "}
              <span className="bg-gradient-to-r from-slate-950 to-amber-500 bg-clip-text text-transparent">
                Favorites
              </span>
            </h2>
            <div className="bg-red-50 border border-red-200 rounded-lg sm:rounded-xl p-4 sm:p-6 max-w-md mx-auto">
              <p className="text-red-600 font-medium text-sm sm:text-base mb-4">Error: {error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-950 to-amber-500 text-white rounded-lg hover:from-slate-800 hover:to-amber-600 transition-colors font-medium text-sm sm:text-base"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="best-selling" className="py-8 sm:py-12 md:py-16 bg-white relative">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="relative mb-8 sm:mb-10 md:mb-12">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-950 to-amber-500 rounded-full mb-3 sm:mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-amber-300 rounded-full mr-2 animate-pulse"></div>
              <span className="text-white text-xs sm:text-sm md:text-md font-semibold">
                Best Selling
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-3 sm:mb-4">
              Customer{" "}
              <span className="bg-gradient-to-r from-slate-950 to-amber-500 bg-clip-text text-transparent">
                Favorites
              </span>
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-slate-600 max-w-4xl mx-auto mb-4 sm:mb-6 md:mb-8 px-4">
              Discover our most loved products — chosen by customers.
            </p>
          </div>

          {/* View All Button - Hidden on mobile */}
          {filteredProducts.length > 0 && !isMobile && (
            <div className="absolute top-0 right-0">
              <Link
                href="/best-selling"
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
                  rounded-lg font-medium shadow-lg text-sm sm:text-base"
              >
                <Filter className="w-4 h-4" />
                Filter: {activeFilter === "all" ? "Popular" : categories.find(c => c.key === activeFilter)?.label || activeFilter}
                <ChevronRight className={`w-4 h-4 transition-transform ${showCategoryFilter ? "rotate-90" : ""}`} />
              </button>
            </div>
          )}

          {/* Desktop: Full Category Bar */}
          {!isMobile && (
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {categories.map((category) => (
                <button
                  key={category.key}
                  onClick={() => setActiveFilter(category.key)}
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5 rounded-full font-medium
                    transition-all duration-300 text-xs sm:text-sm md:text-base
                    ${activeFilter === category.key
                      ? `
                        bg-gradient-to-r from-slate-900 to-slate-700
                        hover:from-slate-950 hover:to-slate-800
                        text-white hover:text-amber-500
                        shadow-lg scale-105 cursor-pointer
                      `
                      : `
                        bg-white text-slate-800
                        border border-slate-200
                        hover:bg-slate-50 hover:text-amber-600 cursor-pointer
                      `
                    }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          )}

          {/* Mobile: Dropdown Category Filter */}
          {isMobile && showCategoryFilter && (
            <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-[90vw] max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 z-50">
              <div className="p-4">
                <div className="grid grid-cols-2 gap-2">
                  {categories.map((category) => (
                    <button
                      key={category.key}
                      onClick={() => {
                        setActiveFilter(category.key);
                        setShowCategoryFilter(false);
                      }}
                      className={`p-3 rounded-lg text-sm font-medium transition-all ${
                        activeFilter === category.key
                          ? "bg-gradient-to-r from-slate-950 to-amber-500 text-white"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {category.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Selected Category Info */}
        <div className="text-center mb-4 sm:mb-6">
          <p className="text-slate-600 text-sm sm:text-base">
            Showing {filteredProducts.length}{" "}
            {activeFilter === "all"
              ? "best selling products"
              : activeFilter + " best sellers"}
          </p>
        </div>

        {/* Products Carousel */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 sm:py-12 bg-white rounded-lg sm:rounded-2xl shadow-sm border border-slate-200">
            <div className="text-4xl sm:text-5xl mb-3 sm:mb-4">😕</div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-semibold text-slate-900 mb-2">
              No Products Found
            </h3>
            <p className="text-slate-600 text-sm sm:text-base mb-4 sm:mb-6">
              {activeFilter === "all"
                ? "No best selling products available at the moment."
                : `No products found in the ${activeFilter} category.`}
            </p>
            {activeFilter !== "all" && (
              <button
                onClick={() => setActiveFilter("all")}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-slate-950 to-amber-500 text-white rounded-lg hover:from-slate-800 hover:to-amber-600 transition-colors font-medium text-sm sm:text-base"
              >
                View All Products
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Carousel Container */}
            <div
              className="relative px-4 sm:px-6 md:px-8 lg:px-10"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              ref={containerRef}
            >
              {/* Auto-scroll toggle - Desktop only */}
              {!isMobile && totalSlides > 1 && (
                <div className="absolute -top-12 right-0 z-10">
                  <button
                    onClick={toggleAutoplay}
                    className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg 
                      text-xs font-medium text-slate-600 hover:bg-white hover:shadow-lg transition-all shadow-sm"
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

              {/* Navigation Buttons */}
              {totalSlides > 1 && (
                <>
                  <button
                    onClick={handlePrevSlide}
                    disabled={currentSlide === 0}
                    className={`absolute ${isMobile ? 'left-0' : 'left-2 sm:left-4'} top-1/2 -translate-y-1/2 z-10 
                      ${isMobile ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'} 
                      bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full shadow-lg 
                      flex items-center justify-center transition-all duration-300 
                      hover:bg-white hover:shadow-xl hover:scale-110 active:scale-95 
                      ${currentSlide === 0
                        ? "opacity-50 cursor-not-allowed"
                        : "opacity-100"
                      }`}
                    aria-label="Previous slide"
                  >
                    <ChevronLeft className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'} text-slate-700`} />
                  </button>

                  <button
                    onClick={handleNextSlide}
                    disabled={currentSlide === totalSlides - 1}
                    className={`absolute ${isMobile ? 'right-0' : 'right-2 sm:right-4'} top-1/2 -translate-y-1/2 z-10 
                      ${isMobile ? 'w-8 h-8' : 'w-10 h-10 sm:w-12 sm:h-12'} 
                      bg-white/90 backdrop-blur-sm border border-slate-200 rounded-full shadow-lg 
                      flex items-center justify-center transition-all duration-300 
                      hover:bg-white hover:shadow-xl hover:scale-110 active:scale-95 
                      ${currentSlide === totalSlides - 1
                        ? "opacity-50 cursor-not-allowed"
                        : "opacity-100"
                      }`}
                    aria-label="Next slide"
                  >
                    <ChevronRight className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5 sm:w-6 sm:h-6'} text-slate-700`} />
                  </button>
                </>
              )}

              {/* Products Grid - Responsive */}
              <div className="overflow-hidden">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                  {getCurrentSlideProducts().map((product) => (
                    <div
                      key={product._id || product.id}
                      className="animate-fadeIn"
                    >
                      <ProductCard
                        product={product}
                        viewMode="grid"
                        showQuickView={!isMobile} // Hide quick view on mobile
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Carousel Indicators */}
            {totalSlides > 1 && (
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-6 sm:mt-8">
                {/* Mobile: Compact indicators */}
                {isMobile ? (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handlePrevSlide}
                      disabled={currentSlide === 0}
                      className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${
                        currentSlide === 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>

                    <div className="flex items-center gap-1.5">
                      {Array.from({ length: Math.min(totalSlides, 5) }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`transition-all duration-300 ${
                            index === currentSlide
                              ? "w-6 h-2 bg-amber-500 rounded-full"
                              : "w-1.5 h-1.5 bg-slate-300 rounded-full hover:bg-slate-400"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                      {totalSlides > 5 && (
                        <span className="text-xs text-slate-500 ml-1">
                          {currentSlide + 1}/{totalSlides}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={handleNextSlide}
                      disabled={currentSlide === totalSlides - 1}
                      className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${
                        currentSlide === totalSlides - 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                  </div>
                ) : (
                  /* Desktop: Full indicators */
                  <>
                    <button
                      onClick={handlePrevSlide}
                      disabled={currentSlide === 0}
                      className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${
                        currentSlide === 0 ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      aria-label="Previous slide"
                    >
                      <ChevronLeft className="w-5 h-5 text-slate-600" />
                    </button>

                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalSlides }).map((_, index) => (
                        <button
                          key={index}
                          onClick={() => goToSlide(index)}
                          className={`transition-all duration-300 ${
                            index === currentSlide
                              ? "w-8 h-2 bg-amber-500 rounded-full"
                              : "w-2 h-2 bg-slate-300 rounded-full hover:bg-slate-400"
                          }`}
                          aria-label={`Go to slide ${index + 1}`}
                        />
                      ))}
                    </div>

                    <button
                      onClick={handleNextSlide}
                      disabled={currentSlide === totalSlides - 1}
                      className={`p-2 rounded-full hover:bg-slate-100 transition-colors ${
                        currentSlide === totalSlides - 1
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                      aria-label="Next slide"
                    >
                      <ChevronRight className="w-5 h-5 text-slate-600" />
                    </button>
                  </>
                )}

                {/* Mobile: Autoplay toggle */}
                {isMobile && totalSlides > 1 && (
                  <button
                    onClick={toggleAutoplay}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/90 backdrop-blur-sm 
                      border border-slate-200 rounded-lg text-xs font-medium text-slate-600 
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
            {isMobile && filteredProducts.length > 0 && (
              <div className="flex justify-center mt-6">
                <Link
                  href="/best-selling"
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
          </>
        )}
      </div>
    </section>
  );
}