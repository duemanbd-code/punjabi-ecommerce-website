// admin/src/app/products/page.tsx

"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
// ADD MISSING ICON IMPORTS
import { Package, TrendingUp, AlertTriangle, Sparkles } from "lucide-react";
import { checkAuthAndRedirect, getAuthToken } from "../../../utils/auth";
import AdminProductsTable from "../../../components/AdminProductsTable";
import ProductViewModal from "../../../components/ProductViewModal";

interface Product {
  _id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  normalPrice: number;
  salePrice?: number;
  originalPrice?: number;
  isBestSelling?: boolean;
  isNew?: boolean;
  featured?: boolean;
  stockQuantity: number;
  salesCount?: number;
  rating?: number;
  status?: "active" | "draft" | "archived" | "low-stock" | "out-of-stock";
  tags?: string[];
  createdAt?: string;
}

// ==================== UTILITY FUNCTIONS ====================

// Get API URL with fallback
const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl) {
    // Ensure URL has protocol
    if (!envUrl.startsWith('http')) {
      console.warn('⚠️ API URL missing protocol, adding http://');
      return `http://${envUrl}`;
    }
    return envUrl;
  }
  
  // Default for local development
  console.warn('⚠️ NEXT_PUBLIC_API_URL not set, using default: http://localhost:4000');
  return 'http://localhost:4000';
};

// Convert relative image path to full URL
const getFullImageUrl = (imagePath: string | undefined): string => {
  if (!imagePath) {
    // Return a placeholder image
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
  }
  
  // Already a full URL
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Handle "undefined" in path
  if (imagePath.includes('undefined')) {
    console.error('Found "undefined" in image path:', imagePath);
    return 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop';
  }
  
  // Convert relative path to full URL
  const baseUrl = getApiBaseUrl();
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  
  return `${baseUrl}/${cleanPath}`;
};

// Get API URL for requests
const API_BASE_URL = getApiBaseUrl();
const API_URL = `${API_BASE_URL}/api`;

