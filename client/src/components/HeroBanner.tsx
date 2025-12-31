// client/src/components/HeroBanner.tsx

"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headset,
  Users,
  ShoppingBag,
  Smile,
} from "lucide-react";
import { bannerSlides, initialStats, features } from "@/lib/banner-data";

// Define interfaces
interface Stat {
  id: number;
  label: string;
  value: number;
  suffix?: string;
  icon: string;
}

interface Feature {
  title: string;
  desc: string;
  icon: string;
  bg: string;
}

// Icon mapping
const iconMap: Record<string, JSX.Element> = {
  ShieldCheck: <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
  Truck: <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
  RotateCcw: <RotateCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
  Headset: <Headset className="w-5 h-5 sm:w-6 sm:h-6 text-white" />,
  Users: <Users className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-amber-500" />,
  ShoppingBag: <ShoppingBag className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-amber-500" />,
  Smile: <Smile className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-amber-500" />,
};

// Stats Component
function Stats() {
  const [statsData, setStatsData] = useState<Stat[]>(initialStats);
  const [counts, setCounts] = useState<number[]>(initialStats.map(() => 0));

  // Animate counters on mount
  useEffect(() => {
    if (statsData.length === 0) return;
    
    const interval = setInterval(() => {
      setCounts((prev) =>
        prev.map((val, i) => {
          const target = statsData[i]?.value || 0;
          const increment = Math.ceil(target / 50);
          return val < target
            ? Math.min(val + increment, target)
            : target;
        })
      );
    }, 30);

    // Stop animation after all counters reach their target
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setCounts(statsData.map(stat => stat.value));
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [statsData]);

  return (
    <section className="py-4 sm:py-5 lg:py-6 bg-white">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {statsData.map((stat, index) => (
          <div
            key={stat.id}
            className="p-2 sm:p-3 rounded-lg lg:rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-md transition-all duration-300 bg-white"
          >
            <div className="flex justify-center mb-1 sm:mb-2">
              {iconMap[stat.icon] || <Users className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-amber-500" />}
            </div>
            <h2 className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-gray-900 text-center">
              {counts[index]?.toLocaleString()}
              {stat.suffix || ""}
            </h2>
            <p className="text-gray-600 text-xs sm:text-sm font-medium text-center mt-1">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

// Feature item component
function FeatureItem({ feature, index }: { feature: Feature; index: number }) {
  return (
    <div
      key={index}
      className="
        group flex items-center p-3 lg:p-4
        bg-white hover:bg-gradient-to-r hover:from-white hover:to-amber-50
        text-slate-800
        rounded-lg lg:rounded-xl
        transition-all duration-300
        border border-slate-200 hover:border-amber-300
        cursor-pointer
        shadow-sm hover:shadow-md
      "
    >
      {/* Icon */}
      <div
        className={`
          w-10 h-10 sm:w-11 sm:h-11 lg:w-12 lg:h-12 rounded-full
          bg-gradient-to-br ${feature.bg}
          flex items-center justify-center
          mr-3 lg:mr-4
          group-hover:scale-110
          transition-transform duration-300
          shadow-md
          flex-shrink-0
        `}
      >
        {iconMap[feature.icon] || <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white" />}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm lg:text-base text-slate-800 group-hover:text-amber-600 transition-colors">
          {feature.title}
        </h4>
        <p className="text-slate-500 text-xs lg:text-sm hidden sm:block">
          {feature.desc}
        </p>
        <p className="text-slate-500 text-xs lg:text-sm sm:hidden truncate">
          {feature.desc}
        </p>
      </div>

      {/* Arrow */}
      <svg
        className="
          w-4 h-4 lg:w-5 lg:h-5 text-slate-400
          group-hover:text-amber-500
          ml-1 lg:ml-2
          transform group-hover:translate-x-1
          transition-all
          flex-shrink-0
        "
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
    </div>
  );
}

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
    <section className="flex flex-col lg:flex-row min-h-[500px] sm:min-h-[600px] lg:min-h-[650px] xl:min-h-[700px] 2xl:min-h-[800px]">
      {/* Mobile Layout: Hero First, Features Below */}
      <div className="lg:hidden relative h-[400px] sm:h-[450px]">
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
                backgroundPosition: 'center',
                backgroundSize: 'cover'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-900/80 to-slate-800/70"></div>
            </div>

            <div className="relative h-full flex items-center">
              <div className="w-full px-4 sm:px-6">
                <div className="max-w-2xl mx-auto text-center sm:text-left">
                  {/* Category Badge */}
                  <div className="inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 shadow-lg" style={{
                    background: slide.badge === "Classic" 
                      ? "linear-gradient(135deg, #d97706, #b45309)" 
                      : slide.badge === "Premium"
                      ? "linear-gradient(135deg, #10b981, #059669)"
                      : slide.badge === "New"
                      ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                      : "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                  }}>
                    <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full mr-1.5 sm:mr-2 animate-pulse ${
                      slide.badge === "Classic" ? "bg-amber-300" : 
                      slide.badge === "Premium" ? "bg-green-300" :
                      slide.badge === "New" ? "bg-blue-300" : "bg-purple-300"
                    }`}></div>
                    <span className="text-white text-xs sm:text-sm font-semibold">
                      {slide.badge}
                    </span>
                  </div>

                  {/* Collection Label */}
                  <div className="mb-3">
                    <span className="text-amber-300 text-sm sm:text-base font-medium tracking-wide">
                      {slide.collection}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 leading-snug sm:leading-tight max-w-3xl whitespace-nowrap">
                    <span className="block">
                      {slide.title}
                    </span>
                    <span className="block bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 bg-clip-text text-transparent whitespace-nowrap">
                      {slide.subtitle}
                    </span>
                  </h1>

                  {/* Description */}
                  <p className="text-sm sm:text-base text-amber-50/90 mb-4 max-w-md mx-auto sm:mx-0 leading-relaxed whitespace-nowrap">
                    {slide.description}
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-col xs:flex-row gap-3 justify-center sm:justify-start">
                    <Link
                      href={slide.buttonLink}
                      className="
                        inline-flex items-center justify-center 
                        px-4 sm:px-5 py-2.5
                        text-white
                        font-semibold 
                        rounded-lg
                        transition-all duration-300 
                        transform 
                        hover:scale-105
                        shadow-lg 
                        hover:shadow-xl
                        cursor-pointer
                        bg-gradient-to-r from-slate-950 to-slate-800
                        hover:from-amber-700 hover:to-amber-600
                        border border-white/20 hover:border-amber-500
                        text-sm sm:text-base
                        min-w-[140px] sm:min-w-[150px]
                        whitespace-nowrap
                      "
                    >
                      {slide.buttonText}
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 ml-2 group-hover:translate-x-1 transition-transform"
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
                        px-4 sm:px-5 py-2.5
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
                        text-sm sm:text-base
                        min-w-[140px] sm:min-w-[150px]
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

        {/* Navigation Arrows for Mobile */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm hover:bg-amber-600/80 rounded-full flex items-center justify-center transition-all duration-300 group z-20 cursor-pointer border border-white/20 hover:border-amber-400"
              aria-label="Previous slide"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform"
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
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm hover:bg-amber-600/80 rounded-full flex items-center justify-center transition-all duration-300 group z-20 cursor-pointer border border-white/20 hover:border-amber-400"
              aria-label="Next slide"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-110 transition-transform"
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

        {/* Slide Indicators for Mobile */}
        {slides.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {slides.map((slide, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  index === currentSlide
                    ? (slide.badge === "Classic" ? "bg-amber-400 w-6" : 
                       slide.badge === "Premium" ? "bg-green-400 w-6" :
                       slide.badge === "New" ? "bg-blue-400 w-6" : "bg-purple-400 w-6")
                    : (slide.badge === "Classic" ? "bg-amber-400/50 w-1.5 h-1.5" : 
                       slide.badge === "Premium" ? "bg-green-400/50 w-1.5 h-1.5" :
                       slide.badge === "New" ? "bg-blue-400/50 w-1.5 h-1.5" : "bg-purple-400/50 w-1.5 h-1.5")
                }`}
                aria-label={`Go to ${slide.badge} slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Features & Stats - Below Hero */}
      <div className="lg:hidden bg-white p-4 sm:p-6">
        <div className="space-y-3 sm:space-y-4 mb-6">
          {features.map((feature, index) => (
            <FeatureItem key={index} feature={feature} index={index} />
          ))}
        </div>
        <Stats />
      </div>

      {/* Desktop Layout (1024px+) - Side by Side */}
      <div className="hidden lg:flex w-full min-h-[650px] xl:min-h-[700px] 2xl:min-h-[800px]">
        {/* Left Side - Features & Stats (25-30%) */}
        <div className="w-[28%] xl:w-[25%] 2xl:w-[22%] bg-white p-4 xl:p-6 flex flex-col">
          {/* Features - Vertical Stack */}
          <div className="space-y-3 xl:space-y-4 mb-6 xl:mb-8">
            {features.map((feature, index) => (
              <FeatureItem key={index} feature={feature} index={index} />
            ))}
          </div>

          {/* Stats Section */}
          <div className="mt-auto">
            <Stats />
          </div>
        </div>

        {/* Right Side - Hero Banner (72-78%) */}
        <div className="w-[72%] xl:w-[75%] 2xl:w-[78%] relative">
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
                  backgroundPosition: 'center',
                  backgroundSize: 'cover'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-slate-800/70 xl:from-slate-950/90 xl:via-slate-900/80 xl:to-slate-800/60"></div>
              </div>

              <div className="relative h-full flex items-center">
                <div className="max-w-7xl mx-auto px-6 xl:px-8 2xl:px-12 w-full">
                  <div className="max-w-2xl ml-0 xl:ml-8 2xl:ml-16">
                    {/* Category Badge */}
                    <div className="inline-flex items-center px-4 py-2 rounded-full mb-6 shadow-lg" style={{
                      background: slide.badge === "Classic" 
                        ? "linear-gradient(135deg, #d97706, #b45309)" 
                        : slide.badge === "Premium"
                        ? "linear-gradient(135deg, #10b981, #059669)"
                        : slide.badge === "New"
                        ? "linear-gradient(135deg, #3b82f6, #1d4ed8)"
                        : "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                    }}>
                      <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                        slide.badge === "Classic" ? "bg-amber-300" : 
                        slide.badge === "Premium" ? "bg-green-300" :
                        slide.badge === "New" ? "bg-blue-300" : "bg-purple-300"
                      }`}></div>
                      <span className="text-white text-sm font-semibold">
                        {slide.badge}
                      </span>
                    </div>

                    {/* Collection Label */}
                    <div className="mb-4 xl:mb-5">
                      <span className="text-amber-300 text-lg xl:text-xl font-medium tracking-wide">
                        {slide.collection}
                      </span>
                    </div>

                    {/* Title & Subtitle */}
                    <h1 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-white mb-4 xl:mb-5 leading-tight">
                      <span className="block">
                        {slide.title}
                      </span>
                      <span className="block bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200 bg-clip-text text-transparent">
                        {slide.subtitle}
                      </span>
                    </h1>

                    {/* Description */}
                    <p className="text-lg xl:text-xl 2xl:text-2xl text-amber-50/90 mb-6 xl:mb-8 max-w-lg xl:max-w-xl leading-relaxed">
                      {slide.description}
                    </p>

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 xl:gap-5">
                      <Link
                        href={slide.buttonLink}
                        className="
                          inline-flex items-center justify-center 
                          px-6 xl:px-8 py-3 xl:py-4
                          text-white
                          font-semibold 
                          rounded-lg
                          transition-all duration-300 
                          transform 
                          hover:scale-105
                          shadow-lg 
                          hover:shadow-xl
                          cursor-pointer
                          bg-gradient-to-r from-slate-950 to-slate-800
                          hover:from-amber-700 hover:to-amber-600
                          border border-white/20 hover:border-amber-500
                          text-base xl:text-lg
                          min-w-[160px] xl:min-w-[180px] 2xl:min-w-[200px]
                          whitespace-nowrap
                        "
                      >
                        {slide.buttonText}
                        <svg
                          className="w-5 h-5 xl:w-6 xl:h-6 ml-2 group-hover:translate-x-1 transition-transform"
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

                      <Link
                        href={`/category/${slide.category}`}
                        className="
                          inline-flex items-center justify-center 
                          px-6 xl:px-8 py-3 xl:py-4 
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
                          text-base xl:text-lg
                          min-w-[160px] xl:min-w-[180px] 2xl:min-w-[200px]
                          whitespace-nowrap
                        "
                      >
                        View Collection
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Desktop Navigation Arrows */}
          {slides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 xl:left-6 top-1/2 transform -translate-y-1/2 w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm hover:bg-amber-600/80 rounded-full flex items-center justify-center transition-all duration-300 group z-20 cursor-pointer border border-white/20 hover:border-amber-400"
                aria-label="Previous slide"
              >
                <svg
                  className="w-5 h-5 xl:w-6 xl:h-6 text-white group-hover:scale-110 transition-transform"
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
                className="absolute right-4 xl:right-6 top-1/2 transform -translate-y-1/2 w-10 h-10 xl:w-12 xl:h-12 bg-gradient-to-r from-black/50 to-black/30 backdrop-blur-sm hover:bg-amber-600/80 rounded-full flex items-center justify-center transition-all duration-300 group z-20 cursor-pointer border border-white/20 hover:border-amber-400"
                aria-label="Next slide"
              >
                <svg
                  className="w-5 h-5 xl:w-6 xl:h-6 text-white group-hover:scale-110 transition-transform"
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

          {/* Desktop Slide Indicators */}
          {slides.length > 1 && (
            <div className="absolute bottom-6 xl:bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-3 z-20">
              {slides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentSlide
                      ? (slide.badge === "Classic" ? "bg-amber-400 w-8" : 
                         slide.badge === "Premium" ? "bg-green-400 w-8" :
                         slide.badge === "New" ? "bg-blue-400 w-8" : "bg-purple-400 w-8")
                      : (slide.badge === "Classic" ? "bg-amber-400/50 w-3 h-3" : 
                         slide.badge === "Premium" ? "bg-green-400/50 w-3 h-3" :
                         slide.badge === "New" ? "bg-blue-400/50 w-3 h-3" : "bg-purple-400/50 w-3 h-3")
                  }`}
                  aria-label={`Go to ${slide.badge} slide ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}