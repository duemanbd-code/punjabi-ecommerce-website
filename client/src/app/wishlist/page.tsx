// client/src/app/wishlist/page.tsx

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart, Trash2, ArrowLeft, ShoppingCart, RefreshCw, Package, Loader2, Sparkles, X, AlertTriangle, CheckCircle } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import axios from "axios";
import ProductCard from "@/components/ProductCard";

// Helper to get image URL
const getImageUrl = (url: string) => {
  if (!url) return "";
  
  // If URL is already a full URL (http/https/data), return as is
  if (url.startsWith("http") || url.startsWith("data:")) return url;
  
  // If URL starts with /uploads, prepend appropriate API URL
  if (url.startsWith("/uploads")) {
    // Check if we're in development or production
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    const API_URL = isLocalhost 
      ? 'http://localhost:4000' 
      : 'https://taskin-panjabi-server.onrender.com';
    
    return `${API_URL}${url}`;
  }
  
  // For relative paths, prepend appropriate API URL
  if (url.startsWith("/")) {
    const isLocalhost = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    
    const API_URL = isLocalhost 
      ? 'http://localhost:4000' 
      : 'https://taskin-panjabi-server.onrender.com';
    
    return `${API_URL}${url}`;
  }
  
  // For bare filenames, construct the full URL
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  
  const API_URL = isLocalhost 
    ? 'http://localhost:4000' 
    : 'https://taskin-panjabi-server.onrender.com';
  
  return `${API_URL}/uploads/${url}`;
};