// ==================== MAIN COMPONENT ====================

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Check authentication on mount
  useEffect(() => {
    if (!checkAuthAndRedirect(router)) {
      return;
    }
    fetchProducts();
  }, [router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      console.log("Fetching products from:", `${API_URL}/products`);

      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_URL}/products`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized - Please login again");
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("Products response:", data);

      const productsData = data.data || data || [];

      const formattedProducts = productsData.map((product: any) => ({
        _id: product._id || product.id || `product-${Date.now()}-${Math.random()}`,
        title: product.title || "No Title",
        description: product.description || "",
        category: product.category || "uncategorized",
        // FIXED: Use getFullImageUrl to ensure proper image URLs
        imageUrl: getFullImageUrl(product.imageUrl),
        normalPrice: product.normalPrice || 0,
        salePrice: product.salePrice || undefined,
        originalPrice: product.originalPrice || product.normalPrice || 0,
        isBestSelling: product.isBestSelling || false,
        isNew: product.isNew || false,
        featured: product.featured || false,
        stockQuantity: product.stockQuantity || product.stock || 0,
        salesCount: product.salesCount || 0,
        rating: product.rating || 0,
        status: product.status || "active",
        tags: product.tags || [],
        createdAt: product.createdAt,
      }));

      console.log(`Loaded ${formattedProducts.length} products`);
      setProducts(formattedProducts);
      
    } catch (err: any) {
      console.error("Error fetching products:", err);
      
      if (err.message.includes("Unauthorized") || err.message.includes("401")) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("admin-token");
        localStorage.removeItem("admin-user");
        router.push("/login");
      } else if (err.message.includes("NetworkError") || err.message.includes("Failed to fetch")) {
        toast.error("Cannot connect to server. Make sure backend is running.");
      } else {
        toast.error(err.message || "Failed to load products");
      }
      
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = async (id: string) => {
    const product = products.find((p) => p._id === id);
    if (!product) {
      toast.error("Product not found");
      return;
    }

    // if (!window.confirm(`Are you sure you want to delete "${product.title}"?`)) {
    //   return;
    // }

    const token = getAuthToken();
    if (!token) {
      toast.error("You are not logged in!");
      router.push("/login");
      return;
    }

    try {
      console.log("Deleting product:", id);
      
      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Delete response:", data);
      
      // Update local state
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success("Product deleted successfully!");
      
    } catch (err: any) {
      console.error("Delete error:", err);
      
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("admin-token");
        localStorage.removeItem("admin-user");
        router.push("/login");
      } else if (err.message.includes("404")) {
        toast.error("Product not found on server.");
        fetchProducts(); // Refresh list
      } else {
        toast.error(err.message || "Failed to delete product");
      }
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/products/edit/${id}`);
  };

  const handleView = (id: string) => {
    const product = products.find((p) => p._id === id);
    if (product) {
      setViewingProduct(product);
      setIsModalOpen(true);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    try {
      const product = products.find((p) => p._id === id);
      if (!product) {
        toast.error("Product not found");
        return;
      }

      const token = getAuthToken();
      if (!token) {
        toast.error("You are not logged in!");
        router.push("/login");
        return;
      }

      const newFeaturedStatus = !product.featured;

      const response = await fetch(`${API_URL}/products/${id}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ featured: newFeaturedStatus })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setProducts((prev) =>
        prev.map((p) =>
          p._id === id ? { ...p, featured: newFeaturedStatus } : p
        )
      );

      toast.success(
        newFeaturedStatus
          ? "Product marked as featured!"
          : "Product removed from featured"
      );
    } catch (err: any) {
      console.error("Toggle featured error:", err);
      toast.error(err.message || "Failed to update product");
    }
  };

  const handleRefresh = () => {
    console.log("Refreshing products...");
    setRefreshing(true);
    fetchProducts();
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex flex-col">
          <main className="p-4 sm:p-6 flex-1 overflow-auto flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Loading products...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <div className="flex-1 flex flex-col">
        <main className="p-3 sm:p-4 md:p-6 flex-1 overflow-auto">
          {/* Header Section - Responsive */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Products Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage all your products in one place
              </p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 font-medium shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none ${refreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                {refreshing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                    <span className="hidden sm:inline">Refreshing...</span>
                    <span className="sm:hidden">Refresh</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span className="hidden sm:inline">Refresh</span>
                  </>
                )}
              </button>
              <button
                onClick={() => router.push("/products/add")}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 font-medium shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Add Product</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          {/* Stats Cards - Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Package className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Featured</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.featured).length}
                  </p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Low Stock</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.stockQuantity < 10).length}
                  </p>
                </div>
                <div className="p-2 bg-red-50 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">New Arrivals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.isNew).length}
                  </p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Products Table - Wrapped in responsive container */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <AdminProductsTable
              products={products}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onToggleFeatured={handleToggleFeatured}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />
          </div>

          {/* Empty State */}
          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <Package className="w-full h-full" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">Get started by adding your first product</p>
              <button
                onClick={() => router.push("/products/add")}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 font-medium shadow-sm"
              >
                + Add First Product
              </button>
            </div>
          )}

          <ProductViewModal
            product={viewingProduct}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </main>

        {/* Mobile Floating Action Button */}
        {isMobile && products.length > 0 && (
          <button
            onClick={() => router.push("/products/add")}
            className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        )}
      </div>

      {/* Global Responsive Styles */}
      <style jsx global>{`
        /* Custom scrollbar for better mobile experience */
        @media (max-width: 768px) {
          ::-webkit-scrollbar {
            width: 4px;
            height: 4px;
          }
          ::-webkit-scrollbar-track {
            background: #f1f1f1;
          }
          ::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 2px;
          }
        }
        
        /* Better touch targets for mobile */
        @media (max-width: 640px) {
          button, a {
            min-height: 44px;
            min-width: 44px;
          }
        }
      `}</style>
    </div>
  );
}