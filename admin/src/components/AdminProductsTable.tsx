// admin/src/components/AdminProductsTable.tsx

"use client";

import {
  Edit2,
  Eye,
  Trash2,
  Star,
  Package,
  Tag,
  Search,
  Plus,
  AlertCircle,
  Image as ImageIcon,
  RefreshCw,
  AlertTriangle,
  X,
  ShieldAlert,
} from "lucide-react";
import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Link from "next/link";

interface Product {
  _id: string;
  title: string;
  category: string;
  imageUrl: string;
  normalPrice: number;
  salePrice?: number;
  stockQuantity: number;
  salesCount?: number;
  rating?: number;
  isBestSelling?: boolean;
  isNew?: boolean;
  featured?: boolean;
  status?: "active" | "draft" | "archived" | "low-stock" | "out-of-stock";
  tags?: string[];
}

interface AdminProductsTableProps {
  products?: Product[];
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onView?: (id: string) => void;
  onToggleFeatured?: (id: string) => void;
  onRefresh?: () => void;
  refreshing?: boolean;
}

export default function AdminProductsTable({
  products = [],
  onEdit,
  onDelete,
  onView,
  onToggleFeatured,
  onRefresh,
  refreshing = false,
}: AdminProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter products
  const filteredProducts = products.filter(
    (product) =>
      product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  const API_URL=process.env.NEXT_PUBLIC_API_URL

  // Fix image URL function
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

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (productId: string, productTitle: string) => {
    setProductToDelete({ id: productId, title: productTitle });
    setDeleteModalOpen(true);
  };

  // Handle delete confirmation
  const confirmDelete = async () => {
    if (!productToDelete || !onDelete) return;
    
    setIsDeleting(true);
    try {
      await onDelete(productToDelete.id);
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setDeleteModalOpen(false);
    setProductToDelete(null);
    setIsDeleting(false);
  };

  // Skeleton loader for hydration
  if (!isMounted) {
    return (
      <div className="w-full animate-pulse">
        <div className="flex items-center justify-between mb-6">
          <div className="relative">
            <div className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-96 bg-gray-100"></div>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2.5 bg-gray-100 rounded-lg w-32"></div>
            <div className="px-4 py-2.5 bg-gray-100 rounded-lg w-32"></div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 border-b">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-100 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Custom Delete Confirmation Modal */}
      <Transition appear show={deleteModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={cancelDelete}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/50 backdrop-blu" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-yellow-50 p-6 text-left align-middle shadow-2xl transition-all border-2 border-amber-200">
                  {/* Modal Header */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <AlertTriangle className="text-white" size={24} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <Dialog.Title as="h3" className="text-xl font-bold text-gray-900">
                        Delete Product
                      </Dialog.Title>
                      {/* <p className="text-sm text-amber-700 mt-1">
                        This action cannot be undone
                      </p> */}
                    </div>
                    <button
                      onClick={cancelDelete}
                      className="text-amber-400 hover:text-amber-600 transition-colors p-1"
                    >
                      <X size={24} />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="mb-6">
                    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-amber-200">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                            <ShieldAlert size={20} className="text-amber-600" />
                          </div>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            Are you sure you want to delete?
                          </p>
                          <p className="text-lg font-bold text-amber-700 mt-1">
                            "{productToDelete?.title}"
                          </p>
                        </div>
                      </div>
                      
                      {/* <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm text-amber-700">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span>This will permanently remove the product</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-amber-700">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span>All product data and images will be deleted</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-amber-700">
                          <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                          <span>This action is irreversible</span>
                        </div>
                      </div> */}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={cancelDelete}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-3 bg-white text-gray-700 rounded-xl border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 font-semibold disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={confirmDelete}
                      disabled={isDeleting}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:from-amber-600 hover:to-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isDeleting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 size={20} />
                          Delete Product
                        </>
                      )}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <div className="w-full">
        {/* Header with Search and Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search products by name, category or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full text-sm"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh products list"
            >
              <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
            <Link
              href="/products/add"
              className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              <span>Add Product</span>
            </Link>
          </div>
        </div>

        {/* Products Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredProducts.length}</span> of{" "}
          <span className="font-semibold">{products.length}</span> products
          {searchTerm && (
            <span className="ml-2 text-amber-600">
              (Search results for "{searchTerm}")
            </span>
          )}
        </div>

        {/* Table Container - For desktop */}
        <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Table Headers - Adjusted for more space */}
          <div className="grid grid-cols-12 gap-4 bg-gray-50 border-b border-gray-200 px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
            <div className="col-span-4">Product</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-1">Stock</div>
            <div className="col-span-2">Price</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {/* Product Rows */}
          {filteredProducts.length > 0 ? (
            <div>
              {filteredProducts.map((product) => {
                const discountPercentage = product.salePrice
                  ? Math.round(
                      ((product.normalPrice - product.salePrice) /
                        product.normalPrice) *
                        100
                    )
                  : 0;

                const statusColors: Record<string, string> = {
                  active:
                    "bg-emerald-100 text-emerald-700 border border-emerald-200",
                  draft: "bg-amber-100 text-amber-700 border border-amber-200",
                  archived: "bg-gray-100 text-gray-700 border border-gray-200",
                  "low-stock":
                    "bg-amber-100 text-amber-700 border border-amber-200",
                  "out-of-stock": "bg-red-100 text-red-700 border border-red-200",
                };

                return (
                  <div
                    key={product._id}
                    className="grid grid-cols-12 gap-4 items-center border-b border-gray-100 hover:bg-gray-50/50 px-6 py-4 transition-colors duration-150"
                  >
                    {/* Product Info - 4 columns */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        {/* Product Image */}
                        <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                          {product.imageUrl && product.imageUrl.trim() !== "" ? (
                            <img
                              src={getImageUrl(product.imageUrl)}
                              alt={product.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/placeholder.png";
                              }}
                            />
                          ) : (
                            <ImageIcon size={24} className="text-gray-400" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900 truncate">
                              {product.title}
                            </h4>
                            {/* Badges */}
                            <div className="flex gap-1 flex-shrink-0">
                              {product.isNew && (
                                <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded whitespace-nowrap">
                                  NEW
                                </span>
                              )}
                              {product.featured && (
                                <span className="text-xs font-bold bg-purple-500 text-white px-2 py-0.5 rounded whitespace-nowrap flex items-center gap-1">
                                  <Star size={10} />
                                  FEATURED
                                </span>
                              )}
                              {product.isBestSelling && (
                                <span className="text-xs font-bold bg-red-500 text-white px-2 py-0.5 rounded whitespace-nowrap">
                                  BEST
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Package size={12} />
                              <span>{product.category}</span>
                            </div>
                            {product.tags && product.tags.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Tag size={12} />
                                <span className="truncate max-w-[200px]">
                                  {product.tags.slice(0, 2).join(", ")}
                                  {product.tags.length > 2 && (
                                    <span className="text-gray-400 ml-1">
                                      +{product.tags.length - 2}
                                    </span>
                                  )}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status - 2 columns */}
                    <div className="col-span-2">
                      <span
                        className={`inline-block px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          statusColors[product.status || "active"] ||
                          statusColors.active
                        }`}
                      >
                        {product.status?.replace("-", " ") || "Active"}
                      </span>
                    </div>

                    {/* Stock - 1 column */}
                    <div className="col-span-1">
                      <div className="flex items-center gap-1">
                        <span
                          className={`font-medium whitespace-nowrap ${
                            product.stockQuantity > 20
                              ? "text-emerald-600"
                              : product.stockQuantity > 0
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                        {product.stockQuantity <= 20 && product.stockQuantity > 0 && (
                          <AlertCircle size={14} className="text-amber-500" />
                        )}
                        {product.stockQuantity === 0 && (
                          <AlertCircle size={14} className="text-red-500" />
                        )}
                      </div>
                    </div>

                    {/* Price - 2 columns */}
                    <div className="col-span-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-900 whitespace-nowrap">
                          ৳{" "}
                          {product.salePrice
                            ? product.salePrice.toLocaleString()
                            : product.normalPrice.toLocaleString()}
                        </span>
                        {discountPercentage > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400 line-through whitespace-nowrap">
                              ৳ {product.normalPrice.toLocaleString()}
                            </span>
                            <span className="text-xs font-bold text-red-600 whitespace-nowrap">
                              -{discountPercentage}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions - 3 columns (More space for buttons) */}
                    <div className="col-span-3">
                      <div className="flex items-center justify-end gap-2">
                        {/* View Button */}
                        <button
                          onClick={() => onView?.(product._id)}
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 hover:text-blue-700 transition-colors border border-blue-200 flex items-center gap-1"
                          title="View Details"
                        >
                          <Eye size={16} />
                          <span className="text-xs hidden lg:inline">View</span>
                        </button>

                        {/* Edit Button */}
                        <Link
                          href={`/products/edit/${product._id}`}
                          className="p-2 hover:bg-green-50 rounded-lg text-green-600 hover:text-green-700 transition-colors border border-green-200 flex items-center gap-1"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                          <span className="text-xs hidden lg:inline">Edit</span>
                        </Link>

                        {/* Featured Toggle */}
                        <button
                          onClick={() => onToggleFeatured?.(product._id)}
                          className={`p-2 rounded-lg border transition-colors flex items-center gap-1 ${
                            product.featured
                              ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                              : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                          }`}
                          title={
                            product.featured
                              ? "Remove from featured"
                              : "Add to featured"
                          }
                        >
                          <Star
                            size={16}
                            className={product.featured ? "fill-amber-500" : ""}
                          />
                          <span className="text-xs hidden lg:inline">
                            {product.featured ? "Featured" : "Feature"}
                          </span>
                        </button>

                        {/* Delete Button - Opens custom modal */}
                        <button
                          onClick={() => openDeleteModal(product._id, product.title)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-colors border border-red-200 flex items-center gap-1"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                          <span className="text-xs hidden lg:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search size={28} className="text-gray-300" />
                </div>
                <p className="font-medium text-lg">No products found</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400">
                    No results for "{searchTerm}"
                  </p>
                )}
                {products.length === 0 && !searchTerm && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Your product list is empty
                    </p>
                    <Link
                      href="/products/add"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                    >
                      <Plus size={18} />
                      Add Your First Product
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Mobile View - Cards Layout */}
        <div className="md:hidden space-y-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => {
              const discountPercentage = product.salePrice
                ? Math.round(
                    ((product.normalPrice - product.salePrice) /
                      product.normalPrice) *
                      100
                  )
                : 0;

              const statusColors: Record<string, string> = {
                active:
                  "bg-emerald-100 text-emerald-700 border border-emerald-200",
                draft: "bg-amber-100 text-amber-700 border border-amber-200",
                archived: "bg-gray-100 text-gray-700 border border-gray-200",
                "low-stock":
                  "bg-amber-100 text-amber-700 border border-amber-200",
                "out-of-stock": "bg-red-100 text-red-700 border border-red-200",
              };

              return (
                <div
                  key={product._id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  {/* Product Header */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0 bg-gray-100 flex items-center justify-center">
                      {product.imageUrl && product.imageUrl.trim() !== "" ? (
                        <img
                          src={getImageUrl(product.imageUrl)}
                          alt={product.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder.png";
                          }}
                        />
                      ) : (
                        <ImageIcon size={24} className="text-gray-400" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-1">
                            {product.title}
                          </h4>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-sm text-gray-500">
                              {product.category}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                statusColors[product.status || "active"] ||
                                statusColors.active
                              }`}
                            >
                              {product.status?.replace("-", " ") || "Active"}
                            </span>
                          </div>
                        </div>
                        
                        {/* Badges */}
                        <div className="flex gap-1">
                          {product.isNew && (
                            <span className="text-xs font-bold bg-amber-500 text-white px-2 py-0.5 rounded">
                              NEW
                            </span>
                          )}
                          {product.featured && (
                            <span className="text-xs font-bold bg-purple-500 text-white px-2 py-0.5 rounded">
                              <Star size={10} className="inline mr-1" />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Product Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Price</p>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">
                          ৳{" "}
                          {product.salePrice
                            ? product.salePrice.toLocaleString()
                            : product.normalPrice.toLocaleString()}
                        </span>
                        {discountPercentage > 0 && (
                          <span className="text-xs text-red-600 font-bold">
                            -{discountPercentage}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Stock</p>
                      <div className="flex items-center gap-1">
                        <span
                          className={`font-medium ${
                            product.stockQuantity > 20
                              ? "text-emerald-600"
                              : product.stockQuantity > 0
                              ? "text-amber-600"
                              : "text-red-600"
                          }`}
                        >
                          {product.stockQuantity}
                        </span>
                        {product.stockQuantity <= 20 && product.stockQuantity > 0 && (
                          <AlertCircle size={14} className="text-amber-500" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Tags */}
                  {product.tags && product.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                        {product.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{product.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Buttons - Horizontal Layout */}
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => onView?.(product._id)}
                      className="flex-1 flex items-center justify-center gap-1 p-2 hover:bg-blue-50 rounded-lg text-blue-600 hover:text-blue-700 transition-colors border border-blue-200 text-sm"
                      title="View Details"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>

                    <Link
                      href={`/products/edit/${product._id}`}
                      className="flex-1 flex items-center justify-center gap-1 p-2 hover:bg-green-50 rounded-lg text-green-600 hover:text-green-700 transition-colors border border-green-200 text-sm"
                      title="Edit Product"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </Link>

                    <button
                      onClick={() => onToggleFeatured?.(product._id)}
                      className={`flex-1 flex items-center justify-center gap-1 p-2 rounded-lg border transition-colors text-sm ${
                        product.featured
                          ? "bg-amber-50 text-amber-600 border-amber-200 hover:bg-amber-100"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      }`}
                      title={
                        product.featured
                          ? "Remove from featured"
                          : "Add to featured"
                      }
                    >
                      <Star
                        size={16}
                        className={product.featured ? "fill-amber-500" : ""}
                      />
                      <span>{product.featured ? "Featured" : "Feature"}</span>
                    </button>

                    <button
                      onClick={() => openDeleteModal(product._id, product.title)}
                      className="flex-1 flex items-center justify-center gap-1 p-2 hover:bg-red-50 rounded-lg text-red-600 hover:text-red-700 transition-colors border border-red-200 text-sm"
                      title="Delete Product"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-6 py-12 text-center text-gray-500">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search size={28} className="text-gray-300" />
                </div>
                <p className="font-medium text-lg">No products found</p>
                {searchTerm && (
                  <p className="text-sm text-gray-400">
                    No results for "{searchTerm}"
                  </p>
                )}
                {products.length === 0 && !searchTerm && (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Your product list is empty
                    </p>
                    <Link
                      href="/products/add"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"
                    >
                      <Plus size={18} />
                      Add Your First Product
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {filteredProducts.length > 0 && (
          <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between text-sm text-gray-600 gap-2">
            <div>
              <span className="font-medium">{filteredProducts.length}</span> products
              {searchTerm && (
                <span className="ml-2">
                  matching "<span className="font-medium">{searchTerm}</span>"
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>
                  Active:{" "}
                  <span className="font-medium">
                    {filteredProducts.filter(p => p.status === "active").length}
                  </span>
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>
                  Featured:{" "}
                  <span className="font-medium">
                    {filteredProducts.filter(p => p.featured).length}
                  </span>
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}