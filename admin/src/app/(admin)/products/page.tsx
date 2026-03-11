// admin/src/app/(admin)/products/page.tsx - UPDATED with SINGLE EXPORT for ALL 30 products

// admin/src/app/(admin)/products/page.tsx - FIXED DISCOUNT PRICE ISSUE

"use client";

import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Package, TrendingUp, AlertTriangle, Sparkles, Download, FileDown, Facebook } from "lucide-react";
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
  // Additional fields for Facebook catalog
  sku?: string;
  brand?: string;
  color?: string;
  size?: string;
  material?: string;
  pattern?: string;
  gender?: "male" | "female" | "unisex";
  age_group?: "adult" | "kids" | "toddler" | "infant" | "newborn";
  gtin?: string;
  weight?: string;
  dimensions?: string;
  videoUrl?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalProducts: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ==================== UTILITY FUNCTIONS ====================

const getApiBaseUrl = (): string => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl) {
    if (!envUrl.startsWith('http')) {
      if (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') {
        return `https://${envUrl}`;
      } else {
        return `http://${envUrl}`;
      }
    }
    return envUrl;
  }
  
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1' ||
                      window.location.hostname === '';
  
  if (isLocalhost) {
    return 'http://localhost:4000';
  } else {
    return 'https://taskin-panjabi-server.onrender.com';
  }
};

const getApiUrl = (): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api`;
};

// ==================== FACEBOOK CATALOG CSV EXPORT FUNCTIONS ====================

/**
 * Map your category to Google Product Category
 */
const mapCategoryToGoogle = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'regular-panjabi': 'Apparel & Accessories > Clothing > Shirts & Tops',
    'premium-panjabi': 'Apparel & Accessories > Clothing > Shirts & Tops',
    'luxury-panjabi': 'Apparel & Accessories > Clothing > Shirts & Tops',
    'panjabi': 'Apparel & Accessories > Clothing > Shirts & Tops',
    'shirt': 'Apparel & Accessories > Clothing > Shirts & Tops',
    'pant': 'Apparel & Accessories > Clothing > Pants',
  };
  
  return categoryMap[category?.toLowerCase()] || 'Apparel & Accessories > Clothing';
};

/**
 * Map your category to Facebook Product Category
 */
const mapCategoryToFacebook = (category: string): string => {
  const categoryMap: Record<string, string> = {
    'regular-panjabi': 'Clothing & Accessories > Clothing > Shirts & Tops',
    'premium-panjabi': 'Clothing & Accessories > Clothing > Shirts & Tops',
    'luxury-panjabi': 'Clothing & Accessories > Clothing > Shirts & Tops',
    'panjabi': 'Clothing & Accessories > Clothing > Shirts & Tops',
    'shirt': 'Clothing & Accessories > Clothing > Shirts & Tops',
    'pant': 'Clothing & Accessories > Clothing > Pants',
  };
  
  return categoryMap[category?.toLowerCase()] || 'Clothing & Accessories > Clothing';
};

/**
 * Converts products to Facebook Catalog CSV format
 * FINAL VERSION: Using MongoDB ID for URLs as requested by client
 * URL format: https://www.duemanbd.com/product/69971acccfc0cd3a58f40203
 * FIXED: Ensures sale_price is properly populated for discounted products
 */
const convertToFacebookCatalogCSV = (products: Product[]): string => {
  console.log(`Converting ${products.length} products to Facebook Catalog CSV format`);
  
  // Count products with discounts for logging
  const discountedProducts = products.filter(p => {
    const hasDiscount = p.salePrice && p.salePrice < p.normalPrice;
    if (hasDiscount) {
      console.log(`✅ DISCOUNT FOUND: ${p.title} - Normal: ${p.normalPrice}, Sale: ${p.salePrice}`);
    }
    return hasDiscount;
  });
  
  console.log(`Found ${discountedProducts.length} products with discounts/sale prices`);
  
  // Facebook Catalog headers
  const headers = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
    'google_product_category',
    'fb_product_category',
    'quantity_to_sell_on_facebook',
    'sale_price',
    'sale_price_effective_date',
    'item_group_id',
    'gender',
    'color',
    'size',
    'age_group',
    'material',
    'pattern',
    'shipping',
    'shipping_weight',
    'video[0].url',
    'gtin',
    'product_tags[0]',
    'product_tags[1]',
    'style[0]'
  ];

  const rows = products.map(product => {
    // Determine availability
    let availability = 'out of stock';
    if (product.status === 'active' && product.stockQuantity > 0) {
      availability = 'in stock';
    } else if (product.status === 'low-stock' && product.stockQuantity > 0) {
      availability = 'in stock';
    }

    // Format price with currency (using BDT for Bangladeshi Taka)
    const price = `${product.normalPrice.toFixed(2)} BDT`;
    
    // FIXED: Properly handle sale price for discounted products
    // Check both salePrice field and also check if there's a discount (originalPrice > normalPrice)
    let salePrice = '';
    
    // Case 1: Explicit salePrice field exists and is less than normalPrice
    if (product.salePrice !== undefined && product.salePrice !== null) {
      if (product.salePrice < product.normalPrice) {
        salePrice = `${product.salePrice.toFixed(2)} BDT`;
        console.log(`✅ Product ${product._id} - ${product.title}: Using salePrice ${product.salePrice} (discounted from ${product.normalPrice})`);
      } else {
        console.log(`⚠️ Product ${product._id} - ${product.title}: salePrice ${product.salePrice} is NOT less than normalPrice ${product.normalPrice}`);
      }
    }
    // Case 2: Check if originalPrice exists and is different from normalPrice (legacy format)
    else if (product.originalPrice && product.originalPrice > product.normalPrice) {
      salePrice = `${product.normalPrice.toFixed(2)} BDT`;
      console.log(`✅ Product ${product._id} - ${product.title}: Using originalPrice format - sale price ${product.normalPrice} (was ${product.originalPrice})`);
    }
    
    // ✅ CRITICAL FIX: Use MongoDB ID for product URL (as requested by client)
    // This ensures URLs match exactly what's on the website
    const productUrl = `https://www.duemanbd.com/product/${product._id}`;
    
    // Ensure image URL is absolute
    const imageUrl = product.imageUrl.startsWith('http') 
      ? product.imageUrl 
      : `https://www.duemanbd.com${product.imageUrl.startsWith('/') ? '' : '/'}${product.imageUrl}`;
    
    // Get tags for product_tags fields
    const tags = product.tags || [];
    const productTag1 = tags.length > 0 ? tags[0] : '';
    const productTag2 = tags.length > 1 ? tags[1] : '';
    
    // Style (can be derived from category or tags)
    const style = product.category || '';
    
    // Map category to Google/Facebook product category
    const googleCategory = mapCategoryToGoogle(product.category);
    const fbCategory = mapCategoryToFacebook(product.category);
    
    // Escape fields that might contain commas or quotes
    const escapeField = (field: any): string => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      // If field contains comma, quotes, or newlines, wrap in quotes and escape internal quotes
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    return [
      escapeField(product._id),                                   // id - Use MongoDB ID
      escapeField(product.title),                                 // title
      escapeField(product.description.replace(/\n/g, ' ').substring(0, 9999)), // description
      availability,                                               // availability
      'new',                                                      // condition
      price,                                                      // price
      escapeField(productUrl),                                    // ✅ FIXED: link with MongoDB ID
      escapeField(imageUrl),                                      // image_link
      escapeField(product.brand || 'DuemanBD'),                   // brand - Use product brand if available
      googleCategory,                                             // google_product_category
      fbCategory,                                                 // fb_product_category
      product.stockQuantity > 0 ? String(product.stockQuantity) : '', // quantity
      salePrice,                                                  // ✅ FIXED: sale_price now properly populated for discounted products
      '',                                                         // sale_price_effective_date
      '',                                                         // item_group_id
      product.gender || 'unisex',                                 // gender
      escapeField(product.color || ''),                           // color
      escapeField(product.size || ''),                            // size
      product.age_group || 'adult',                               // age_group
      escapeField(product.material || ''),                        // material
      escapeField(product.pattern || ''),                         // pattern
      'BD:All:Standard:50 BDT',                                   // shipping
      product.weight ? escapeField(product.weight) : '',          // shipping_weight
      product.videoUrl ? escapeField(product.videoUrl) : '',      // video[0].url
      product.gtin ? escapeField(product.gtin) : '',              // gtin
      escapeField(productTag1),                                   // product_tags[0]
      escapeField(productTag2),                                   // product_tags[1]
      escapeField(style)                                          // style[0]
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  return csvContent;
};

