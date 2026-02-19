// client/src/components/HeroBanner.tsx

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { bannerSlides } from "@/lib/banner-data";

// Main Hero Component
export default function HeroWithFeatures() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = bannerSlides;

  // Auto-rotate slides
  useEffect(() => {
    if (slides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <section className="relative w-full min-h-[500px] sm:min-h-[600px] lg:min-h-[650px] xl:min-h-[700px] 2xl:min-h-[800px] overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${slide.image})`,
              backgroundPosition: "center",
              backgroundSize: "cover",
              backgroundColor: "#1e293b", // Fallback color (slate-800)
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-800/70"></div>
          </div>

          <div className="relative h-full flex items-center">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 max-w-7xl mx-auto">
              <div className="max-w-2xl mx-auto lg:mx-0 lg:ml-8 xl:ml-16 text-center lg:text-left">
                {/* Category Badge */}
                <div
                  className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6 shadow-lg"
                  style={{
                    background:
                      slide.badge === "Classic"
                        ? "linear-gradient(135deg, #d97706, #b45309)"
                        : slide.badge === "Premium"
                          ? "linear-gradient(135deg, #10b981, #059669)"
                          : slide.badge === "New"
                            ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                            : "linear-gradient(135deg, #8b5cf6, #7c3aed)",
                  }}
                >
                  <div
                    className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 animate-pulse ${
                      slide.badge === "Classic"
                        ? "bg-amber-300"
                        : slide.badge === "Premium"
                          ? "bg-green-300"
                          : slide.badge === "New"
                            ? "bg-blue-300"
                            : "bg-purple-300"
                    }`}
                  ></div>
                  <span className="text-white text-xs sm:text-sm font-semibold">
                    {slide.badge}
                  </span>
                </div>

                {/* Collection Label */}
                <div className="mb-3 sm:mb-4">
                  <span className="text-amber-300 text-sm sm:text-base lg:text-lg font-medium tracking-wide">
                    {slide.collection}
                  </span>
                </div>

                {/* Title & Subtitle */}
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                  <span className="block">{slide.title}</span>
                  <span className="block bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 bg-clip-text text-transparent">
                    {slide.subtitle}
                  </span>
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-amber-50/90 mb-4 sm:mb-6 max-w-md mx-auto lg:mx-0 leading-relaxed">
                  {slide.description}
                </p>

                {/* Buttons */}
                <div className="flex flex-col xs:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                  <Link
                    href={slide.buttonLink}
                    className="
                      inline-flex items-center justify-center 
                      px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4
                      text-white
                      font-semibold 
                      rounded-lg
                      transition-all duration-300 
                      transform 
                      hover:scale-105
                      shadow-lg 
                      hover:shadow-xl
                      cursor-pointer
                      bg-gradient-to-r from-amber-600 to-amber-500
                      hover:from-amber-700 hover:to-amber-600
                      border border-white/20 hover:border-amber-500
                      text-sm sm:text-base lg:text-lg
                      min-w-[140px] sm:min-w-[160px] lg:min-w-[180px] xl:min-w-[200px]
                      whitespace-nowrap
                    "
                  >
                    {slide.buttonText}
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 ml-2 group-hover:translate-x-1 transition-transform"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>

                  {/* <Link
                    href={`/category/${slide.category}`}
                    className="
                      inline-flex items-center justify-center 
                      px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3 lg:py-4
                      text-white
                      font-semibold 
                      rounded-lg 
                      transition-all duration-300 
                      transform
                      hover:scale-105
                      cursor-pointer
                      border border-amber-500/40
                      bg-gradient-to-r from-amber-600/30 to-amber-500/20 backdrop-blur-sm
                      hover:bg-gradient-to-r hover:from-amber-600 hover:to-amber-500
                      text-sm sm:text-base lg:text-lg
                      min-w-[140px] sm:min-w-[160px] lg:min-w-[180px] xl:min-w-[200px]
                      whitespace-nowrap
                    "
                  >
                    View Collection
                  </Link> */}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      {slides.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-2 sm:left-4 lg:left-6 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm hover:bg-amber-600/80 rounded-full flex items-center justify-center transition-all duration-300 group z-20 cursor-pointer border border-white/20 hover:border-amber-400"
            aria-label="Previous slide"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 sm:right-4 lg:right-6 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm hover:bg-amber-600/80 rounded-full flex items-center justify-center transition-all duration-300 group z-20 cursor-pointer border border-white/20 hover:border-amber-400"
            aria-label="Next slide"
          >
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white group-hover:scale-110 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </>
      )}

      {/* Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 lg:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2 sm:space-x-3 z-20">
          {slides.map((slide, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`rounded-full transition-all duration-300 cursor-pointer ${
                index === currentSlide
                  ? slide.badge === "Classic"
                    ? "bg-amber-400 w-6 sm:w-8"
                    : slide.badge === "Premium"
                      ? "bg-green-400 w-6 sm:w-8"
                      : slide.badge === "New"
                        ? "bg-blue-400 w-6 sm:w-8"
                        : "bg-purple-400 w-6 sm:w-8"
                  : slide.badge === "Classic"
                    ? "bg-amber-400/50 w-1.5 h-1.5 sm:w-2 sm:h-2"
                    : slide.badge === "Premium"
                      ? "bg-green-400/50 w-1.5 h-1.5 sm:w-2 sm:h-2"
                      : slide.badge === "New"
                        ? "bg-blue-400/50 w-1.5 h-1.5 sm:w-2 sm:h-2"
                        : "bg-purple-400/50 w-1.5 h-1.5 sm:w-2 sm:h-2"
              }`}
              style={{ height: index === currentSlide ? "auto" : undefined }}
              aria-label={`Go to ${slide.badge} slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
