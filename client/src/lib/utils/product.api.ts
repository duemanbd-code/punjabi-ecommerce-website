// client/src/utils/product.api.ts

import { Product } from "@/components/ProductCard";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Helper to validate if an object is a valid Product
const isValidProduct = (item: any): item is Product => {
  return (
    item &&
    typeof item === "object" &&
    "_id" in item &&
    "title" in item &&
    "imageUrl" in item &&
    "normalPrice" in item &&
    typeof item._id === "string" &&
    typeof item.title === "string" &&
    typeof item.normalPrice === "number"
  );
};

// Helper to normalize a product object (add missing required fields)
// Update the normalizeProduct function in product.api.ts
const normalizeProduct = (item: any): Product => {
  if (!item || typeof item !== "object") {
    console.warn("Invalid product data received:", item);
    throw new Error("Invalid product data");
  }

  return {
    _id: item._id || `unknown-${Date.now()}-${Math.random()}`,
    title: item.title || "Unknown Product",
    description: item.description || "",
    category: item.category || "Uncategorized",
    // Handle imageUrl - use salePrice from backend as offerPrice
    imageUrl: item.imageUrl || "/placeholder-product.png",
    normalPrice: typeof item.normalPrice === "number" ? item.normalPrice : 0,
    // Map backend fields to frontend fields
    originalPrice:
      typeof item.originalPrice === "number" ? item.originalPrice : undefined,
    offerPrice:
      typeof item.salePrice === "number"
        ? item.salePrice
        : typeof item.offerPrice === "number"
        ? item.offerPrice
        : undefined,
    discountPercentage:
      typeof item.discountPercentage === "number"
        ? item.discountPercentage
        : undefined,
    rating: typeof item.rating === "number" ? item.rating : undefined,
    reviewCount:
      typeof item.reviewCount === "number" ? item.reviewCount : undefined,
    isBestSelling: Boolean(item.isBestSelling),
    isNew: Boolean(item.isNew),
    featured: Boolean(item.featured),
    stock:
      typeof item.stock === "number"
        ? item.stock
        : typeof item.stockQuantity === "number"
        ? item.stockQuantity
        : undefined,
    brand: item.brand,
    shippingInfo: item.shippingInfo,
    additionalImages: Array.isArray(item.images)
      ? item.images
      : Array.isArray(item.additionalImages)
      ? item.additionalImages
      : [],
    createdAt: item.createdAt,
    sizes: Array.isArray(item.sizes) ? item.sizes : undefined,
    colors: Array.isArray(item.colors) ? item.colors : undefined,
  };
};

// Helper function to extract products from API response with validation
const extractProducts = (response: any): Product[] => {
  console.log("Extracting products from response:", response);

  let productsArray: any[] = [];

  // Check different possible response structures
  if (Array.isArray(response)) {
    productsArray = response;
  } else if (response && Array.isArray(response.data)) {
    productsArray = response.data;
  } else if (response && response.success && Array.isArray(response.products)) {
    productsArray = response.products;
  } else if (
    response &&
    response.products &&
    Array.isArray(response.products)
  ) {
    productsArray = response.products;
  } else if (response && response.data && Array.isArray(response.data.data)) {
    productsArray = response.data.data;
  } else if (
    response &&
    response.data &&
    Array.isArray(response.data.products)
  ) {
    productsArray = response.data.products;
  } else {
    console.warn("Unexpected API response structure:", response);
    return [];
  }

  // Filter and normalize products
  const validProducts: Product[] = [];

  for (const item of productsArray) {
    try {
      if (isValidProduct(item)) {
        validProducts.push(normalizeProduct(item));
      } else {
        console.warn("Invalid product object skipped:", item);

        // Try to salvage if it has at least _id and title
        if (item && item._id && item.title) {
          console.log("Attempting to salvage product:", item._id);
          validProducts.push(normalizeProduct(item));
        }
      }
    } catch (error) {
      console.error("Error normalizing product:", error, item);
    }
  }

  console.log(
    `Extracted ${validProducts.length} valid products out of ${productsArray.length}`
  );
  return validProducts;
};

