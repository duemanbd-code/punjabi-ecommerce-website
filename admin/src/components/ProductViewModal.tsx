// admin/src/components/ProductViewModal.tsx

"use client";

import { X, Package, Tag, Star, TrendingUp, DollarSign, BarChart, AlertCircle, Calendar, Layers, Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  normalPrice: number;
  salePrice?: number;
  originalPrice?: number;
  stockQuantity: number;
  salesCount?: number;
  rating?: number;
  isBestSelling?: boolean;
  isNew?: boolean;
  featured?: boolean;
  status?: string;
  tags?: string[];
  sizes?: { size: string; stock: number }[];
  createdAt?: string;
}

interface ProductViewModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductViewModal({ product, isOpen, onClose }: ProductViewModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  const API_URL=process.env.NEXT_PUBLIC_API_URL

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!isVisible || !product) return null;

  const discountPercentage = product.salePrice 
    ? Math.round(((product.normalPrice - product.salePrice) / product.normalPrice) * 100)
    : 0;

  const stockStatus = product.stockQuantity > 20 
    ? "in-stock" 
    : product.stockQuantity > 0 
      ? "low-stock" 
      : "out-of-stock";

  const getImageUrl = (url: string) => {
    if (!url || url.trim() === "") return "/placeholder.png";
    
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    
    if (url.startsWith("/")) {
      if (url.startsWith("/uploads/")) {
        return `${API_URL}${url}`;
      }
      return url;
    }
    
    if (url.includes(".")) {
      return `${API_URL}/uploads/${url}`;
    }
    
    return "/placeholder.png";
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 ${
          isOpen ? "opacity-50" : "opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`fixed inset-0 z-50 overflow-y-auto transition-all duration-300 ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex min-h-full items-center justify-center p-4">
          <div 
            className={`relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl transform transition-all duration-300 ${
              isOpen ? "scale-100" : "scale-95"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    product.status === "active" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" :
                    product.status === "draft" ? "bg-amber-100 text-amber-700 border border-amber-200" :
                    product.status === "archived" ? "bg-gray-100 text-gray-700 border border-gray-200" :
                    "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}>
                    {product.status ? product.status.toUpperCase() : "ACTIVE"}
                  </span>
                  {product.isNew && (
                    <span className="px-3 py-1 bg-amber-500 text-white rounded-full text-xs font-bold">
                      NEW
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={24} className="text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Image */}
                <div>
                  <div className="bg-gray-100 rounded-xl overflow-hidden aspect-square mb-4 border border-gray-200">
                    <img
                      src={getImageUrl(product.imageUrl)}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/placeholder.png";
                      }}
                    />
                  </div>
                  
                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Tag size={16} />
                        Tags
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {product.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column - Details */}
                <div className="space-y-6">
                  {/* Category */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <Package size={16} />
                      Category
                    </h3>
                    <p className="text-gray-900 font-medium">{product.category}</p>
                  </div>

                  {/* Description */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                      {product.description || "No description available"}
                    </p>
                  </div>

                  {/* Pricing */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <DollarSign size={16} />
                      Pricing Details
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">Normal Price:</span>
                        <span className="font-bold text-lg">৳ {product.normalPrice.toLocaleString()}</span>
                      </div>
                      {product.originalPrice && product.originalPrice > product.normalPrice && (
                        <div className="flex justify-between items-center p-3 bg-amber-50 rounded-lg">
                          <span className="text-gray-600">Original Price:</span>
                          <span className="text-gray-500 line-through">৳ {product.originalPrice.toLocaleString()}</span>
                        </div>
                      )}
                      {product.salePrice && product.salePrice < product.normalPrice && (
                        <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
                          <span className="text-gray-600">Sale Price:</span>
                          <span className="font-bold text-emerald-600 text-lg">৳ {product.salePrice.toLocaleString()}</span>
                        </div>
                      )}
                      {discountPercentage > 0 && (
                        <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                          <span className="text-gray-600">You Save:</span>
                          <span className="font-bold text-red-600 text-lg">
                            ৳ {(product.normalPrice - (product.salePrice || product.normalPrice)).toLocaleString()} ({discountPercentage}% OFF)
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stock */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <BarChart size={16} />
                      Stock Status
                    </h3>
                    <div className={`p-4 rounded-lg ${
                      stockStatus === "in-stock" ? "bg-emerald-50 border border-emerald-200" :
                      stockStatus === "low-stock" ? "bg-amber-50 border border-amber-200" :
                      "bg-red-50 border border-red-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600">Available Stock</p>
                          <p className={`text-2xl font-bold ${
                            stockStatus === "in-stock" ? "text-emerald-600" :
                            stockStatus === "low-stock" ? "text-amber-600" :
                            "text-red-600"
                          }`}>
                            {product.stockQuantity} units
                          </p>
                        </div>
                        {stockStatus === "low-stock" && (
                          <AlertCircle size={24} className="text-amber-500" />
                        )}
                        {stockStatus === "out-of-stock" && (
                          <AlertCircle size={24} className="text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-200">
                    {product.rating !== undefined && product.rating > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <Star size={16} className="text-amber-500" />
                          Customer Rating
                        </h3>
                        <div className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg">
                          <div className="text-center">
                            <span className="text-3xl font-bold text-amber-600">{product.rating.toFixed(1)}</span>
                            <p className="text-xs text-amber-700">out of 5</p>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={18}
                                  className={`${
                                    i < Math.floor(product.rating!) 
                                      ? "text-amber-500 fill-amber-500" 
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {product.salesCount !== undefined && product.salesCount > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                          <TrendingUp size={16} className="text-emerald-500" />
                          Sales Performance
                        </h3>
                        <div className="p-4 bg-emerald-50 rounded-lg">
                          <div className="text-center">
                            <p className="text-3xl font-bold text-emerald-600">
                              {product.salesCount.toLocaleString()}
                            </p>
                            <p className="text-sm text-emerald-700 mt-1">Total Units Sold</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Created Date */}
                  {product.createdAt && (
                    <div className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Calendar size={16} />
                        Product Information
                      </h3>
                      <div className="text-sm">
                        <p className="text-gray-500">Added on</p>
                        <p className="text-gray-900 font-medium">
                          {new Date(product.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    onClose();
                    window.location.href = `/products/edit/${product._id}`;
                  }}
                  className="px-6 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 font-medium transition-colors"
                >
                  Edit Product
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}