/**
 * Download CSV file
 */
const downloadCSV = (csvContent: string, filename: string) => {
  // Add BOM for UTF-8 to handle special characters properly
  const bom = "\uFEFF";
  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export ALL products to Facebook Catalog CSV
 * This function now fetches ALL products from ALL pages
 */
const exportAllProductsToFacebookCatalog = async (token: string, totalProducts: number, setExporting: (loading: boolean) => void) => {
  try {
    setExporting(true);
    const loadingToast = toast.loading(`Fetching all ${totalProducts} products from database...`);
    
    // Fetch ALL products with pagination - this ensures we get all 30 products
    let allProducts: Product[] = [];
    let page = 1;
    let hasMore = true;
    const limit = 100; // Fetch 100 at a time to minimize requests

    console.log(`Starting full catalog export - fetching all products...`);

    while (hasMore) {
      console.log(`Fetching page ${page} with limit ${limit}...`);
      
      const response = await fetch(`${getApiUrl()}/products?page=${page}&limit=${limit}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch page ${page}: ${response.status}`);
      }
      
      const data = await response.json();
      const productsData = data.data || [];
      
      console.log(`Page ${page}: received ${productsData.length} products`);
      
      const formattedProducts = productsData.map((product: any) => {
        // FIXED: Better handling of salePrice
        // Log raw data for debugging
        console.log(`Raw product data for ${product._id}:`, {
          title: product.title,
          normalPrice: product.normalPrice,
          salePrice: product.salePrice,
          discountedPrice: product.discountedPrice,
          originalPrice: product.originalPrice
        });
        
        return {
          _id: product._id,
          title: product.title,
          description: product.description,
          category: product.category,
          imageUrl: product.imageUrl,
          normalPrice: product.normalPrice || product.price || 0,
          // FIXED: Don't use || operator that might filter out 0 or falsy values
          // Instead, check if salePrice exists in the product object
          salePrice: product.salePrice !== undefined ? product.salePrice : 
                     (product.discountedPrice !== undefined ? product.discountedPrice : undefined),
          originalPrice: product.originalPrice,
          stockQuantity: product.stockQuantity || 0,
          status: product.status,
          tags: product.tags,
          brand: product.brand,
          color: product.color,
          size: product.size,
          material: product.material,
          pattern: product.pattern,
          gender: product.gender,
          age_group: product.age_group,
          gtin: product.gtin,
          weight: product.weight,
          videoUrl: product.videoUrl,
        };
      });
      
      allProducts = [...allProducts, ...formattedProducts];
      
      hasMore = data.pagination?.hasNextPage || false;
      page++;
    }

    // Dismiss loading toast
    toast.dismiss(loadingToast);

    if (allProducts.length === 0) {
      toast.error("No products found");
      return;
    }

    console.log(`✅ Full catalog export complete: ${allProducts.length} products fetched`);
    
    // Count discounted products for reporting - with better detection
    const discountedProducts = allProducts.filter(p => {
      const hasSalePrice = p.salePrice !== undefined && p.salePrice !== null;
      const isDiscounted = hasSalePrice && p.salePrice < p.normalPrice;
      
      if (hasSalePrice) {
        console.log(`Product ${p._id} - ${p.title}: salePrice=${p.salePrice}, normalPrice=${p.normalPrice}, isDiscounted=${isDiscounted}`);
      }
      
      return isDiscounted;
    });
    
    console.log(`Found ${discountedProducts.length} products with discounts`);
    
    // Convert to CSV and download
    const csvContent = convertToFacebookCatalogCSV(allProducts);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `duemanbd-full-catalog-${timestamp}.csv`;
    downloadCSV(csvContent, filename);
    
    // Show success message with counts
    toast.success(
      <div>
        <p className="font-bold">✅ Exported ALL {allProducts.length} products!</p>
        <p className="text-sm mt-1">{discountedProducts.length} products have discount prices</p>
        <p className="text-xs mt-1">Ready for Facebook advertising</p>
      </div>
    );
    
    // Log sample URL for verification
    const sampleProduct = allProducts[0];
    console.log('Sample product URL:', `https://www.duemanbd.com/product/${sampleProduct._id}`);
    
    // Log first few discounted products for verification
    if (discountedProducts.length > 0) {
      console.log('Sample discounted products:');
      discountedProducts.slice(0, 3).forEach(p => {
        console.log(`  - ${p.title}: ৳{p.normalPrice} → ৳{p.salePrice}`);
      });
    }
    
  } catch (error) {
    console.error("Error exporting full catalog:", error);
    toast.error(`Failed to export catalog: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    setExporting(false);
  }
};

// ==================== MAIN COMPONENT ====================

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingCatalog, setExportingCatalog] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Pagination state
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    totalProducts: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [currentPage, setCurrentPage] = useState(1);
  
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
    fetchProducts(1);
  }, [router]);

  const fetchProducts = async (page: number = 1) => {
    try {
      setLoading(true);
      const apiUrl = getApiUrl();
      console.log(`🌐 Fetching products page ${page} from:`, `${apiUrl}/products?page=${page}&limit=20`);

      const token = getAuthToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${apiUrl}/products?page=${page}&limit=20`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (!res.ok) {
        if (res.status === 401) {
          throw new Error("Unauthorized - Please login again");
        }
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      
      // Handle paginated response
      const productsData = data.data || [];
      const paginationData = data.pagination || {
        currentPage: page,
        totalPages: 1,
        totalProducts: productsData.length,
        limit: 20,
        hasNextPage: false,
        hasPrevPage: false
      };

      const formattedProducts = productsData.map((product: any) => ({
        _id: product._id || product.id || `product-${Date.now()}-${Math.random()}`,
        title: product.title || "No Title",
        description: product.description || "",
        category: product.category || "uncategorized",
        imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
        normalPrice: product.normalPrice || product.price || 0,
        // FIXED: Better handling of salePrice
        salePrice: product.salePrice !== undefined ? product.salePrice : 
                   (product.discountedPrice !== undefined ? product.discountedPrice : undefined),
        originalPrice: product.originalPrice || product.normalPrice || product.price || 0,
        isBestSelling: product.isBestSelling || false,
        isNew: product.isNew || false,
        featured: product.featured || false,
        stockQuantity: product.stockQuantity || product.stock || product.quantity || 0,
        salesCount: product.salesCount || 0,
        rating: product.rating || 0,
        status: product.status || "active",
        tags: product.tags || [],
        createdAt: product.createdAt,
        // Facebook catalog fields
        sku: product.sku,
        brand: product.brand,
        color: product.color,
        size: product.size,
        material: product.material,
        pattern: product.pattern,
        gender: product.gender,
        age_group: product.age_group,
        gtin: product.gtin,
        weight: product.weight,
        videoUrl: product.videoUrl,
      }));

      console.log(`✅ Loaded ${formattedProducts.length} products (page ${paginationData.currentPage} of ${paginationData.totalPages})`);
      console.log(`Total products in database: ${paginationData.totalProducts}`);
      
      setProducts(formattedProducts);
      setPagination(paginationData);
      setCurrentPage(paginationData.currentPage);
      
    } catch (err: any) {
      console.error("❌ Error fetching products:", err);
      
      if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
        toast.error("Request timeout. Server might be slow or offline.");
      } else if (err.message.includes("Unauthorized") || err.message.includes("401")) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("admin-token");
        localStorage.removeItem("admin-user");
        router.push("/login");
      } else if (err.message.includes("NetworkError") || err.message.includes("Failed to fetch")) {
        toast.error("Cannot connect to server. Check your internet connection or ensure backend is running.");
        console.log("🌐 Current API URL:", getApiUrl());
      } else {
        toast.error(err.message || "Failed to load products");
      }
      
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      fetchProducts(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDelete = async (id: string) => {
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

    try {
      console.log("🗑️ Deleting product:", id);
      const apiUrl = getApiUrl();
      
      const response = await fetch(`${apiUrl}/products/${id}`, {
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
      console.log("✅ Delete response:", data);
      
      // Refresh current page after delete
      fetchProducts(currentPage);
      toast.success("Product deleted successfully!");
      
    } catch (err: any) {
      console.error("❌ Delete error:", err);
      
      if (err.message.includes("401") || err.message.includes("Unauthorized")) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("admin-token");
        localStorage.removeItem("admin-user");
        router.push("/login");
      } else if (err.message.includes("404")) {
        toast.error("Product not found on server.");
        fetchProducts(currentPage);
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
      const apiUrl = getApiUrl();

      const response = await fetch(`${apiUrl}/products/${id}`, {
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
    console.log("🔄 Refreshing products...");
    setRefreshing(true);
    fetchProducts(currentPage);
  };

  // SINGLE EXPORT FUNCTION - Always exports ALL products
  const handleExportCatalog = async () => {
    const token = getAuthToken();
    if (!token) {
      toast.error("Not authenticated");
      router.push("/login");
      return;
    }
    
    await exportAllProductsToFacebookCatalog(token, pagination.totalProducts, setExportingCatalog);
  };

  // Function to test discount display (for debugging)
  const testDiscountDisplay = () => {
    const discounted = products.filter(p => p.salePrice && p.salePrice < p.normalPrice);
    console.log('Current page discounted products:', discounted.length);
    discounted.forEach(p => {
      console.log(`- ${p.title}: ৳{p.normalPrice} → ৳{p.salePrice}`);
    });
    toast.success(`Found ${discounted.length} discounted products on current page`);
  };

  if (loading && currentPage === 1) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <div className="flex-1 flex flex-col">
          <main className="p-4 sm:p-6 flex-1 overflow-auto flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
              <p className="text-gray-600 text-sm sm:text-base">Loading products...</p>
              <p className="text-gray-400 text-xs mt-2">Connecting to: {getApiBaseUrl()}</p>
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
          {/* Header Section */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                Products Management
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalProducts} total products in database
              </p>
              <p className="text-gray-400 text-xs mt-1">
                Backend: {getApiBaseUrl()}
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
              
              {/* Debug button - can be removed after fixing */}
              <button
                onClick={testDiscountDisplay}
                className="px-2 py-2 bg-yellow-100 text-yellow-700 rounded-lg text-xs hidden md:block"
                title="Test discount display"
              >
                Test
              </button>
              
              {/* SINGLE EXPORT BUTTON - Exports ALL 30 products */}
              <button
                onClick={handleExportCatalog}
                disabled={exportingCatalog}
                className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 font-medium shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none"
                title="Exports ALL products for Facebook advertising"
              >
                {exportingCatalog ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Exporting {pagination.totalProducts} products...</span>
                  </>
                ) : (
                  <>
                    <Facebook className="w-4 h-4" />
                    <Download className="w-4 h-4" />
                    <span className="hidden sm:inline">Export Facebook Catalog</span>
                    <span className="sm:hidden">Export</span>
                    <span className="ml-1 text-xs bg-white text-green-700 px-1.5 py-0.5 rounded-full">
                      {pagination.totalProducts}
                    </span>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Products</p>
                  <p className="text-2xl font-bold text-gray-900">{pagination.totalProducts}</p>
                </div>
                <div className="p-2 bg-amber-50 rounded-lg">
                  <Package className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">On This Page</p>
                  <p className="text-2xl font-bold text-gray-900">{products.length}</p>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg">
                  <span className="text-blue-600 font-bold text-xl">{pagination.currentPage}</span>
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
                  <p className="text-sm text-gray-500">Discounted</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {products.filter(p => p.salePrice && p.salePrice < p.normalPrice).length}
                  </p>
                </div>
                <div className="p-2 bg-purple-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Products Table */}
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

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-600">
                Showing page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalProducts} total products in database
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={!pagination.hasPrevPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  let pageNum;
                  if (pagination.totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= pagination.totalPages - 2) {
                    pageNum = pagination.totalPages - 4 + i;
                  } else {
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
                        pagination.currentPage === pageNum
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
                          : "border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!pagination.hasNextPage}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {products.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <Package className="w-full h-full" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-2">Get started by adding your first product</p>
              <p className="text-gray-400 text-sm mb-6">
                Backend: {getApiBaseUrl()}
              </p>
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
    </div>
  );
}


// // admin/src/app/(admin)/products/page.tsx - UPDATED with Pagination

// "use client";

// import { useState, useEffect } from "react";
// import { toast } from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import { Package, TrendingUp, AlertTriangle, Sparkles, Download, FileDown } from "lucide-react";
// import { checkAuthAndRedirect, getAuthToken } from "../../../utils/auth";
// import AdminProductsTable from "../../../components/AdminProductsTable";
// import ProductViewModal from "../../../components/ProductViewModal";

// interface Product {
//   _id: string;
//   title: string;
//   description: string;
//   category: string;
//   imageUrl: string;
//   normalPrice: number;
//   salePrice?: number;
//   originalPrice?: number;
//   isBestSelling?: boolean;
//   isNew?: boolean;
//   featured?: boolean;
//   stockQuantity: number;
//   salesCount?: number;
//   rating?: number;
//   status?: "active" | "draft" | "archived" | "low-stock" | "out-of-stock";
//   tags?: string[];
//   createdAt?: string;
// }

// interface PaginationInfo {
//   currentPage: number;
//   totalPages: number;
//   totalProducts: number;
//   limit: number;
//   hasNextPage: boolean;
//   hasPrevPage: boolean;
// }

// // ==================== UTILITY FUNCTIONS ====================

// const getApiBaseUrl = (): string => {
//   const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
//   if (envUrl) {
//     if (!envUrl.startsWith('http')) {
//       if (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') {
//         return `https://${envUrl}`;
//       } else {
//         return `http://${envUrl}`;
//       }
//     }
//     return envUrl;
//   }
  
//   const isLocalhost = window.location.hostname === 'localhost' || 
//                       window.location.hostname === '127.0.0.1' ||
//                       window.location.hostname === '';
  
//   if (isLocalhost) {
//     return 'http://localhost:4000';
//   } else {
//     return 'https://taskin-panjabi-server.onrender.com';
//   }
// };

// const getApiUrl = (): string => {
//   const baseUrl = getApiBaseUrl();
//   return `${baseUrl}/api`;
// };

// // ==================== CSV EXPORT FUNCTIONS ====================

// const convertToCSV = (products: Product[]): string => {
//   const headers = [
//     'ID', 'Title', 'Description', 'Category', 'Image URL', 'Normal Price',
//     'Sale Price', 'Original Price', 'Best Selling', 'New Arrival', 'Featured',
//     'Stock Quantity', 'Sales Count', 'Rating', 'Status', 'Tags', 'Created At'
//   ];

//   const rows = products.map(product => [
//     product._id,
//     `"${product.title.replace(/"/g, '""')}"`,
//     `"${product.description.replace(/"/g, '""')}"`,
//     product.category,
//     product.imageUrl,
//     product.normalPrice,
//     product.salePrice || '',
//     product.originalPrice || product.normalPrice,
//     product.isBestSelling ? 'Yes' : 'No',
//     product.isNew ? 'Yes' : 'No',
//     product.featured ? 'Yes' : 'No',
//     product.stockQuantity,
//     product.salesCount || 0,
//     product.rating || 0,
//     product.status || 'active',
//     `"${(product.tags || []).join(', ')}"`,
//     product.createdAt ? new Date(product.createdAt).toISOString() : ''
//   ]);

//   const csvContent = [
//     headers.join(','),
//     ...rows.map(row => row.join(','))
//   ].join('\n');

//   return csvContent;
// };

// const downloadCSV = (csvContent: string, filename: string) => {
//   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = url;
//   link.setAttribute('download', filename);
//   link.style.visibility = 'hidden';
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// };

// const exportProductsToCSV = (products: Product[]) => {
//   if (products.length === 0) {
//     toast.error('No products to export');
//     return;
//   }

//   try {
//     const csvContent = convertToCSV(products);
//     const timestamp = new Date().toISOString().split('T')[0];
//     const filename = `products-export-${timestamp}.csv`;
//     downloadCSV(csvContent, filename);
//     toast.success(`Exported ${products.length} products successfully!`);
//   } catch (error) {
//     console.error('Error exporting CSV:', error);
//     toast.error('Failed to export products');
//   }
// };

// const exportFilteredProducts = (products: Product[], filterType?: string) => {
//   let filteredProducts = products;
//   let filename = 'products-export';

//   if (filterType) {
//     switch (filterType) {
//       case 'featured':
//         filteredProducts = products.filter(p => p.featured);
//         filename = 'featured-products-export';
//         break;
//       case 'low-stock':
//         filteredProducts = products.filter(p => p.stockQuantity < 10);
//         filename = 'low-stock-products-export';
//         break;
//       case 'best-selling':
//         filteredProducts = products.filter(p => p.isBestSelling);
//         filename = 'best-selling-products-export';
//         break;
//       case 'new':
//         filteredProducts = products.filter(p => p.isNew);
//         filename = 'new-arrivals-export';
//         break;
//     }
//   }

//   if (filteredProducts.length === 0) {
//     toast.error(`No ${filterType ? filterType.replace('-', ' ') : ''} products to export`);
//     return;
//   }

//   try {
//     const timestamp = new Date().toISOString().split('T')[0];
//     const fullFilename = `${filename}-${timestamp}.csv`;
//     const csvContent = convertToCSV(filteredProducts);
//     downloadCSV(csvContent, fullFilename);
//     toast.success(`Exported ${filteredProducts.length} ${filterType ? filterType.replace('-', ' ') : ''} products successfully!`);
//   } catch (error) {
//     console.error('Error exporting filtered CSV:', error);
//     toast.error('Failed to export filtered products');
//   }
// };

// // ==================== MAIN COMPONENT ====================

// export default function AdminProductsPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [isMobile, setIsMobile] = useState(false);
//   const [showExportMenu, setShowExportMenu] = useState(false);
  
//   // Pagination state
//   const [pagination, setPagination] = useState<PaginationInfo>({
//     currentPage: 1,
//     totalPages: 1,
//     totalProducts: 0,
//     limit: 20,
//     hasNextPage: false,
//     hasPrevPage: false
//   });
//   const [currentPage, setCurrentPage] = useState(1);
  
//   const router = useRouter();

//   // Detect mobile on mount and resize
//   useEffect(() => {
//     const checkMobile = () => {
//       setIsMobile(window.innerWidth < 768);
//     };
//     checkMobile();
//     window.addEventListener("resize", checkMobile);
//     return () => window.removeEventListener("resize", checkMobile);
//   }, []);

//   // Close export menu when clicking outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (showExportMenu && !(event.target as Element).closest('.export-menu')) {
//         setShowExportMenu(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, [showExportMenu]);

//   // Check authentication on mount
//   useEffect(() => {
//     if (!checkAuthAndRedirect(router)) {
//       return;
//     }
//     fetchProducts(1);
//   }, [router]);

//   const fetchProducts = async (page: number = 1) => {
//     try {
//       setLoading(true);
//       const apiUrl = getApiUrl();
//       console.log(`🌐 Fetching products page ${page} from:`, `${apiUrl}/products?page=${page}&limit=20`);

//       const token = getAuthToken();
//       if (!token) {
//         router.push("/login");
//         return;
//       }

//       const res = await fetch(`${apiUrl}/products?page=${page}&limit=20`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//           'Accept': 'application/json'
//         },
//         signal: AbortSignal.timeout(10000)
//       });

//       if (!res.ok) {
//         if (res.status === 401) {
//           throw new Error("Unauthorized - Please login again");
//         }
//         throw new Error(`HTTP error! status: ${res.status}`);
//       }

//       const data = await res.json();
      
//       // Handle paginated response
//       const productsData = data.data || [];
//       const paginationData = data.pagination || {
//         currentPage: page,
//         totalPages: 1,
//         totalProducts: productsData.length,
//         limit: 20,
//         hasNextPage: false,
//         hasPrevPage: false
//       };

//       const formattedProducts = productsData.map((product: any) => ({
//         _id: product._id || product.id || `product-${Date.now()}-${Math.random()}`,
//         title: product.title || "No Title",
//         description: product.description || "",
//         category: product.category || "uncategorized",
//         imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
//         normalPrice: product.normalPrice || product.price || 0,
//         salePrice: product.salePrice || product.discountedPrice || undefined,
//         originalPrice: product.originalPrice || product.normalPrice || product.price || 0,
//         isBestSelling: product.isBestSelling || false,
//         isNew: product.isNew || false,
//         featured: product.featured || false,
//         stockQuantity: product.stockQuantity || product.stock || product.quantity || 0,
//         salesCount: product.salesCount || 0,
//         rating: product.rating || 0,
//         status: product.status || "active",
//         tags: product.tags || [],
//         createdAt: product.createdAt,
//       }));

//       console.log(`✅ Loaded ${formattedProducts.length} products (page ${paginationData.currentPage} of ${paginationData.totalPages})`);
//       setProducts(formattedProducts);
//       setPagination(paginationData);
//       setCurrentPage(paginationData.currentPage);
      
//     } catch (err: any) {
//       console.error("❌ Error fetching products:", err);
      
//       if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
//         toast.error("Request timeout. Server might be slow or offline.");
//       } else if (err.message.includes("Unauthorized") || err.message.includes("401")) {
//         toast.error("Session expired. Please login again.");
//         localStorage.removeItem("admin-token");
//         localStorage.removeItem("admin-user");
//         router.push("/login");
//       } else if (err.message.includes("NetworkError") || err.message.includes("Failed to fetch")) {
//         toast.error("Cannot connect to server. Check your internet connection or ensure backend is running.");
//         console.log("🌐 Current API URL:", getApiUrl());
//       } else {
//         toast.error(err.message || "Failed to load products");
//       }
      
//       setProducts([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const handlePageChange = (newPage: number) => {
//     if (newPage >= 1 && newPage <= pagination.totalPages) {
//       setCurrentPage(newPage);
//       fetchProducts(newPage);
//       window.scrollTo({ top: 0, behavior: 'smooth' });
//     }
//   };

//   const handleDelete = async (id: string) => {
//     const product = products.find((p) => p._id === id);
//     if (!product) {
//       toast.error("Product not found");
//       return;
//     }

//     const token = getAuthToken();
//     if (!token) {
//       toast.error("You are not logged in!");
//       router.push("/login");
//       return;
//     }

//     try {
//       console.log("🗑️ Deleting product:", id);
//       const apiUrl = getApiUrl();
      
//       const response = await fetch(`${apiUrl}/products/${id}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });

//       if (!response.ok) {
//         const errorData = await response.json();
//         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//       }

//       const data = await response.json();
//       console.log("✅ Delete response:", data);
      
//       // Refresh current page after delete
//       fetchProducts(currentPage);
//       toast.success("Product deleted successfully!");
      
//     } catch (err: any) {
//       console.error("❌ Delete error:", err);
      
//       if (err.message.includes("401") || err.message.includes("Unauthorized")) {
//         toast.error("Session expired. Please login again.");
//         localStorage.removeItem("admin-token");
//         localStorage.removeItem("admin-user");
//         router.push("/login");
//       } else if (err.message.includes("404")) {
//         toast.error("Product not found on server.");
//         fetchProducts(currentPage);
//       } else {
//         toast.error(err.message || "Failed to delete product");
//       }
//     }
//   };

//   const handleEdit = (id: string) => {
//     router.push(`/products/edit/${id}`);
//   };

//   const handleView = (id: string) => {
//     const product = products.find((p) => p._id === id);
//     if (product) {
//       setViewingProduct(product);
//       setIsModalOpen(true);
//     }
//   };

//   const handleToggleFeatured = async (id: string) => {
//     try {
//       const product = products.find((p) => p._id === id);
//       if (!product) {
//         toast.error("Product not found");
//         return;
//       }

//       const token = getAuthToken();
//       if (!token) {
//         toast.error("You are not logged in!");
//         router.push("/login");
//         return;
//       }

//       const newFeaturedStatus = !product.featured;
//       const apiUrl = getApiUrl();

//       const response = await fetch(`${apiUrl}/products/${id}`, {
//         method: 'PATCH',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ featured: newFeaturedStatus })
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }

//       setProducts((prev) =>
//         prev.map((p) =>
//           p._id === id ? { ...p, featured: newFeaturedStatus } : p
//         )
//       );

//       toast.success(
//         newFeaturedStatus
//           ? "Product marked as featured!"
//           : "Product removed from featured"
//       );
//     } catch (err: any) {
//       console.error("Toggle featured error:", err);
//       toast.error(err.message || "Failed to update product");
//     }
//   };

//   const handleRefresh = () => {
//     console.log("🔄 Refreshing products...");
//     setRefreshing(true);
//     fetchProducts(currentPage);
//   };

//   const handleExportAll = () => {
//     // For export all, we need to fetch all products first
//     toast.loading("Preparing export...");
//     const apiUrl = getApiUrl();
//     const token = getAuthToken();
    
//     fetch(`${apiUrl}/products?limit=1000`, {
//       headers: { 'Authorization': `Bearer ${token}` }
//     })
//       .then(res => res.json())
//       .then(data => {
//         const allProducts = data.data || [];
//         exportProductsToCSV(allProducts);
//         toast.dismiss();
//       })
//       .catch(err => {
//         console.error("Export error:", err);
//         toast.error("Failed to export all products");
//         toast.dismiss();
//       });
    
//     setShowExportMenu(false);
//   };

//   const handleExportFiltered = (filterType: string) => {
//     exportFilteredProducts(products, filterType);
//     setShowExportMenu(false);
//   };

//   if (loading && currentPage === 1) {
//     return (
//       <div className="flex min-h-screen bg-gray-50">
//         <div className="flex-1 flex flex-col">
//           <main className="p-4 sm:p-6 flex-1 overflow-auto flex items-center justify-center">
//             <div className="text-center">
//               <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
//               <p className="text-gray-600 text-sm sm:text-base">Loading products...</p>
//               <p className="text-gray-400 text-xs mt-2">Connecting to: {getApiBaseUrl()}</p>
//             </div>
//           </main>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex min-h-screen bg-gray-50">
//       <div className="flex-1 flex flex-col">
//         <main className="p-3 sm:p-4 md:p-6 flex-1 overflow-auto">
//           {/* Header Section */}
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
//             <div className="w-full sm:w-auto">
//               <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
//                 Products Management
//               </h1>
//               <p className="text-gray-600 mt-1 text-sm sm:text-base">
//                 Page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalProducts} total products
//               </p>
//               <p className="text-gray-400 text-xs mt-1">
//                 Backend: {getApiBaseUrl()}
//               </p>
//             </div>
//             <div className="flex gap-2 w-full sm:w-auto">
//               <button
//                 onClick={handleRefresh}
//                 disabled={refreshing}
//                 className={`px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 font-medium shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none ${refreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
//               >
//                 {refreshing ? (
//                   <>
//                     <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
//                     <span className="hidden sm:inline">Refreshing...</span>
//                     <span className="sm:hidden">Refresh</span>
//                   </>
//                 ) : (
//                   <>
//                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//                     </svg>
//                     <span className="hidden sm:inline">Refresh</span>
//                   </>
//                 )}
//               </button>
              
//               {/* Export Button */}
//               <div className="export-menu relative">
//                 <button
//                   onClick={() => setShowExportMenu(!showExportMenu)}
//                   className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none"
//                 >
//                   <Download className="w-4 h-4" />
//                   <span className="hidden sm:inline">Export CSV</span>
//                   <span className="sm:hidden">Export</span>
//                 </button>
                
//                 {showExportMenu && (
//                   <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
//                     <div className="p-2">
//                       <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                         Export Options
//                       </div>
//                       <button
//                         onClick={handleExportAll}
//                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
//                       >
//                         <FileDown className="w-4 h-4" />
//                         <span>Export All Products</span>
//                       </button>
//                       <div className="border-t my-1"></div>
//                       <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
//                         Current Page
//                       </div>
//                       <button
//                         onClick={() => handleExportFiltered('featured')}
//                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
//                       >
//                         <TrendingUp className="w-4 h-4" />
//                         <span>Featured ({products.filter(p => p.featured).length})</span>
//                       </button>
//                       <button
//                         onClick={() => handleExportFiltered('best-selling')}
//                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
//                       >
//                         <Package className="w-4 h-4" />
//                         <span>Best Selling ({products.filter(p => p.isBestSelling).length})</span>
//                       </button>
//                       <button
//                         onClick={() => handleExportFiltered('new')}
//                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
//                       >
//                         <Sparkles className="w-4 h-4" />
//                         <span>New Arrivals ({products.filter(p => p.isNew).length})</span>
//                       </button>
//                       <button
//                         onClick={() => handleExportFiltered('low-stock')}
//                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
//                       >
//                         <AlertTriangle className="w-4 h-4" />
//                         <span>Low Stock ({products.filter(p => p.stockQuantity < 10).length})</span>
//                       </button>
//                     </div>
//                   </div>
//                 )}
//               </div>
              
//               <button
//                 onClick={() => router.push("/products/add")}
//                 className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 font-medium shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none"
//               >
//                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//                 </svg>
//                 <span className="hidden sm:inline">Add Product</span>
//                 <span className="sm:hidden">Add</span>
//               </button>
//             </div>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
//             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Total Products</p>
//                   <p className="text-2xl font-bold text-gray-900">{pagination.totalProducts}</p>
//                 </div>
//                 <div className="p-2 bg-amber-50 rounded-lg">
//                   <Package className="w-6 h-6 text-amber-600" />
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">On This Page</p>
//                   <p className="text-2xl font-bold text-gray-900">{products.length}</p>
//                 </div>
//                 <div className="p-2 bg-blue-50 rounded-lg">
//                   <span className="text-blue-600 font-bold text-xl">{pagination.currentPage}</span>
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Low Stock</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {products.filter(p => p.stockQuantity < 10).length}
//                   </p>
//                 </div>
//                 <div className="p-2 bg-red-50 rounded-lg">
//                   <AlertTriangle className="w-6 h-6 text-red-600" />
//                 </div>
//               </div>
//             </div>
            
//             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <p className="text-sm text-gray-500">Featured</p>
//                   <p className="text-2xl font-bold text-gray-900">
//                     {products.filter(p => p.featured).length}
//                   </p>
//                 </div>
//                 <div className="p-2 bg-purple-50 rounded-lg">
//                   <TrendingUp className="w-6 h-6 text-purple-600" />
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Products Table */}
//           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
//             <AdminProductsTable
//               products={products}
//               onEdit={handleEdit}
//               onDelete={handleDelete}
//               onView={handleView}
//               onToggleFeatured={handleToggleFeatured}
//               onRefresh={handleRefresh}
//               refreshing={refreshing}
//             />
//           </div>

//           {/* Pagination Controls */}
//           {pagination.totalPages > 1 && (
//             <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
//               <div className="text-sm text-gray-600">
//                 Showing page {pagination.currentPage} of {pagination.totalPages} • {pagination.totalProducts} total products
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => handlePageChange(pagination.currentPage - 1)}
//                   disabled={!pagination.hasPrevPage}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Previous
//                 </button>
                
//                 {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
//                   let pageNum;
//                   if (pagination.totalPages <= 5) {
//                     pageNum = i + 1;
//                   } else if (pagination.currentPage <= 3) {
//                     pageNum = i + 1;
//                   } else if (pagination.currentPage >= pagination.totalPages - 2) {
//                     pageNum = pagination.totalPages - 4 + i;
//                   } else {
//                     pageNum = pagination.currentPage - 2 + i;
//                   }
                  
//                   return (
//                     <button
//                       key={pageNum}
//                       onClick={() => handlePageChange(pageNum)}
//                       className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
//                         pagination.currentPage === pageNum
//                           ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white"
//                           : "border border-gray-300 hover:bg-gray-50"
//                       }`}
//                     >
//                       {pageNum}
//                     </button>
//                   );
//                 })}
                
//                 <button
//                   onClick={() => handlePageChange(pagination.currentPage + 1)}
//                   disabled={!pagination.hasNextPage}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   Next
//                 </button>
//               </div>
//             </div>
//           )}

//           {/* Empty State */}
//           {products.length === 0 && !loading && (
//             <div className="text-center py-12">
//               <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
//                 <Package className="w-full h-full" />
//               </div>
//               <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
//               <p className="text-gray-600 mb-2">Get started by adding your first product</p>
//               <p className="text-gray-400 text-sm mb-6">
//                 Backend: {getApiBaseUrl()}
//               </p>
//               <button
//                 onClick={() => router.push("/products/add")}
//                 className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 font-medium shadow-sm"
//               >
//                 + Add First Product
//               </button>
//             </div>
//           )}

//           <ProductViewModal
//             product={viewingProduct}
//             isOpen={isModalOpen}
//             onClose={() => setIsModalOpen(false)}
//           />
//         </main>

//         {/* Mobile Floating Action Button */}
//         {isMobile && products.length > 0 && (
//           <button
//             onClick={() => router.push("/products/add")}
//             className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
//           >
//             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//           </button>
//         )}
//       </div>
//     </div>
//   );
// }



// // // admin/src/app/(admin)/products/page.tsx

// // "use client";

// // import { useState, useEffect } from "react";
// // import { toast } from "react-hot-toast";
// // import { useRouter } from "next/navigation";
// // import { Package, TrendingUp, AlertTriangle, Sparkles, Download, FileDown } from "lucide-react";
// // import { checkAuthAndRedirect, getAuthToken } from "../../../utils/auth";
// // import AdminProductsTable from "../../../components/AdminProductsTable";
// // import ProductViewModal from "../../../components/ProductViewModal";

// // interface Product {
// //   _id: string;
// //   title: string;
// //   description: string;
// //   category: string;
// //   imageUrl: string;
// //   normalPrice: number;
// //   salePrice?: number;
// //   originalPrice?: number;
// //   isBestSelling?: boolean;
// //   isNew?: boolean;
// //   featured?: boolean;
// //   stockQuantity: number;
// //   salesCount?: number;
// //   rating?: number;
// //   status?: "active" | "draft" | "archived" | "low-stock" | "out-of-stock";
// //   tags?: string[];
// //   createdAt?: string;
// // }

// // // ==================== UTILITY FUNCTIONS ====================

// // // Get API URL with proper protocol handling
// // const getApiBaseUrl = (): string => {
// //   // First check for environment variable
// //   const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
// //   if (envUrl) {
// //     // If env URL is provided, ensure it has the correct protocol
// //     if (!envUrl.startsWith('http')) {
// //       // For production environments, default to https
// //       if (process.env.NODE_ENV === 'production' || window.location.hostname !== 'localhost') {
// //         return `https://${envUrl}`;
// //       } else {
// //         return `http://${envUrl}`;
// //       }
// //     }
// //     return envUrl;
// //   }
  
// //   // If no env variable, detect based on current environment
// //   const isLocalhost = window.location.hostname === 'localhost' || 
// //                       window.location.hostname === '127.0.0.1' ||
// //                       window.location.hostname === '';
  
// //   if (isLocalhost) {
// //     return 'http://localhost:4000';
// //   } else {
// //     return 'https://taskin-panjabi-server.onrender.com';
// //   }
// // };

// // // Get API URL for requests
// // const getApiUrl = (): string => {
// //   const baseUrl = getApiBaseUrl();
// //   return `${baseUrl}/api`;
// // };

// // // ==================== CSV EXPORT FUNCTIONS ====================

// // // Function to convert products to CSV format
// // const convertToCSV = (products: Product[]): string => {
// //   // Define CSV headers
// //   const headers = [
// //     'ID',
// //     'Title',
// //     'Description',
// //     'Category',
// //     'Image URL',
// //     'Normal Price',
// //     'Sale Price',
// //     'Original Price',
// //     'Best Selling',
// //     'New Arrival',
// //     'Featured',
// //     'Stock Quantity',
// //     'Sales Count',
// //     'Rating',
// //     'Status',
// //     'Tags',
// //     'Created At'
// //   ];

// //   // Convert each product to CSV row
// //   const rows = products.map(product => [
// //     product._id,
// //     `"${product.title.replace(/"/g, '""')}"`, // Escape quotes in title
// //     `"${product.description.replace(/"/g, '""')}"`, // Escape quotes in description
// //     product.category,
// //     product.imageUrl,
// //     product.normalPrice,
// //     product.salePrice || '',
// //     product.originalPrice || product.normalPrice,
// //     product.isBestSelling ? 'Yes' : 'No',
// //     product.isNew ? 'Yes' : 'No',
// //     product.featured ? 'Yes' : 'No',
// //     product.stockQuantity,
// //     product.salesCount || 0,
// //     product.rating || 0,
// //     product.status || 'active',
// //     `"${(product.tags || []).join(', ')}"`, // Join tags array
// //     product.createdAt ? new Date(product.createdAt).toISOString() : ''
// //   ]);

// //   // Combine headers and rows
// //   const csvContent = [
// //     headers.join(','),
// //     ...rows.map(row => row.join(','))
// //   ].join('\n');

// //   return csvContent;
// // };

// // // Function to download CSV file
// // const downloadCSV = (csvContent: string, filename: string) => {
// //   // Create a Blob with the CSV content
// //   const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
// //   // Create a temporary URL for the Blob
// //   const url = URL.createObjectURL(blob);
  
// //   // Create a temporary link element
// //   const link = document.createElement('a');
// //   link.href = url;
// //   link.setAttribute('download', filename);
// //   link.style.visibility = 'hidden';
  
// //   // Append to body, click, and remove
// //   document.body.appendChild(link);
// //   link.click();
// //   document.body.removeChild(link);
  
// //   // Clean up the URL object
// //   URL.revokeObjectURL(url);
// // };

// // // Function to export products as CSV
// // const exportProductsToCSV = (products: Product[]) => {
// //   if (products.length === 0) {
// //     toast.error('No products to export');
// //     return;
// //   }

// //   try {
// //     const csvContent = convertToCSV(products);
// //     const timestamp = new Date().toISOString().split('T')[0];
// //     const filename = `products-export-${timestamp}.csv`;
    
// //     downloadCSV(csvContent, filename);
// //     toast.success(`Exported ${products.length} products successfully!`);
// //   } catch (error) {
// //     console.error('Error exporting CSV:', error);
// //     toast.error('Failed to export products');
// //   }
// // };

// // // Function to export filtered products (you can customize filtering logic)
// // const exportFilteredProducts = (products: Product[], filterType?: string) => {
// //   let filteredProducts = products;
// //   let filename = 'products-export';

// //   if (filterType) {
// //     switch (filterType) {
// //       case 'featured':
// //         filteredProducts = products.filter(p => p.featured);
// //         filename = 'featured-products-export';
// //         break;
// //       case 'low-stock':
// //         filteredProducts = products.filter(p => p.stockQuantity < 10);
// //         filename = 'low-stock-products-export';
// //         break;
// //       case 'best-selling':
// //         filteredProducts = products.filter(p => p.isBestSelling);
// //         filename = 'best-selling-products-export';
// //         break;
// //       case 'new':
// //         filteredProducts = products.filter(p => p.isNew);
// //         filename = 'new-arrivals-export';
// //         break;
// //       default:
// //         break;
// //     }
// //   }

// //   if (filteredProducts.length === 0) {
// //     toast.error(`No ${filterType ? filterType.replace('-', ' ') : ''} products to export`);
// //     return;
// //   }

// //   try {
// //     const timestamp = new Date().toISOString().split('T')[0];
// //     const fullFilename = `${filename}-${timestamp}.csv`;
// //     const csvContent = convertToCSV(filteredProducts);
    
// //     downloadCSV(csvContent, fullFilename);
// //     toast.success(`Exported ${filteredProducts.length} ${filterType ? filterType.replace('-', ' ') : ''} products successfully!`);
// //   } catch (error) {
// //     console.error('Error exporting filtered CSV:', error);
// //     toast.error('Failed to export filtered products');
// //   }
// // };

// // // ==================== MAIN COMPONENT ====================

// // export default function AdminProductsPage() {
// //   const [products, setProducts] = useState<Product[]>([]);
// //   const [loading, setLoading] = useState(true);
// //   const [refreshing, setRefreshing] = useState(false);
// //   const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [isMobile, setIsMobile] = useState(false);
// //   const [showExportMenu, setShowExportMenu] = useState(false);
// //   const router = useRouter();

// //   // Detect mobile on mount and resize
// //   useEffect(() => {
// //     const checkMobile = () => {
// //       setIsMobile(window.innerWidth < 768);
// //     };

// //     checkMobile();
// //     window.addEventListener("resize", checkMobile);
// //     return () => window.removeEventListener("resize", checkMobile);
// //   }, []);

// //   // Close export menu when clicking outside
// //   useEffect(() => {
// //     const handleClickOutside = (event: MouseEvent) => {
// //       if (showExportMenu && !(event.target as Element).closest('.export-menu')) {
// //         setShowExportMenu(false);
// //       }
// //     };

// //     document.addEventListener('mousedown', handleClickOutside);
// //     return () => document.removeEventListener('mousedown', handleClickOutside);
// //   }, [showExportMenu]);

// //   // Check authentication on mount
// //   useEffect(() => {
// //     if (!checkAuthAndRedirect(router)) {
// //       return;
// //     }
// //     fetchProducts();
// //   }, [router]);

// //   const fetchProducts = async () => {
// //     try {
// //       setLoading(true);
// //       const apiUrl = getApiUrl();
// //       console.log("🌐 Fetching products from:", `${apiUrl}/products`);

// //       const token = getAuthToken();
// //       if (!token) {
// //         router.push("/login");
// //         return;
// //       }

// //       const res = await fetch(`${apiUrl}/products`, {
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json',
// //           'Accept': 'application/json'
// //         },
// //         signal: AbortSignal.timeout(10000)
// //       });

// //       if (!res.ok) {
// //         if (res.status === 401) {
// //           throw new Error("Unauthorized - Please login again");
// //         }
// //         throw new Error(`HTTP error! status: ${res.status}`);
// //       }

// //       const data = await res.json();
// //       const productsData = data.data || data || [];

// //       const formattedProducts = productsData.map((product: any) => ({
// //         _id: product._id || product.id || `product-${Date.now()}-${Math.random()}`,
// //         title: product.title || "No Title",
// //         description: product.description || "",
// //         category: product.category || "uncategorized",
// //         imageUrl: product.imageUrl || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop',
// //         normalPrice: product.normalPrice || product.price || 0,
// //         salePrice: product.salePrice || product.discountedPrice || undefined,
// //         originalPrice: product.originalPrice || product.normalPrice || product.price || 0,
// //         isBestSelling: product.isBestSelling || false,
// //         isNew: product.isNew || false,
// //         featured: product.featured || false,
// //         stockQuantity: product.stockQuantity || product.stock || product.quantity || 0,
// //         salesCount: product.salesCount || 0,
// //         rating: product.rating || 0,
// //         status: product.status || "active",
// //         tags: product.tags || [],
// //         createdAt: product.createdAt,
// //       }));

// //       console.log(`✅ Loaded ${formattedProducts.length} products`);
// //       setProducts(formattedProducts);
      
// //     } catch (err: any) {
// //       console.error("❌ Error fetching products:", err);
      
// //       if (err.name === 'TimeoutError' || err.message.includes('timeout')) {
// //         toast.error("Request timeout. Server might be slow or offline.");
// //       } else if (err.message.includes("Unauthorized") || err.message.includes("401")) {
// //         toast.error("Session expired. Please login again.");
// //         localStorage.removeItem("admin-token");
// //         localStorage.removeItem("admin-user");
// //         router.push("/login");
// //       } else if (err.message.includes("NetworkError") || err.message.includes("Failed to fetch")) {
// //         toast.error("Cannot connect to server. Check your internet connection or ensure backend is running.");
// //         console.log("🌐 Current API URL:", getApiUrl());
// //       } else {
// //         toast.error(err.message || "Failed to load products");
// //       }
      
// //       // Set empty products on error
// //       setProducts([]);
// //     } finally {
// //       setLoading(false);
// //       setRefreshing(false);
// //     }
// //   };

// //   const handleDelete = async (id: string) => {
// //     const product = products.find((p) => p._id === id);
// //     if (!product) {
// //       toast.error("Product not found");
// //       return;
// //     }

// //     const token = getAuthToken();
// //     if (!token) {
// //       toast.error("You are not logged in!");
// //       router.push("/login");
// //       return;
// //     }

// //     try {
// //       console.log("🗑️ Deleting product:", id);
// //       const apiUrl = getApiUrl();
      
// //       const response = await fetch(`${apiUrl}/products/${id}`, {
// //         method: 'DELETE',
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         }
// //       });

// //       if (!response.ok) {
// //         const errorData = await response.json();
// //         throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
// //       }

// //       const data = await response.json();
// //       console.log("✅ Delete response:", data);
      
// //       setProducts((prev) => prev.filter((p) => p._id !== id));
// //       toast.success("Product deleted successfully!");
      
// //     } catch (err: any) {
// //       console.error("❌ Delete error:", err);
      
// //       if (err.message.includes("401") || err.message.includes("Unauthorized")) {
// //         toast.error("Session expired. Please login again.");
// //         localStorage.removeItem("admin-token");
// //         localStorage.removeItem("admin-user");
// //         router.push("/login");
// //       } else if (err.message.includes("404")) {
// //         toast.error("Product not found on server.");
// //         fetchProducts();
// //       } else {
// //         toast.error(err.message || "Failed to delete product");
// //       }
// //     }
// //   };

// //   const handleEdit = (id: string) => {
// //     router.push(`/products/edit/${id}`);
// //   };

// //   const handleView = (id: string) => {
// //     const product = products.find((p) => p._id === id);
// //     if (product) {
// //       setViewingProduct(product);
// //       setIsModalOpen(true);
// //     }
// //   };

// //   const handleToggleFeatured = async (id: string) => {
// //     try {
// //       const product = products.find((p) => p._id === id);
// //       if (!product) {
// //         toast.error("Product not found");
// //         return;
// //       }

// //       const token = getAuthToken();
// //       if (!token) {
// //         toast.error("You are not logged in!");
// //         router.push("/login");
// //         return;
// //       }

// //       const newFeaturedStatus = !product.featured;
// //       const apiUrl = getApiUrl();

// //       const response = await fetch(`${apiUrl}/products/${id}`, {
// //         method: 'PATCH',
// //         headers: {
// //           'Authorization': `Bearer ${token}`,
// //           'Content-Type': 'application/json'
// //         },
// //         body: JSON.stringify({ featured: newFeaturedStatus })
// //       });

// //       if (!response.ok) {
// //         throw new Error(`HTTP error! status: ${response.status}`);
// //       }

// //       setProducts((prev) =>
// //         prev.map((p) =>
// //           p._id === id ? { ...p, featured: newFeaturedStatus } : p
// //         )
// //       );

// //       toast.success(
// //         newFeaturedStatus
// //           ? "Product marked as featured!"
// //           : "Product removed from featured"
// //       );
// //     } catch (err: any) {
// //       console.error("Toggle featured error:", err);
// //       toast.error(err.message || "Failed to update product");
// //     }
// //   };

// //   const handleRefresh = () => {
// //     console.log("🔄 Refreshing products...");
// //     setRefreshing(true);
// //     fetchProducts();
// //   };

// //   const handleExportAll = () => {
// //     exportProductsToCSV(products);
// //     setShowExportMenu(false);
// //   };

// //   const handleExportFiltered = (filterType: string) => {
// //     exportFilteredProducts(products, filterType);
// //     setShowExportMenu(false);
// //   };

// //   if (loading) {
// //     return (
// //       <div className="flex min-h-screen bg-gray-50">
// //         <div className="flex-1 flex flex-col">
// //           <main className="p-4 sm:p-6 flex-1 overflow-auto flex items-center justify-center">
// //             <div className="text-center">
// //               <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
// //               <p className="text-gray-600 text-sm sm:text-base">Loading products...</p>
// //               <p className="text-gray-400 text-xs mt-2">Connecting to: {getApiBaseUrl()}</p>
// //             </div>
// //           </main>
// //         </div>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div className="flex min-h-screen bg-gray-50">
// //       <div className="flex-1 flex flex-col">
// //         <main className="p-3 sm:p-4 md:p-6 flex-1 overflow-auto">
// //           {/* Header Section - Responsive */}
// //           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
// //             <div className="w-full sm:w-auto">
// //               <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
// //                 Products Management
// //               </h1>
// //               <p className="text-gray-600 mt-1 text-sm sm:text-base">
// //                 Manage all your products in one place
// //               </p>
// //               <p className="text-gray-400 text-xs mt-1">
// //                 Backend: {getApiBaseUrl()}
// //               </p>
// //             </div>
// //             <div className="flex gap-2 w-full sm:w-auto">
// //               <button
// //                 onClick={handleRefresh}
// //                 disabled={refreshing}
// //                 className={`px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-lg hover:from-gray-200 hover:to-gray-300 font-medium shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none ${refreshing ? 'opacity-70 cursor-not-allowed' : ''}`}
// //               >
// //                 {refreshing ? (
// //                   <>
// //                     <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
// //                     <span className="hidden sm:inline">Refreshing...</span>
// //                     <span className="sm:hidden">Refresh</span>
// //                   </>
// //                 ) : (
// //                   <>
// //                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
// //                     </svg>
// //                     <span className="hidden sm:inline">Refresh</span>
// //                   </>
// //                 )}
// //               </button>
              
// //               {/* Export Button with Dropdown */}
// //               <div className="export-menu relative">
// //                 <button
// //                   onClick={() => setShowExportMenu(!showExportMenu)}
// //                   className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 font-medium shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none"
// //                 >
// //                   <Download className="w-4 h-4" />
// //                   <span className="hidden sm:inline">Export CSV</span>
// //                   <span className="sm:hidden">Export</span>
// //                 </button>
                
// //                 {showExportMenu && (
// //                   <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
// //                     <div className="p-2">
// //                       <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
// //                         Export Options
// //                       </div>
// //                       <button
// //                         onClick={handleExportAll}
// //                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
// //                       >
// //                         <FileDown className="w-4 h-4" />
// //                         <span>Export All Products ({products.length})</span>
// //                       </button>
// //                       <div className="border-t my-1"></div>
// //                       <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
// //                         Filtered Export
// //                       </div>
// //                       <button
// //                         onClick={() => handleExportFiltered('featured')}
// //                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
// //                       >
// //                         <TrendingUp className="w-4 h-4" />
// //                         <span>Featured Products ({products.filter(p => p.featured).length})</span>
// //                       </button>
// //                       <button
// //                         onClick={() => handleExportFiltered('best-selling')}
// //                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
// //                       >
// //                         <Package className="w-4 h-4" />
// //                         <span>Best Selling ({products.filter(p => p.isBestSelling).length})</span>
// //                       </button>
// //                       <button
// //                         onClick={() => handleExportFiltered('new')}
// //                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
// //                       >
// //                         <Sparkles className="w-4 h-4" />
// //                         <span>New Arrivals ({products.filter(p => p.isNew).length})</span>
// //                       </button>
// //                       <button
// //                         onClick={() => handleExportFiltered('low-stock')}
// //                         className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md"
// //                       >
// //                         <AlertTriangle className="w-4 h-4" />
// //                         <span>Low Stock ({products.filter(p => p.stockQuantity < 10).length})</span>
// //                       </button>
// //                     </div>
// //                   </div>
// //                 )}
// //               </div>
              
// //               <button
// //                 onClick={() => router.push("/products/add")}
// //                 className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 font-medium shadow-sm flex items-center justify-center gap-2 flex-1 sm:flex-none"
// //               >
// //                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
// //                 </svg>
// //                 <span className="hidden sm:inline">Add Product</span>
// //                 <span className="sm:hidden">Add</span>
// //               </button>
// //             </div>
// //           </div>

// //           {/* Stats Cards - Responsive Grid */}
// //           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
// //             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <p className="text-sm text-gray-500">Total Products</p>
// //                   <p className="text-2xl font-bold text-gray-900">{products.length}</p>
// //                 </div>
// //                 <div className="p-2 bg-amber-50 rounded-lg">
// //                   <Package className="w-6 h-6 text-amber-600" />
// //                 </div>
// //               </div>
// //             </div>
            
// //             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <p className="text-sm text-gray-500">Featured</p>
// //                   <p className="text-2xl font-bold text-gray-900">
// //                     {products.filter(p => p.featured).length}
// //                   </p>
// //                 </div>
// //                 <div className="p-2 bg-green-50 rounded-lg">
// //                   <TrendingUp className="w-6 h-6 text-green-600" />
// //                 </div>
// //               </div>
// //             </div>
            
// //             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <p className="text-sm text-gray-500">Low Stock</p>
// //                   <p className="text-2xl font-bold text-gray-900">
// //                     {products.filter(p => p.stockQuantity < 10).length}
// //                   </p>
// //                 </div>
// //                 <div className="p-2 bg-red-50 rounded-lg">
// //                   <AlertTriangle className="w-6 h-6 text-red-600" />
// //                 </div>
// //               </div>
// //             </div>
            
// //             <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
// //               <div className="flex items-center justify-between">
// //                 <div>
// //                   <p className="text-sm text-gray-500">New Arrivals</p>
// //                   <p className="text-2xl font-bold text-gray-900">
// //                     {products.filter(p => p.isNew).length}
// //                   </p>
// //                 </div>
// //                 <div className="p-2 bg-blue-50 rounded-lg">
// //                   <Sparkles className="w-6 h-6 text-blue-600" />
// //                 </div>
// //               </div>
// //             </div>
// //           </div>

// //           {/* Products Table - Wrapped in responsive container */}
// //           <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
// //             <AdminProductsTable
// //               products={products}
// //               onEdit={handleEdit}
// //               onDelete={handleDelete}
// //               onView={handleView}
// //               onToggleFeatured={handleToggleFeatured}
// //               onRefresh={handleRefresh}
// //               refreshing={refreshing}
// //             />
// //           </div>

// //           {/* Empty State */}
// //           {products.length === 0 && !loading && (
// //             <div className="text-center py-12">
// //               <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
// //                 <Package className="w-full h-full" />
// //               </div>
// //               <h3 className="text-lg font-semibold text-gray-900 mb-2">No Products Found</h3>
// //               <p className="text-gray-600 mb-2">Get started by adding your first product</p>
// //               <p className="text-gray-400 text-sm mb-6">
// //                 Backend: {getApiBaseUrl()}
// //               </p>
// //               <button
// //                 onClick={() => router.push("/products/add")}
// //                 className="px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-lg hover:from-amber-600 hover:to-amber-700 font-medium shadow-sm"
// //               >
// //                 + Add First Product
// //               </button>
// //             </div>
// //           )}

// //           <ProductViewModal
// //             product={viewingProduct}
// //             isOpen={isModalOpen}
// //             onClose={() => setIsModalOpen(false)}
// //           />
// //         </main>

// //         {/* Mobile Floating Action Button */}
// //         {isMobile && products.length > 0 && (
// //           <button
// //             onClick={() => router.push("/products/add")}
// //             className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow-lg flex items-center justify-center z-40"
// //           >
// //             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
// //               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
// //             </svg>
// //           </button>
// //         )}
// //       </div>
// //     </div>
// //   );
// // }



