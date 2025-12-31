// admin/src/app/products/page.tsx

"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import AdminSidebar from "../../components/AdminSidebar";
import Topbar from "../../components/Topbar";
import AdminProductsTable from "../../components/AdminProductsTable";
import ProductViewModal from "../../components/ProductViewModal";
import { useRouter } from "next/navigation";
import { checkAuthAndRedirect, getAuthToken } from "../../utils/auth";

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();

  const API_URL=process.env.NEXT_PUBLIC_API_URL

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
      console.log("Fetching products...");

      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_URL}/api/products`, {
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
        _id: product._id || product.id,
        title: product.title || "No Title",
        description: product.description || "",
        category: product.category || "uncategorized",
        imageUrl: product.imageUrl || "",
        normalPrice: product.normalPrice || 0,
        salePrice: product.salePrice || null,
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
      
      const response = await fetch(`${API_URL}/api/products/${id}`, {
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

      const response = await fetch(`${API_URL}/api/products/${id}`, {
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
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="p-6 flex-1 overflow-auto flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading products...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="p-6 flex-1 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Products Management
              </h1>
              <p className="text-gray-600 mt-1">
                Manage all your products in one place
              </p>
            </div>
            {/* <button
              onClick={() => router.push("/products/create")}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 font-medium shadow-sm"
            >
              + Add New Product
            </button> */}
          </div>

          <AdminProductsTable
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleView}
            onToggleFeatured={handleToggleFeatured}
            onRefresh={handleRefresh}
            refreshing={refreshing}
          />

          <ProductViewModal
            product={viewingProduct}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </main>
      </div>
    </div>
  );
}