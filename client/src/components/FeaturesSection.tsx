// client/src/components/FeaturesSection.tsx

import {
  ShieldCheck,
  Truck,
  RotateCcw,
  Headset,
} from "lucide-react";
import { features } from "@/lib/banner-data";

// Define interfaces
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
};

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

// Main Features Component
export default function FeaturesSection() {
  return (
    <section className="w-full bg-white py-8 sm:py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800 mb-3">
            Why Choose Us
          </h2>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto">
            We provide the best shopping experience with these premium features
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {features.map((feature, index) => (
            <FeatureItem key={index} feature={feature} index={index} />
          ))}
        </div>

        {/* Optional: View All Features Link */}
        {/* <div className="text-center mt-8 sm:mt-10 lg:mt-12">
          <a
            href="/features"
            className="
              inline-flex items-center justify-center
              px-5 sm:px-6 py-2.5 sm:py-3
              bg-gradient-to-r from-amber-500 to-amber-600
              text-white font-semibold
              rounded-lg
              transition-all duration-300
              hover:from-amber-600 hover:to-amber-700
              hover:scale-105
              shadow-md hover:shadow-lg
              text-sm sm:text-base
            "
          >
            Explore All Features
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 ml-2"
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
          </a>
        </div> */}
      </div>
    </section>
  );
}