export default function WishlistPage() {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Get API URL based on current environment
  const getApiUrl = () => {
    if (typeof window === 'undefined') return ''; // SSR fallback
    
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    return isLocalhost 
      ? 'http://localhost:4000' 
      : 'https://taskin-panjabi-server.onrender.com';
  };

  useEffect(() => {
    const loadWishlistProducts = async () => {
      try {
        setLoading(true);
        setError("");

        console.log("Wishlist items:", wishlist);

        if (wishlist.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        // Get API URL for current environment
        const API_URL = getApiUrl();
        
        // Try to fetch all products first
        const allProductsResponse = await axios.get(`${API_URL}/api/products`);
        let allProducts = [];
        
        if (allProductsResponse.data && allProductsResponse.data.data) {
          allProducts = allProductsResponse.data.data;
        } else if (Array.isArray(allProductsResponse.data)) {
          allProducts = allProductsResponse.data;
        }

        console.log("All products:", allProducts.length);

        // Filter products that are in wishlist
        const wishlistProducts = allProducts.filter((product: any) => 
          wishlist.some(item => item.id === product._id)
        );

        console.log("Wishlist products found:", wishlistProducts.length);

        // Process products for display
        const processedProducts = wishlistProducts.map((product: any) => ({
          _id: product._id,
          title: product.title || "Product",
          description: product.description || "",
          category: product.category || "Uncategorized",
          normalPrice: product.normalPrice || 0,
          offerPrice: product.offerPrice || product.salePrice,
          originalPrice: product.originalPrice || product.normalPrice,
          stock: product.stock || product.stockQuantity || 0,
          imageUrl: getImageUrl(product.imageUrl),
          additionalImages: Array.isArray(product.additionalImages) 
            ? product.additionalImages.map(getImageUrl)
            : Array.isArray(product.images)
            ? product.images.map(getImageUrl)
            : [],
          rating: product.rating || 0,
          reviewCount: product.reviewCount || 0,
          isBestSelling: product.isBestSelling || false,
          isNew: product.isNew || false,
          featured: product.featured || false,
          brand: product.brand,
          sizes: Array.isArray(product.sizes) 
            ? product.sizes.map((s: any) => typeof s === 'object' ? s.size : s)
            : [],
          colors: Array.isArray(product.colors) ? product.colors : [],
          discountPercentage: product.discountPercentage,
        }));

        setProducts(processedProducts);

      } catch (err: any) {
        console.error("Error loading wishlist products:", err);
        setError("Failed to load wishlist. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadWishlistProducts();
  }, [wishlist]);

  const handleAddToCart = async (product: any) => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      
      const existingIndex = cart.findIndex((item: any) => item.id === product._id);
      
      if (existingIndex >= 0) {
        cart[existingIndex].quantity += 1;
      } else {
        cart.push({
          id: product._id,
          title: product.title,
          price: product.offerPrice || product.normalPrice,
          quantity: 1,
          image: product.imageUrl,
          category: product.category,
          normalPrice: product.normalPrice,
          originalPrice: product.originalPrice,
          offerPrice: product.offerPrice,
          stock: product.stock,
        });
      }

      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("cart-updated"));
      
      // Visual feedback
      const button = document.querySelector(`[data-product-id="${product._id}"]`);
      if (button) {
        button.innerHTML = '<ShoppingCart className="w-4 h-4" /> Added!';
        button.classList.add('bg-amber-700');
        setTimeout(() => {
          button.innerHTML = '<ShoppingCart className="w-4 h-4" /> Add to Cart';
          button.classList.remove('bg-amber-700');
        }, 2000);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please try again.");
    }
  };

  const handleClearWishlist = async () => {
    setShowClearConfirm(true);
  };

  const confirmClearWishlist = async () => {
    setIsClearing(true);
    setShowClearConfirm(false);
    
    await clearWishlist();
    
    setIsClearing(false);
    setShowSuccessToast(true);
    
    // Auto-hide success toast after 3 seconds
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 3000);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  // Clear Confirmation Modal
  const ClearConfirmationModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blu">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Clear Wishlist</h3>
            </div>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Heart className="w-16 h-16 text-red-400" />
                <Trash2 className="absolute bottom-0 right-0 w-8 h-8 text-red-600" />
              </div>
            </div>
            <p className="text-center text-slate-700 mb-2">
              Are you sure you want to clear your entire wishlist?
            </p>
            <p className="text-center text-slate-500 text-sm">
              This will remove <span className="font-bold text-red-600">{wishlist.length} items</span> permanently.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="flex-1 py-3 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={confirmClearWishlist}
              disabled={isClearing}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isClearing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-5 h-5" />
                  Clear All Items
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Success Toast
  const SuccessToast = () => (
    <div className="fixed top-6 right-6 z-50 animate-in slide-in-from-right-10 duration-300">
      <div className="bg-white rounded-xl shadow-2xl border border-emerald-100 overflow-hidden max-w-sm">
        <div className="flex items-center gap-4 p-4">
          <div className="p-2 bg-emerald-50 rounded-lg">
            <CheckCircle className="w-6 h-6 text-emerald-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-slate-900">Wishlist cleared</p>
            <p className="text-sm text-slate-600">All items have been removed</p>
          </div>
          <button
            onClick={() => setShowSuccessToast(false)}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
        <div className="h-1 bg-gradient-to-r from-emerald-500 to-emerald-400"></div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin h-16 w-16 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
            <Heart className="absolute inset-0 m-auto h-8 w-8 text-amber-600" />
          </div>
          <p className="text-slate-600 font-medium">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-6">
          <Heart className="w-20 h-20 text-amber-500/30" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Something went wrong</h2>
        <p className="text-slate-600 mb-8 max-w-md">{error}</p>
        <div className="flex gap-4">
          <button
            onClick={handleRefresh}
            className="px-6 py-3 bg-slate-900 text-white rounded-lg flex items-center gap-2 hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          <Link
            href="/"
            className="px-6 py-3 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-amber-50 to-white rounded-full border border-amber-100 flex items-center justify-center shadow-lg">
            <Heart className="w-16 h-16 text-amber-400" />
          </div>
          <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-500" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">Your Wishlist is Empty</h2>
        <p className="text-slate-600 mb-8 max-w-md">
          Save your favorite products here to buy later. Start exploring our collection!
        </p>
        <Link
          href="/product"
          className="group px-8 py-4 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-950 hover:to-slate-800 text-white hover:text-amber-500 rounded-lg flex items-center gap-3 hover:bg-amber-700 transition-all duration-300 shadow-lg hover:shadow-xl"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
          <span className="font-semibold">Browse Products</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-12">
      {/* Success Toast */}
      {showSuccessToast && <SuccessToast />}

      {/* Clear Confirmation Modal */}
      {showClearConfirm && <ClearConfirmationModal />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
              <Heart className="w-6 h-6 text-amber-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">My Wishlist</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <p className="text-slate-600">
                <span className="font-semibold text-slate-900">{wishlist.length}</span> item{wishlist.length > 1 ? "s" : ""} saved
                {products.length < wishlist.length && 
                  <span className="text-amber-600 ml-2">
                    ({wishlist.length - products.length} currently unavailable)
                  </span>
                }
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleRefresh}
                className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg flex items-center gap-2 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow-md"
              >
                <RefreshCw size={16} />
                Refresh
              </button>

              <button
                onClick={handleClearWishlist}
                disabled={isClearing}
                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-400 text-white font-medium rounded-lg flex items-center gap-2 hover:from-red-600 hover:to-red-500 transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isClearing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 size={16} />
                    Clear All
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-white/50 backdrop-blur-sm">
            <div className="inline-flex p-4 bg-slate-100 rounded-full mb-6">
              <Package className="w-12 h-12 text-slate-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">No Products Found</h3>
            <p className="text-slate-600 mb-8 max-w-md mx-auto">
              Some items in your wishlist may no longer be available or there was an issue loading them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleRefresh}
                className="px-8 py-3 bg-amber-600 text-white font-medium rounded-lg hover:bg-amber-700 transition-colors shadow-md hover:shadow-lg"
              >
                Refresh List
              </button>
              <Link
                href="/products"
                className="px-8 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
              >
                Browse Products
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
            {products.map((product) => (
              <div key={product._id} className="relative group">
                <div className="absolute top-4 right-4 z-10">
                  <button
                    onClick={() => removeFromWishlist(product._id)}
                    className="p-2.5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:scale-110 hover:shadow-xl hover:bg-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                    aria-label="Remove from wishlist"
                  >
                    <Trash2 size={18} className="text-red-500" />
                  </button>
                </div>
                <ProductCard 
                  product={product} 
                  onAddToCart={() => handleAddToCart(product)}
                  customButton={
                    <button
                      data-product-id={product._id}
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Add to Cart
                    </button>
                  }
                />
              </div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-16 pt-8 border-t border-slate-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100">
                <Heart className="w-5 h-5 text-slate-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total saved items</p>
                <p className="text-2xl font-bold text-slate-900">{wishlist.length}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Link
                href="/products"
                className="group flex items-center gap-3 text-slate-700 hover:text-slate-900 font-medium transition-colors"
              >
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-200 transition-colors">
                  <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={18} />
                </div>
                Continue Shopping
              </Link>

              <Link
                href="/cart"
                className="group px-8 py-3.5 bg-gradient-to-r from-slate-900 to-slate-800 text-white font-medium rounded-lg flex items-center gap-3 hover:from-slate-800 hover:to-slate-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <ShoppingCart size={20} />
                <span className="font-semibold">View Cart</span>
                <span className="px-2 py-1 bg-white/20 rounded text-sm font-medium">
                  {JSON.parse(localStorage.getItem("cart") || "[]").length}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}