// client/src/app/category/page.tsx

"use client";

import { useRef, useState, useEffect } from "react";

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

export default function CategoryPage() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const animationRef = useRef<number>(0);
  const [isClient, setIsClient] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  // Only 3 categories - each with its own card
  const categories: Category[] = [
    {
      id: "1",
      name: "Classic Panjabi",
      description: "Luxurious classic collections with premium fabrics and timeless designs",
      imageUrl: "/panjabi-jummah.png",
      slug: "classic-panjabi",
      productCount: 0,
      gradient: "from-slate-950 to-amber-500",
      bgGradient: ""
    },
    {
      id: "2",
      name: "Cotton Panjabi",
      description: "Comfortable daily wear perfect for everyday use and casual occasions",
      imageUrl: "/panjabi-jummah.png",
      slug: "cotton-panjabi",
      productCount: 0,
      gradient: "from-slate-950 to-amber-500",
      bgGradient: "from-blue-50 to-cyan-50"
    },
    {
      id: "3",
      name: "Linen Panjabi",
      description: "Smooth and elegant designs for sophisticated looks and formal events",
      imageUrl: "/panjabi-jummah.png",
      slug: "linen-panjabi",
      productCount: 0,
      gradient: "from-slate-950 to-amber-500",
      bgGradient: "from-red-50 to-orange-50"
    }
  ];

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
  const handleImageError = (categoryId: string, categoryName: string, fallbackImage: string) => {
    setImageErrors(prev => new Set(prev).add(categoryId));
  };

  // Initialize component
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Don't render until client-side
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-950 to-amber-600 rounded-full mb-4">
            <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
            <span className="text-white text-md font-semibold">
              Loading Categories
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-blue-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Categories Grid - Static display on category page */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => {
            const fallbackImage = getDefaultImage(category.name);
            const hasError = imageErrors.has(category.id);
            
            return (
              <a
                key={category.id}
                href={`/category/${category.slug}`}
                className="group block"
              >
                {/* SQUARE CARD CONTAINER */}
                <div className="relative w-full h-[480px] bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl overflow-hidden transform transition-all duration-500 group-hover:scale-[1.02] group-hover:shadow-2xl">
                  
                  {/* Top Gradient Bar */}
                  <div className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${category.gradient} z-20`}></div>
                  
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className={`absolute inset-0 bg-gradient-to-br ${category.bgGradient}`}></div>
                  </div>
                  
                  {/* Category Image - Square Format */}
                  <div className="relative h-[280px] w-full overflow-hidden">
                    {/* Image with gradient overlay */}
                    <div className="absolute inset-0">
                      <img
                        src={hasError ? fallbackImage : category.imageUrl}
                        alt={category.name}
                        className="w-full h-full object-cover transform transition-all duration-700 group-hover:scale-110"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = fallbackImage;
                          handleImageError(category.id, category.name, fallbackImage);
                        }}
                        loading="lazy"
                        crossOrigin="anonymous"
                      />
                      {/* Gradient overlay on image */}
                      <div className={`absolute inset-0 bg-gradient-to-t ${category.gradient} opacity-20 group-hover:opacity-30 transition-opacity duration-500`}></div>
                    </div>
                    
                    {/* Product Count Badge */}
                    <div className="absolute top-4 right-4 z-10">
                      <div className={`px-4 py-2 bg-gradient-to-r ${category.gradient} text-white font-bold rounded-full shadow-lg transform transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1`}>
                        <span className="inline-flex items-center">
                          <span className="mr-2">🔥</span>
                          {category.productCount}+ Items
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Content Area */}
                  <div className="p-8 h-[200px] flex flex-col justify-between">
                    {/* Category Name and Description */}
                    <div>
                      <h3 className="font-bold text-gray-900 text-2xl mb-3 group-hover:text-amber-600 transition-colors duration-300">
                        {category.name}
                      </h3>
                      <p className="text-gray-600 text-base leading-relaxed line-clamp-2">
                        {category.description}
                      </p>
                    </div>
                    
                    {/* Bottom section with gradient and button */}
                    <div className="mt-4">
                      {/* Gradient Line */}
                      <div className={`h-1 w-24 bg-gradient-to-r ${category.gradient} rounded-full mb-4 transform transition-all duration-500 group-hover:w-32`}></div>
                      
                      {/* Explore Button */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-500">
                          Click to explore
                        </span>
                        <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white rounded-lg transform transition-all duration-300 group-hover:scale-105 group-hover:bg-gradient-to-r group-hover:from-amber-500 group-hover:to-amber-600">
                          <span className="mr-2">→</span>
                          Shop Now
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effects */}
                  <div className={`absolute inset-0 border-2 border-transparent group-hover:border-gradient-to-r ${category.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>
                  
                  {/* Floating elements on hover */}
                  <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none"></div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}