"use client";

import Link from "next/link";
import { ChevronDown, ChevronRight, Package, Shirt } from "lucide-react";
import { useState, useEffect } from "react";

interface CategoryNode {
  slug: string;
  name: string;
  icon?: React.ReactNode;
  children?: CategoryNode[];
}

const categoryTree: CategoryNode[] = [
  {
    slug: "panjabi",
    name: "Panjabi",
    icon: <Package size={18} />,
    children: [
      { slug: "regular-panjabi", name: "Regular Panjabi" },
      { slug: "premium-panjabi", name: "Premium Panjabi" },
      { slug: "luxury-panjabi", name: "Luxury Panjabi" },
    ],
  },
  {
    slug: "shirts",
    name: "Shirts",
    icon: <Shirt size={18} />,
  },
];

interface CategorySidebarProps {
  activeSlug?: string;
  onCategoryClick?: () => void;
}

export default function CategorySidebar({ activeSlug, onCategoryClick }: CategorySidebarProps) {
  const [openCategories, setOpenCategories] = useState<string[]>(["panjabi"]);

  const toggleCategory = (slug: string) => {
    setOpenCategories(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleClick = () => {
    if (onCategoryClick) onCategoryClick();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Categories</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
          {categoryTree.reduce((acc, cat) => acc + 1 + (cat.children?.length || 0), 0)}
        </span>
      </div>
      
      <div className="space-y-1">
        {/* All Categories Link */}
        <Link
          href="/category/all"
          onClick={handleClick}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
            activeSlug === "all"
              ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-md"
              : "text-gray-700 hover:bg-amber-50 hover:text-amber-600"
          }`}
        >
          <span className="text-lg">📦</span>
          <span className="font-medium">All Categories</span>
        </Link>

        {categoryTree.map(category => (
          <div key={category.slug} className="border-t border-gray-100 pt-1 first:border-t-0">
            <button
              onClick={() => toggleCategory(category.slug)}
              className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
            >
              <Link
                href={`/category/${category.slug}`}
                onClick={handleClick}
                className={`flex items-center gap-3 flex-1 font-medium ${
                  activeSlug === category.slug ? "text-amber-600" : "text-gray-800 group-hover:text-amber-600"
                }`}
              >
                {category.icon}
                <span>{category.name}</span>
              </Link>
              {category.children && (
                <div className="text-gray-400">
                  {openCategories.includes(category.slug) ? (
                    <ChevronDown size={16} />
                  ) : (
                    <ChevronRight size={16} />
                  )}
                </div>
              )}
            </button>
            
            {category.children && openCategories.includes(category.slug) && (
              <div className="ml-6 pl-3 border-l-2 border-amber-200 space-y-1 mt-1 mb-2">
                {category.children.map(child => (
                  <Link
                    key={child.slug}
                    href={`/category/${child.slug}`}
                    onClick={handleClick}
                    className={`block px-3 py-2 text-sm rounded-lg transition-all duration-200 ${
                      activeSlug === child.slug
                        ? "bg-amber-50 text-amber-600 font-medium"
                        : "text-gray-600 hover:bg-gray-50 hover:text-amber-600"
                    }`}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Category Stats */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3">
          <p className="text-xs text-gray-600 mb-1">Shop by</p>
          <div className="flex gap-2 text-sm">
            <span className="text-amber-700">✨ Style</span>
            <span className="text-gray-400">|</span>
            <span className="text-amber-700">👔 Occasion</span>
            <span className="text-gray-400">|</span>
            <span className="text-amber-700">💰 Price</span>
          </div>
        </div>
      </div>
    </div>
  );
}