export async function fetchAllProducts(): Promise<Product[]> {
  try {
    console.log(`Fetching all products from ${API_URL}/api/products`);
    const response = await axios.get(`${API_URL}/api/products`);

    // Log response for debugging
    console.log("All products API response:", {
      status: response.status,
      hasData: !!response.data,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      keys: response.data ? Object.keys(response.data) : [],
    });

    const products = extractProducts(response.data);
    console.log(`Successfully fetched ${products.length} products`);
    return products;
  } catch (error: any) {
    console.error("Error fetching products:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return [];
  }
}

export async function fetchBestSellingProducts(): Promise<Product[]> {
  try {
    const products = await fetchAllProducts();
    const bestSelling = products
      .filter((p) => p.isBestSelling || (p.rating && p.rating >= 4.5))
      .slice(0, 12);

    console.log(`Found ${bestSelling.length} best selling products`);
    return bestSelling;
  } catch (error) {
    console.error("Error fetching best selling products:", error);
    return [];
  }
}

export async function fetchNewArrivalsProducts(): Promise<Product[]> {
  try {
    const products = await fetchAllProducts();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get new flagged products
    const newProducts = products.filter((p) => p.isNew);

    // Get products created in last 30 days
    const recentProducts = products.filter((p) => {
      if (!p.createdAt) return false;
      try {
        const createdAt = new Date(p.createdAt);
        return createdAt > thirtyDaysAgo && !p.isNew;
      } catch {
        return false;
      }
    });

    // Combine and deduplicate
    const allNewArrivals = [...newProducts, ...recentProducts];
    const uniqueIds = new Set();
    const result = allNewArrivals
      .filter((p) => {
        if (uniqueIds.has(p._id)) return false;
        uniqueIds.add(p._id);
        return true;
      })
      .slice(0, 12);

    console.log(`Found ${result.length} new arrival products`);
    return result;
  } catch (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }
}

export async function fetchProductsByCategory(
  category: string
): Promise<Product[]> {
  try {
    console.log(`Fetching products for category: ${category}`);

    // First try the category endpoint directly
    try {
      const response = await axios.get(
        `${API_URL}/api/products/category/${encodeURIComponent(category)}`
      );
      console.log("Category endpoint response:", {
        status: response.status,
        hasData: !!response.data,
      });

      if (response.data) {
        const products = extractProducts(response.data);
        console.log(`Found ${products.length} products via category endpoint`);
        return products.slice(0, 8);
      }
    } catch (categoryError) {
      console.log(
        "Category endpoint failed, falling back to filtering:",
        categoryError
      );
    }

    // Fallback: fetch all and filter
    const products = await fetchAllProducts();
    const filtered = products
      .filter((p) => {
        if (!p.category) return false;
        return p.category.toLowerCase().includes(category.toLowerCase());
      })
      .slice(0, 8);

    console.log(
      `Found ${filtered.length} products for category "${category}" via filtering`
    );
    return filtered;
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | null> {
  // Validate ID first
  if (!id || typeof id !== "string" || id.trim() === "" || id === "undefined") {
    console.error("Invalid product ID:", id);
    return null;
  }

  try {
    console.log(`Fetching product ${id} from ${API_URL}/api/products/${id}`);

    const response = await axios.get(`${API_URL}/api/products/${id}`, {
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });

    console.log("Product API response status:", response.status);

    if (response.status === 404) {
      console.error(`Product ${id} not found (404)`);
      return null;
    }

    // Check if response.data exists
    if (!response.data) {
      console.error("Empty response from product API");
      return null;
    }

    // DEBUG: Log the actual response
    console.log("Raw API response for product:", {
      data: response.data,
      type: typeof response.data,
      isArray: Array.isArray(response.data),
      keys: Object.keys(response.data || {}),
    });

    // Handle different response structures
    let productData: any = null;

    // Check if it's the problematic partial object
    if (response.data && typeof response.data === "object") {
      const keys = Object.keys(response.data);

      // If it's the partial object (size, stock, _id only)
      if (
        keys.length === 3 &&
        keys.includes("size") &&
        keys.includes("stock") &&
        keys.includes("_id")
      ) {
        console.error("API returned partial object. This is a backend issue.");

        // Try to fetch from all products as fallback
        try {
          const allProducts = await fetchAllProducts();
          const fullProduct = allProducts.find((p) => p._id === id);

          if (fullProduct) {
            console.log("Found product via fallback method");
            return normalizeProduct(fullProduct);
          }
        } catch (fallbackError) {
          console.error("Fallback fetch failed:", fallbackError);
        }

        return null;
      }
    }

    // Normal extraction logic
    if (Array.isArray(response.data) && response.data.length > 0) {
      productData = response.data[0];
    } else if (response.data.product) {
      productData = response.data.product;
    } else if (response.data.data) {
      productData = response.data.data;
    } else if (response.data.result) {
      productData = response.data.result;
    } else {
      productData = response.data;
    }

    if (!productData) {
      console.warn("No product data found in response");
      return null;
    }

    // Final validation
    if (
      !productData._id ||
      !productData.title ||
      productData.normalPrice === undefined
    ) {
      console.warn("Invalid product data structure:", productData);
      return null;
    }

    const product = normalizeProduct(productData);
    console.log("Successfully fetched product:", product._id, product.title);
    return product;
  } catch (err: any) {
    console.error("Error fetching product by ID:", {
      message: err.message,
      response: err.response?.data,
      status: err.response?.status,
      url: `${API_URL}/api/products/${id}`,
    });

    // Fallback: try to get from all products
    if (err.response?.status !== 404) {
      try {
        console.log("Attempting fallback fetch for product:", id);
        const allProducts = await fetchAllProducts();
        const product = allProducts.find((p) => p._id === id);
        return product ? normalizeProduct(product) : null;
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        return null;
      }
    }

    return null;
  }
}

const productApi = {
  fetchAllProducts,
  fetchBestSellingProducts,
  fetchNewArrivalsProducts,
  fetchProductsByCategory,
  getProductById,
};

export default productApi;
