// client/src/components/ShopCategories.tsx

"use client";

import Link from "next/link";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  slug: string;
  productCount: number;
  gradient: string;
  bgGradient: string;
}

export default function ShopCategories() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  // Only 3 categories - each with its own card
  const categories: Category[] = [
    {
      id: "1",
      name: "Regular panjabi",
      description: "Luxurious classic collections with premium fabrics and timeless designs",
      imageUrl: "/regular1.jpeg",
      slug: "regular-panjabi",
      productCount: 10,
      gradient: "from-slate-950 to-amber-500",
      bgGradient: "",
    },
    {
      id: "2",
      name: "Premium panjabi",
      description: "Comfortable daily wear perfect for everyday use and casual occasions",
      imageUrl: "/premium1.jpeg",
      slug: "premium-panjabi",
      productCount: 17,
      gradient: "from-slate-950 to-amber-500",
      bgGradient: "from-blue-50 to-cyan-50",
    },
    {
      id: "3",
      name: "Luxury Panjabi",
      description: "Smooth and elegant designs for sophisticated looks and formal events",
      imageUrl: "/luxury1.jpeg",
      slug: "luxury-panjabi",
      productCount: 3,
      gradient: "from-slate-950 to-amber-500",
      bgGradient: "from-red-50 to-orange-50",
    },
  ];

  // For mobile: use original categories (no duplication)
  const mobileCategories = categories;

  // For desktop: duplicate for infinite scroll
  const desktopCategories = [...categories, ...categories, ...categories];

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024;
      
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Get default image for fallback
  const getDefaultImage = (categoryName: string): string => {
    const name = categoryName.toLowerCase();
    if (name.includes("classic") || name.includes("panjabi") || name.includes("punjabi"))
      return "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&h=500&fit=crop&crop=center";
    if (name.includes("cotton"))
      return "https://images.unsplash.com/photo-1520004434532-668416a08753?w=500&h=500&fit=crop&crop=center";
    if (name.includes("linen"))
      return "https://images.unsplash.com/photo-1523381140794-a1eef18a37c3?w=500&h=500&fit=crop&crop=center";

    return "https://images.unsplash.com/photo-1558769132-cb1a40ed0ada?w=500&h=500&fit=crop&crop=center";
  };

  // Handle image loading errors
  const handleImageError = (categoryId: string) => {
    setImageErrors((prev) => new Set(prev).add(categoryId));
  };

  // Infinite auto-scroll animation (desktop only)
  const startInfiniteScroll = () => {
    if (!scrollContainerRef.current || isPaused || categories.length === 0 || isMobile)
      return;

    const container = scrollContainerRef.current;
    const scrollSpeed = 1.2;

    container.scrollLeft += scrollSpeed;

    // Calculate when to reset for seamless loop
    const singleSetWidth = container.scrollWidth / 3;

    if (container.scrollLeft >= singleSetWidth - 10) {
      container.scrollLeft = 0;
    }

    animationRef.current = requestAnimationFrame(startInfiniteScroll);
  };

  // Initialize scroll animation
  useEffect(() => {
    if (categories.length === 0 || isMobile) return;

    const container = scrollContainerRef.current;

    if (container) {
      container.scrollLeft = 0;
      animationRef.current = requestAnimationFrame(startInfiniteScroll);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isPaused, categories.length, isMobile]);

  // Check scroll position for arrows
  const checkScrollPosition = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    
    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Handle manual scroll
  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollPosition, 300);
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkScrollPosition, 300);
    }
  };

  // Add scroll event listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', checkScrollPosition);
      checkScrollPosition(); // Initial check
      
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, []);

  // Pause on hover for better UX
  const handleMouseEnter = () => !isMobile && setIsPaused(true);
  const handleMouseLeave = () => !isMobile && setIsPaused(false);

  return (
    <section
      id="shopbycategory"
      className="py-8 sm:py-12 lg:py-16 bg-gradient-to-br from-white via-gray-50 to-blue-50"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="relative mb-8 sm:mb-12">
          <div className="text-center">
            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-slate-950 to-amber-600 rounded-full mb-3 sm:mb-4">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full mr-2 animate-pulse"></div>
              <span className="text-white text-sm sm:text-md font-semibold">
                Shop By Category
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
              Explore Our{" "}
              <span className="bg-gradient-to-r from-amber-600 to-slate-950 bg-clip-text text-transparent">
                Category
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Classic Panjabi, Cotton Panjabi & Linen Panjabi - Find Your Perfect Fit
            </p>
          </div>

          {/* View All Button - Hidden on mobile, visible on tablet+ */}
          <div className="hidden sm:block absolute top-0 right-0">
            <Link
              href="/category"
              className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 md:py-2.5
                bg-gradient-to-r from-slate-900 to-slate-700
                hover:from-slate-950 hover:to-slate-800
                text-white hover:text-amber-500
                text-sm sm:text-base font-semibold rounded-full
                transition-all duration-300
                shadow-lg hover:shadow-xl"
            >
              View All
              <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Categories Container */}
        <div
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Desktop: Navigation Arrows */}
          {!isMobile && (
            <>
              {showLeftArrow && (
                <button
                  onClick={scrollLeft}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10
                    w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full
                    flex items-center justify-center shadow-lg
                    hover:bg-white hover:scale-110 transition-all duration-300
                    border border-gray-200"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-700" />
                </button>
              )}
              {showRightArrow && (
                <button
                  onClick={scrollRight}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10
                    w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full
                    flex items-center justify-center shadow-lg
                    hover:bg-white hover:scale-110 transition-all duration-300
                    border border-gray-200"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-5 h-5 text-gray-700" />
                </button>
              )}
            </>
          )}

          {/* Mobile: Manual Scroll Container */}
          <div
            ref={scrollContainerRef}
            className={`flex ${isMobile ? 'gap-4 sm:gap-6 pb-4 overflow-x-auto' : 'gap-6 lg:gap-8 pb-8 overflow-x-hidden'} 
              scrollbar-hide`}
            style={{
              WebkitOverflowScrolling: "touch",
            }}
          >
            {(isMobile ? mobileCategories : desktopCategories).map((category, index) => {
              const fallbackImage = getDefaultImage(category.name);
              const hasError = imageErrors.has(category.id);

              return (
                <div
                  key={`${category.id}-${index}`}
                  className={`group ${isMobile ? 'flex-shrink-0 w-[280px]' : 'flex-shrink-0'}`}
                >
                  <Link href={`/category/${category.slug}`} className="block">
                    {/* Responsive Card Container */}
                    <div className={`
                      relative bg-gradient-to-br from-white to-gray-50 rounded-xl sm:rounded-2xl shadow-lg sm:shadow-xl
                      overflow-hidden transform transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl
                      ${isMobile ? 'w-full h-[440px]' : 'w-[320px] lg:w-[360px] xl:w-[380px] h-[480px] lg:h-[520px] xl:h-[550px]'}
                    `}>
                      {/* Top Gradient Bar */}
                      <div
                        className={`absolute top-0 left-0 right-0 h-1.5 sm:h-2 bg-gradient-to-r ${category.gradient} z-20`}
                      ></div>

                      {/* Category Image Container */}
                      <div className={`
                        relative ${isMobile ? 'h-[240px]' : 'h-[280px] lg:h-[320px] xl:h-[350px]'} 
                        w-full overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-100
                        flex items-center justify-center p-4
                      `}>
                        {/* Image Wrapper */}
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img
                            src={hasError ? fallbackImage : category.imageUrl}
                            alt={category.name}
                            className="max-w-full max-h-full object-contain transform transition-all duration-700 group-hover:scale-105"
                            onError={() => handleImageError(category.id)}
                            loading="lazy"
                          />
                          {/* Subtle Gradient Overlay */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-10 group-hover:opacity-15 transition-opacity duration-500`}
                          ></div>
                        </div>

                        {/* Product Count Badge */}
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
                          <div
                            className={`px-2 py-1 sm:px-3 sm:py-1.5 lg:px-4 lg:py-2 
                              bg-gradient-to-r ${category.gradient} text-white font-bold 
                              rounded-full shadow-lg transform transition-all duration-300 
                              group-hover:scale-110 group-hover:-translate-y-1 text-xs sm:text-sm`}
                          >
                            <span className="inline-flex items-center">
                              <span className="mr-1 sm:mr-2">🔥</span>
                              {category.productCount}+ Items
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Category Content Area */}
                      <div className={`p-4 sm:p-6 lg:p-8 flex flex-col justify-between ${isMobile ? 'h-[200px]' : 'h-[200px] lg:h-[200px] xl:h-[200px]'}`}>
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg sm:text-xl lg:text-2xl mb-2 sm:mb-3 
                            group-hover:text-amber-600 transition-colors duration-300">
                            {category.name}
                          </h3>
                          <p className="text-gray-600 text-sm sm:text-base leading-relaxed line-clamp-2">
                            {category.description}
                          </p>
                        </div>

                        {/* Bottom section */}
                        <div className="mt-3 sm:mt-4">
                          <div
                            className={`h-1 w-16 sm:w-20 lg:w-24 bg-gradient-to-r ${category.gradient} rounded-full mb-3 sm:mb-4 
                              transform transition-all duration-500 group-hover:w-20 sm:group-hover:w-28 lg:group-hover:w-32`}
                          ></div>

                          {/* Explore Button */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm font-semibold text-gray-500">
                              Click to explore
                            </span>
                            <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 
                              bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-lg 
                              transform transition-all duration-300 group-hover:scale-105 
                              group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-amber-600
                              text-sm">
                              <span className="mr-1 sm:mr-2">→</span>
                              Shop Now
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Mobile: View All Button at bottom */}
          {isMobile && (
            <div className="flex justify-center mt-6 sm:mt-8">
              <Link
                href="/category"
                className="inline-flex items-center px-6 py-3
                  bg-gradient-to-r from-slate-900 to-slate-700
                  hover:from-slate-950 hover:to-slate-800
                  text-white hover:text-amber-500
                  font-semibold rounded-full
                  transition-all duration-300
                  shadow-lg hover:shadow-xl text-base"
              >
                View All Categories
                <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          )}

          {/* Mobile: Scroll Indicators */}
          {isMobile && (
            <div className="flex justify-center gap-1.5 mt-4">
              {mobileCategories.map((_, index) => (
                <div
                  key={index}
                  className="w-2 h-2 rounded-full bg-gray-300"
                ></div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}