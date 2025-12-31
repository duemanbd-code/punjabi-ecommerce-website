"use client";

import Link from "next/link";
import { Heart, ShoppingBag, Star } from "lucide-react";

interface Product {
  _id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  normalPrice: number;
  originalPrice?: number;
  category?: string;
  rating?: number;
  slug?: string;
}

interface SearchResultsProps {
  products: Product[];
}

export default function SearchResults({ products }: SearchResultsProps) {
  return (
    <div>
      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product._id}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow border overflow-hidden group"
          >
            {/* Product Image */}
            <div className="relative overflow-hidden">
              <img
                src={product.imageUrl || "/api/placeholder/400/400"}
                alt={product.title}
                className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&h=400&q=80";
                }}
              />
              
              {/* Quick Actions */}
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100 transition-colors">
                  <Heart size={18} className="text-gray-700" />
                </button>
              </div>
              
              {/* Category Badge */}
              {product.category && (
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 bg-black/70 text-white text-xs rounded-full">
                    {product.category}
                  </span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-5">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                {product.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {product.description || "Premium Punjabi wear with traditional craftsmanship"}
              </p>
              
              {/* Rating */}
              {product.rating !== undefined && (
                <div className="flex items-center mb-4">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={14}
                        fill={star <= Math.floor(product.rating || 0) ? "currentColor" : "none"}
                        className={star <= Math.floor(product.rating || 0) ? "fill-current" : ""}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500 ml-1">
                    ({product.rating?.toFixed(1) || '0.0'})
                  </span>
                </div>
              )}
              
              {/* Price */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">
                    ৳ {product.normalPrice.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.normalPrice && (
                    <span className="text-sm text-gray-500 line-through">
                      ৳ {product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                
                <Link
                  href={`/product/${product.slug || product._id}`}
                  className="px-4 py-2 bg-gradient-to-r from-slate-900 to-slate-700 text-white text-sm rounded-lg hover:from-slate-800 hover:to-slate-600 transition-colors flex items-center gap-2"
                >
                  <ShoppingBag size={16} />
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {products.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No matching products</h3>
          <p className="text-gray-600">
            Try adjusting your search or filters to find what you're looking for.
          </p>
        </div>
      )}
    </div>
  );
}