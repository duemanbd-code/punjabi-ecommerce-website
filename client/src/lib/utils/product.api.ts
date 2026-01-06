// client/src/utils/product.api.ts

import { Product } from "@/types/product.types";
import axios from "axios";

// IMPORTANT: This function must NOT use window in any way
const getApiBaseUrl = (): string => {
  // Always check environment variable first
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl) {
    // Ensure proper protocol
    if (envUrl.startsWith('http://') || envUrl.startsWith('https://')) {
      return envUrl;
    }
    
    // Add protocol if missing
    if (process.env.NODE_ENV === 'production') {
      return `https://${envUrl}`;
    } else {
      return `http://${envUrl}`;
    }
  }
  
  // Fallback based on NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return 'https://puti-client-production.onrender.com';
  }
  
  // Default to localhost for development
  return 'http://localhost:4000';
};

const API_BASE_URL = getApiBaseUrl();
console.log('API Configuration:', { 
  NODE_ENV: process.env.NODE_ENV,
  API_BASE_URL,
  hasEnvVar: !!process.env.NEXT_PUBLIC_API_URL
});

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
    imageUrl: item.imageUrl || "/placeholder-product.png",
    normalPrice: typeof item.normalPrice === "number" ? item.normalPrice : 0,
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
    tags: Array.isArray(item.tags) ? item.tags : [],
    keywords: Array.isArray(item.keywords) ? item.keywords : [],
    ...(item.metadata || {}),
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
  } else if (
    response &&
    response.result &&
    Array.isArray(response.result.products)
  ) {
    productsArray = response.result.products;
  } else if (response && Array.isArray(response.items)) {
    productsArray = response.items;
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

// Helper function to handle API errors consistently
const handleApiError = (error: any, context: string): never => {
  console.error(`Error in ${context}:`, {
    message: error.message,
    response: error.response?.data,
    status: error.response?.status,
    url: error.config?.url,
  });

  // Throw the error so components can handle it
  throw new Error(
    error.response?.data?.message ||
      error.message ||
      `Failed to ${context.replace("fetching", "fetch").toLowerCase()}`
  );
};

// Core API Functions
export async function fetchAllProducts(): Promise<Product[]> {
  try {
    console.log(`Fetching all products from ${API_BASE_URL}/api/products`);
    const response = await axios.get(`${API_BASE_URL}/api/products`, {
      timeout: 15000,
    });

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
    return handleApiError(error, "fetching all products");
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
  } catch (error: any) {
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
        `${API_BASE_URL}/api/products/category/${encodeURIComponent(category)}`,
        { timeout: 10000 }
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
  } catch (error: any) {
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
    console.log(`Fetching product ${id} from ${API_BASE_URL}/api/products/${id}`);

    const response = await axios.get(`${API_BASE_URL}/api/products/${id}`, {
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
      url: `${API_BASE_URL}/api/products/${id}`,
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

// NEW FUNCTIONS FOR COLLECTIONS
export async function fetchProductsForCollections(
  limit: number = 100
): Promise<Product[]> {
  try {
    console.log(
      `Fetching products for collections from ${API_BASE_URL}/api/products`
    );

    // Try to get all products with comprehensive data
    const response = await axios.get(`${API_BASE_URL}/api/products`, {
      params: {
        limit,
        populate: "category,brand",
        fields: "title,description,category,imageUrl,normalPrice,offerPrice,rating,isBestSelling,isNew,stock,brand,createdAt,sizes,colors,tags,keywords",
      },
      timeout: 15000,
    });

    const products = extractProducts(response.data);
    console.log(
      `Successfully fetched ${products.length} products for collections`
    );
    return products;
  } catch (error: any) {
    console.error("Error fetching products for collections:", error);
    // Fallback to regular fetch
    return fetchAllProducts();
  }
}

export async function searchProducts(query: string): Promise<Product[]> {
  if (!query || query.trim() === "") {
    return fetchAllProducts();
  }

  try {
    console.log(`Searching products for: "${query}"`);

    // First try search endpoint
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/search`, {
        params: { q: query },
        timeout: 10000,
      });

      const products = extractProducts(response.data);
      console.log(
        `Found ${products.length} products via search API for query: "${query}"`
      );
      return products;
    } catch (searchError) {
      console.log("Search endpoint failed, using regular endpoint:", searchError);
    }

    // Fallback: fetch all and filter
    const allProducts = await fetchAllProducts();
    const queryLower = query.toLowerCase();
    
    const filtered = allProducts.filter((product) => {
      const searchableFields = [
        product.title || "",
        product.description || "",
        product.category || "",
        product.brand || "",
        ...(product.tags || []),
        ...(product.keywords || []),
      ];

      return searchableFields.some((field) =>
        field.toLowerCase().includes(queryLower)
      );
    });

    console.log(
      `Found ${filtered.length} products via client-side search for query: "${query}"`
    );
    return filtered;
  } catch (error: any) {
    console.error("Error searching products:", error);
    return [];
  }
}

export async function fetchProductCategories(): Promise<string[]> {
  try {
    console.log(`Fetching categories from ${API_BASE_URL}/api/products/categories`);

    // Try dedicated categories endpoint
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/categories`, {
        timeout: 5000,
      });

      if (response.data && Array.isArray(response.data)) {
        const categories = response.data.filter(
          (cat: any) => cat && typeof cat === "string"
        );
        console.log(`Found ${categories.length} categories via API`);
        return categories;
      }
    } catch (categoryError) {
      console.log(
        "Categories endpoint failed, extracting from products:",
        categoryError
      );
    }

    // Fallback: extract categories from products
    const products = await fetchAllProducts();
    const categories = new Set<string>();

    products.forEach((product) => {
      if (product.category && typeof product.category === "string") {
        const trimmedCategory = product.category.trim();
        if (trimmedCategory) {
          categories.add(trimmedCategory);
        }
      }
    });

    const categoryArray = Array.from(categories);
    console.log(`Extracted ${categoryArray.length} categories from products`);
    return categoryArray;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const products = await fetchAllProducts();
    const featured = products
      .filter((p) => p.featured || p.isBestSelling || p.isNew)
      .sort((a, b) => {
        // Sort by: featured > best selling > new > rating
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        if (a.isBestSelling && !b.isBestSelling) return -1;
        if (!a.isBestSelling && b.isBestSelling) return 1;
        if (a.isNew && !b.isNew) return -1;
        if (!a.isNew && b.isNew) return 1;
        return (b.rating || 0) - (a.rating || 0);
      })
      .slice(0, 8);

    console.log(`Found ${featured.length} featured products`);
    return featured;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export async function fetchProductsWithFilters(filters: {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: string;
  limit?: number;
}): Promise<Product[]> {
  try {
    console.log(`Fetching products with filters:`, filters);

    const params: any = {};
    if (filters.category && filters.category !== "all") {
      params.category = filters.category;
    }
    if (filters.minPrice !== undefined) {
      params.minPrice = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      params.maxPrice = filters.maxPrice;
    }
    if (filters.minRating !== undefined) {
      params.minRating = filters.minRating;
    }
    if (filters.sortBy) {
      params.sortBy = filters.sortBy;
    }
    if (filters.limit) {
      params.limit = filters.limit;
    }

    // Try filtered endpoint
    try {
      const response = await axios.get(`${API_BASE_URL}/api/products/filter`, {
        params,
        timeout: 10000,
      });

      const products = extractProducts(response.data);
      console.log(
        `Found ${products.length} products via filter API with params:`,
        params
      );
      return products;
    } catch (filterError) {
      console.log("Filter endpoint failed, filtering client-side:", filterError);
    }

    // Fallback: fetch all and filter client-side
    const allProducts = await fetchAllProducts();
    let filtered = [...allProducts];

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter(
        (p) => p.category?.toLowerCase() === filters.category?.toLowerCase()
      );
    }

    if (filters.minPrice !== undefined) {
      filtered = filtered.filter((p) => p.normalPrice >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      filtered = filtered.filter((p) => p.normalPrice <= filters.maxPrice!);
    }

    if (filters.minRating !== undefined) {
      filtered = filtered.filter((p) => (p.rating || 0) >= filters.minRating!);
    }

    // Apply sorting
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case "price-low":
          filtered.sort((a, b) => a.normalPrice - b.normalPrice);
          break;
        case "price-high":
          filtered.sort((a, b) => b.normalPrice - a.normalPrice);
          break;
        case "rating":
          filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
          break;
        case "newest":
          filtered.sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          });
          break;
        case "featured":
          filtered.sort((a, b) => {
            if (a.featured && !b.featured) return -1;
            if (!a.featured && b.featured) return 1;
            if (a.isBestSelling && !b.isBestSelling) return -1;
            if (!a.isBestSelling && b.isBestSelling) return 1;
            return (b.rating || 0) - (a.rating || 0);
          });
          break;
      }
    }

    if (filters.limit) {
      filtered = filtered.slice(0, filters.limit);
    }

    console.log(
      `Found ${filtered.length} products via client-side filtering`
    );
    return filtered;
  } catch (error) {
    console.error("Error fetching products with filters:", error);
    return [];
  }
}

export async function fetchProductsByBrand(brand: string): Promise<Product[]> {
  try {
    console.log(`Fetching products for brand: ${brand}`);

    // Try brand endpoint
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/products/brand/${encodeURIComponent(brand)}`,
        { timeout: 10000 }
      );

      const products = extractProducts(response.data);
      console.log(`Found ${products.length} products for brand "${brand}"`);
      return products;
    } catch (brandError) {
      console.log("Brand endpoint failed, filtering client-side:", brandError);
    }

    // Fallback: fetch all and filter
    const allProducts = await fetchAllProducts();
    const filtered = allProducts.filter(
      (p) => p.brand?.toLowerCase() === brand.toLowerCase()
    );

    console.log(
      `Found ${filtered.length} products for brand "${brand}" via filtering`
    );
    return filtered;
  } catch (error) {
    console.error("Error fetching products by brand:", error);
    return [];
  }
}

export async function fetchDiscountedProducts(): Promise<Product[]> {
  try {
    const products = await fetchAllProducts();
    const discounted = products
      .filter((p) => p.offerPrice && p.offerPrice < p.normalPrice)
      .sort((a, b) => {
        const discountA =
          ((a.normalPrice - (a.offerPrice || a.normalPrice)) / a.normalPrice) *
          100;
        const discountB =
          ((b.normalPrice - (b.offerPrice || b.normalPrice)) / b.normalPrice) *
          100;
        return discountB - discountA; // Highest discount first
      })
      .slice(0, 12);

    console.log(`Found ${discounted.length} discounted products`);
    return discounted;
  } catch (error) {
    console.error("Error fetching discounted products:", error);
    return [];
  }
}

export async function fetchProductsByTags(tags: string[]): Promise<Product[]> {
  try {
    const products = await fetchAllProducts();
    const filtered = products.filter((p) => {
      if (!p.tags || !Array.isArray(p.tags)) return false;
      return tags.some((tag) =>
        p.tags!.some((productTag) =>
          productTag.toLowerCase().includes(tag.toLowerCase())
        )
      );
    });

    console.log(`Found ${filtered.length} products with tags:`, tags);
    return filtered;
  } catch (error) {
    console.error("Error fetching products by tags:", error);
    return [];
  }
}

// Statistics functions
export async function getProductStatistics(): Promise<{
  totalProducts: number;
  categories: number;
  bestSellers: number;
  newArrivals: number;
  averageRating: number;
  outOfStock: number;
}> {
  try {
    const products = await fetchAllProducts();

    const uniqueCategories = new Set<string>();
    let outOfStockCount = 0;
    let totalRating = 0;
    let ratedProducts = 0;

    products.forEach((product) => {
      if (product.category) {
        uniqueCategories.add(product.category);
      }
      if (product.stock !== undefined && product.stock <= 0) {
        outOfStockCount++;
      }
      if (product.rating) {
        totalRating += product.rating;
        ratedProducts++;
      }
    });

    const stats = {
      totalProducts: products.length,
      categories: uniqueCategories.size,
      bestSellers: products.filter((p) => p.isBestSelling).length,
      newArrivals: products.filter((p) => p.isNew).length,
      averageRating: ratedProducts > 0 ? totalRating / ratedProducts : 0,
      outOfStock: outOfStockCount,
    };

    console.log("Product statistics:", stats);
    return stats;
  } catch (error) {
    console.error("Error calculating product statistics:", error);
    return {
      totalProducts: 0,
      categories: 0,
      bestSellers: 0,
      newArrivals: 0,
      averageRating: 0,
      outOfStock: 0,
    };
  }
}

const productApi = {
  // Core functions
  fetchAllProducts,
  fetchBestSellingProducts,
  fetchNewArrivalsProducts,
  fetchProductsByCategory,
  getProductById,
  
  // Collections functions
  fetchProductsForCollections,
  searchProducts,
  fetchProductCategories,
  fetchFeaturedProducts,
  fetchProductsWithFilters,
  fetchProductsByBrand,
  fetchDiscountedProducts,
  fetchProductsByTags,
  
  // Statistics
  getProductStatistics,
};

export default productApi;



// // client/src/utils/product.api.ts

// import { Product } from "@/types/product.types";
// import axios from "axios";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
// // const API_URL = process.env.NEXT_PUBLIC_API_URL;


// // Helper to validate if an object is a valid Product
// const isValidProduct = (item: any): item is Product => {
//   return (
//     item &&
//     typeof item === "object" &&
//     "_id" in item &&
//     "title" in item &&
//     "imageUrl" in item &&
//     "normalPrice" in item &&
//     typeof item._id === "string" &&
//     typeof item.title === "string" &&
//     typeof item.normalPrice === "number"
//   );
// };

// // Helper to normalize a product object (add missing required fields)
// const normalizeProduct = (item: any): Product => {
//   if (!item || typeof item !== "object") {
//     console.warn("Invalid product data received:", item);
//     throw new Error("Invalid product data");
//   }

//   return {
//     _id: item._id || `unknown-${Date.now()}-${Math.random()}`,
//     title: item.title || "Unknown Product",
//     description: item.description || "",
//     category: item.category || "Uncategorized",
//     // Handle imageUrl - use salePrice from backend as offerPrice
//     imageUrl: item.imageUrl || "/placeholder-product.png",
//     normalPrice: typeof item.normalPrice === "number" ? item.normalPrice : 0,
//     // Map backend fields to frontend fields
//     originalPrice:
//       typeof item.originalPrice === "number" ? item.originalPrice : undefined,
//     offerPrice:
//       typeof item.salePrice === "number"
//         ? item.salePrice
//         : typeof item.offerPrice === "number"
//         ? item.offerPrice
//         : undefined,
//     discountPercentage:
//       typeof item.discountPercentage === "number"
//         ? item.discountPercentage
//         : undefined,
//     rating: typeof item.rating === "number" ? item.rating : undefined,
//     reviewCount:
//       typeof item.reviewCount === "number" ? item.reviewCount : undefined,
//     isBestSelling: Boolean(item.isBestSelling),
//     isNew: Boolean(item.isNew),
//     featured: Boolean(item.featured),
//     stock:
//       typeof item.stock === "number"
//         ? item.stock
//         : typeof item.stockQuantity === "number"
//         ? item.stockQuantity
//         : undefined,
//     brand: item.brand,
//     shippingInfo: item.shippingInfo,
//     additionalImages: Array.isArray(item.images)
//       ? item.images
//       : Array.isArray(item.additionalImages)
//       ? item.additionalImages
//       : [],
//     createdAt: item.createdAt,
//     sizes: Array.isArray(item.sizes) ? item.sizes : undefined,
//     colors: Array.isArray(item.colors) ? item.colors : undefined,
//     tags: Array.isArray(item.tags) ? item.tags : [],
//     keywords: Array.isArray(item.keywords) ? item.keywords : [],
//     // Add any other fields that might be needed
//     ...(item.metadata || {}),
//   };
// };

// // Helper function to extract products from API response with validation
// const extractProducts = (response: any): Product[] => {
//   console.log("Extracting products from response:", response);

//   let productsArray: any[] = [];

//   // Check different possible response structures
//   if (Array.isArray(response)) {
//     productsArray = response;
//   } else if (response && Array.isArray(response.data)) {
//     productsArray = response.data;
//   } else if (response && response.success && Array.isArray(response.products)) {
//     productsArray = response.products;
//   } else if (
//     response &&
//     response.products &&
//     Array.isArray(response.products)
//   ) {
//     productsArray = response.products;
//   } else if (response && response.data && Array.isArray(response.data.data)) {
//     productsArray = response.data.data;
//   } else if (
//     response &&
//     response.data &&
//     Array.isArray(response.data.products)
//   ) {
//     productsArray = response.data.products;
//   } else if (
//     response &&
//     response.result &&
//     Array.isArray(response.result.products)
//   ) {
//     productsArray = response.result.products;
//   } else if (response && Array.isArray(response.items)) {
//     productsArray = response.items;
//   } else {
//     console.warn("Unexpected API response structure:", response);
//     return [];
//   }

//   // Filter and normalize products
//   const validProducts: Product[] = [];

//   for (const item of productsArray) {
//     try {
//       if (isValidProduct(item)) {
//         validProducts.push(normalizeProduct(item));
//       } else {
//         console.warn("Invalid product object skipped:", item);

//         // Try to salvage if it has at least _id and title
//         if (item && item._id && item.title) {
//           console.log("Attempting to salvage product:", item._id);
//           validProducts.push(normalizeProduct(item));
//         }
//       }
//     } catch (error) {
//       console.error("Error normalizing product:", error, item);
//     }
//   }

//   console.log(
//     `Extracted ${validProducts.length} valid products out of ${productsArray.length}`
//   );
//   return validProducts;
// };

// // Helper function to handle API errors consistently
// const handleApiError = (error: any, context: string): never => {
//   console.error(`Error in ${context}:`, {
//     message: error.message,
//     response: error.response?.data,
//     status: error.response?.status,
//     url: error.config?.url,
//   });

//   // Throw the error so components can handle it
//   throw new Error(
//     error.response?.data?.message ||
//       error.message ||
//       `Failed to ${context.replace("fetching", "fetch").toLowerCase()}`
//   );
// };

// // Core API Functions
// export async function fetchAllProducts(): Promise<Product[]> {
//   try {
//     console.log(`Fetching all products from ${API_URL}/api/products`);
//     const response = await axios.get(`${API_URL}/api/products`, {
//       timeout: 15000,
//     });

//     // Log response for debugging
//     console.log("All products API response:", {
//       status: response.status,
//       hasData: !!response.data,
//       dataType: typeof response.data,
//       isArray: Array.isArray(response.data),
//       keys: response.data ? Object.keys(response.data) : [],
//     });

//     const products = extractProducts(response.data);
//     console.log(`Successfully fetched ${products.length} products`);
//     return products;
//   } catch (error: any) {
//     return handleApiError(error, "fetching all products");
//   }
// }

// export async function fetchBestSellingProducts(): Promise<Product[]> {
//   try {
//     const products = await fetchAllProducts();
//     const bestSelling = products
//       .filter((p) => p.isBestSelling || (p.rating && p.rating >= 4.5))
//       .slice(0, 12);

//     console.log(`Found ${bestSelling.length} best selling products`);
//     return bestSelling;
//   } catch (error: any) {
//     console.error("Error fetching best selling products:", error);
//     return [];
//   }
// }

// export async function fetchNewArrivalsProducts(): Promise<Product[]> {
//   try {
//     const products = await fetchAllProducts();
//     const thirtyDaysAgo = new Date();
//     thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

//     // Get new flagged products
//     const newProducts = products.filter((p) => p.isNew);

//     // Get products created in last 30 days
//     const recentProducts = products.filter((p) => {
//       if (!p.createdAt) return false;
//       try {
//         const createdAt = new Date(p.createdAt);
//         return createdAt > thirtyDaysAgo && !p.isNew;
//       } catch {
//         return false;
//       }
//     });

//     // Combine and deduplicate
//     const allNewArrivals = [...newProducts, ...recentProducts];
//     const uniqueIds = new Set();
//     const result = allNewArrivals
//       .filter((p) => {
//         if (uniqueIds.has(p._id)) return false;
//         uniqueIds.add(p._id);
//         return true;
//       })
//       .slice(0, 12);

//     console.log(`Found ${result.length} new arrival products`);
//     return result;
//   } catch (error) {
//     console.error("Error fetching new arrivals:", error);
//     return [];
//   }
// }

// export async function fetchProductsByCategory(
//   category: string
// ): Promise<Product[]> {
//   try {
//     console.log(`Fetching products for category: ${category}`);

//     // First try the category endpoint directly
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/products/category/${encodeURIComponent(category)}`,
//         { timeout: 10000 }
//       );
//       console.log("Category endpoint response:", {
//         status: response.status,
//         hasData: !!response.data,
//       });

//       if (response.data) {
//         const products = extractProducts(response.data);
//         console.log(`Found ${products.length} products via category endpoint`);
//         return products.slice(0, 8);
//       }
//     } catch (categoryError) {
//       console.log(
//         "Category endpoint failed, falling back to filtering:",
//         categoryError
//       );
//     }

//     // Fallback: fetch all and filter
//     const products = await fetchAllProducts();
//     const filtered = products
//       .filter((p) => {
//         if (!p.category) return false;
//         return p.category.toLowerCase().includes(category.toLowerCase());
//       })
//       .slice(0, 8);

//     console.log(
//       `Found ${filtered.length} products for category "${category}" via filtering`
//     );
//     return filtered;
//   } catch (error: any) {
//     console.error("Error fetching products by category:", error);
//     return [];
//   }
// }

// export async function getProductById(id: string): Promise<Product | null> {
//   // Validate ID first
//   if (!id || typeof id !== "string" || id.trim() === "" || id === "undefined") {
//     console.error("Invalid product ID:", id);
//     return null;
//   }

//   try {
//     console.log(`Fetching product ${id} from ${API_URL}/api/products/${id}`);

//     const response = await axios.get(`${API_URL}/api/products/${id}`, {
//       timeout: 10000,
//       validateStatus: (status) => status < 500,
//     });

//     console.log("Product API response status:", response.status);

//     if (response.status === 404) {
//       console.error(`Product ${id} not found (404)`);
//       return null;
//     }

//     // Check if response.data exists
//     if (!response.data) {
//       console.error("Empty response from product API");
//       return null;
//     }

//     // DEBUG: Log the actual response
//     console.log("Raw API response for product:", {
//       data: response.data,
//       type: typeof response.data,
//       isArray: Array.isArray(response.data),
//       keys: Object.keys(response.data || {}),
//     });

//     // Handle different response structures
//     let productData: any = null;

//     // Check if it's the problematic partial object
//     if (response.data && typeof response.data === "object") {
//       const keys = Object.keys(response.data);

//       // If it's the partial object (size, stock, _id only)
//       if (
//         keys.length === 3 &&
//         keys.includes("size") &&
//         keys.includes("stock") &&
//         keys.includes("_id")
//       ) {
//         console.error("API returned partial object. This is a backend issue.");

//         // Try to fetch from all products as fallback
//         try {
//           const allProducts = await fetchAllProducts();
//           const fullProduct = allProducts.find((p) => p._id === id);

//           if (fullProduct) {
//             console.log("Found product via fallback method");
//             return normalizeProduct(fullProduct);
//           }
//         } catch (fallbackError) {
//           console.error("Fallback fetch failed:", fallbackError);
//         }

//         return null;
//       }
//     }

//     // Normal extraction logic
//     if (Array.isArray(response.data) && response.data.length > 0) {
//       productData = response.data[0];
//     } else if (response.data.product) {
//       productData = response.data.product;
//     } else if (response.data.data) {
//       productData = response.data.data;
//     } else if (response.data.result) {
//       productData = response.data.result;
//     } else {
//       productData = response.data;
//     }

//     if (!productData) {
//       console.warn("No product data found in response");
//       return null;
//     }

//     // Final validation
//     if (
//       !productData._id ||
//       !productData.title ||
//       productData.normalPrice === undefined
//     ) {
//       console.warn("Invalid product data structure:", productData);
//       return null;
//     }

//     const product = normalizeProduct(productData);
//     console.log("Successfully fetched product:", product._id, product.title);
//     return product;
//   } catch (err: any) {
//     console.error("Error fetching product by ID:", {
//       message: err.message,
//       response: err.response?.data,
//       status: err.response?.status,
//       url: `${API_URL}/api/products/${id}`,
//     });

//     // Fallback: try to get from all products
//     if (err.response?.status !== 404) {
//       try {
//         console.log("Attempting fallback fetch for product:", id);
//         const allProducts = await fetchAllProducts();
//         const product = allProducts.find((p) => p._id === id);
//         return product ? normalizeProduct(product) : null;
//       } catch (fallbackError) {
//         console.error("Fallback also failed:", fallbackError);
//         return null;
//       }
//     }

//     return null;
//   }
// }

// // NEW FUNCTIONS FOR COLLECTIONS

// export async function fetchProductsForCollections(
//   limit: number = 100
// ): Promise<Product[]> {
//   try {
//     console.log(
//       `Fetching products for collections from ${API_URL}/api/products`
//     );

//     // Try to get all products with comprehensive data
//     const response = await axios.get(`${API_URL}/api/products`, {
//       params: {
//         limit,
//         populate: "category,brand",
//         fields: "title,description,category,imageUrl,normalPrice,offerPrice,rating,isBestSelling,isNew,stock,brand,createdAt,sizes,colors,tags,keywords",
//       },
//       timeout: 15000,
//     });

//     const products = extractProducts(response.data);
//     console.log(
//       `Successfully fetched ${products.length} products for collections`
//     );
//     return products;
//   } catch (error: any) {
//     console.error("Error fetching products for collections:", error);
//     // Fallback to regular fetch
//     return fetchAllProducts();
//   }
// }

// export async function searchProducts(query: string): Promise<Product[]> {
//   if (!query || query.trim() === "") {
//     return fetchAllProducts();
//   }

//   try {
//     console.log(`Searching products for: "${query}"`);

//     // First try search endpoint
//     try {
//       const response = await axios.get(`${API_URL}/api/products/search`, {
//         params: { q: query },
//         timeout: 10000,
//       });

//       const products = extractProducts(response.data);
//       console.log(
//         `Found ${products.length} products via search API for query: "${query}"`
//       );
//       return products;
//     } catch (searchError) {
//       console.log("Search endpoint failed, using regular endpoint:", searchError);
//     }

//     // Fallback: fetch all and filter
//     const allProducts = await fetchAllProducts();
//     const queryLower = query.toLowerCase();
    
//     const filtered = allProducts.filter((product) => {
//       const searchableFields = [
//         product.title || "",
//         product.description || "",
//         product.category || "",
//         product.brand || "",
//         ...(product.tags || []),
//         ...(product.keywords || []),
//       ];

//       return searchableFields.some((field) =>
//         field.toLowerCase().includes(queryLower)
//       );
//     });

//     console.log(
//       `Found ${filtered.length} products via client-side search for query: "${query}"`
//     );
//     return filtered;
//   } catch (error: any) {
//     console.error("Error searching products:", error);
//     return [];
//   }
// }

// export async function fetchProductCategories(): Promise<string[]> {
//   try {
//     console.log(`Fetching categories from ${API_URL}/api/products/categories`);

//     // Try dedicated categories endpoint
//     try {
//       const response = await axios.get(`${API_URL}/api/products/categories`, {
//         timeout: 5000,
//       });

//       if (response.data && Array.isArray(response.data)) {
//         const categories = response.data.filter(
//           (cat: any) => cat && typeof cat === "string"
//         );
//         console.log(`Found ${categories.length} categories via API`);
//         return categories;
//       }
//     } catch (categoryError) {
//       console.log(
//         "Categories endpoint failed, extracting from products:",
//         categoryError
//       );
//     }

//     // Fallback: extract categories from products
//     const products = await fetchAllProducts();
//     const categories = new Set<string>();

//     products.forEach((product) => {
//       if (product.category && typeof product.category === "string") {
//         const trimmedCategory = product.category.trim();
//         if (trimmedCategory) {
//           categories.add(trimmedCategory);
//         }
//       }
//     });

//     const categoryArray = Array.from(categories);
//     console.log(`Extracted ${categoryArray.length} categories from products`);
//     return categoryArray;
//   } catch (error) {
//     console.error("Error fetching categories:", error);
//     return [];
//   }
// }

// export async function fetchFeaturedProducts(): Promise<Product[]> {
//   try {
//     const products = await fetchAllProducts();
//     const featured = products
//       .filter((p) => p.featured || p.isBestSelling || p.isNew)
//       .sort((a, b) => {
//         // Sort by: featured > best selling > new > rating
//         if (a.featured && !b.featured) return -1;
//         if (!a.featured && b.featured) return 1;
//         if (a.isBestSelling && !b.isBestSelling) return -1;
//         if (!a.isBestSelling && b.isBestSelling) return 1;
//         if (a.isNew && !b.isNew) return -1;
//         if (!a.isNew && b.isNew) return 1;
//         return (b.rating || 0) - (a.rating || 0);
//       })
//       .slice(0, 8);

//     console.log(`Found ${featured.length} featured products`);
//     return featured;
//   } catch (error) {
//     console.error("Error fetching featured products:", error);
//     return [];
//   }
// }

// export async function fetchProductsWithFilters(filters: {
//   category?: string;
//   minPrice?: number;
//   maxPrice?: number;
//   minRating?: number;
//   sortBy?: string;
//   limit?: number;
// }): Promise<Product[]> {
//   try {
//     console.log(`Fetching products with filters:`, filters);

//     const params: any = {};
//     if (filters.category && filters.category !== "all") {
//       params.category = filters.category;
//     }
//     if (filters.minPrice !== undefined) {
//       params.minPrice = filters.minPrice;
//     }
//     if (filters.maxPrice !== undefined) {
//       params.maxPrice = filters.maxPrice;
//     }
//     if (filters.minRating !== undefined) {
//       params.minRating = filters.minRating;
//     }
//     if (filters.sortBy) {
//       params.sortBy = filters.sortBy;
//     }
//     if (filters.limit) {
//       params.limit = filters.limit;
//     }

//     // Try filtered endpoint
//     try {
//       const response = await axios.get(`${API_URL}/api/products/filter`, {
//         params,
//         timeout: 10000,
//       });

//       const products = extractProducts(response.data);
//       console.log(
//         `Found ${products.length} products via filter API with params:`,
//         params
//       );
//       return products;
//     } catch (filterError) {
//       console.log("Filter endpoint failed, filtering client-side:", filterError);
//     }

//     // Fallback: fetch all and filter client-side
//     const allProducts = await fetchAllProducts();
//     let filtered = [...allProducts];

//     if (filters.category && filters.category !== "all") {
//       filtered = filtered.filter(
//         (p) => p.category?.toLowerCase() === filters.category?.toLowerCase()
//       );
//     }

//     if (filters.minPrice !== undefined) {
//       filtered = filtered.filter((p) => p.normalPrice >= filters.minPrice!);
//     }

//     if (filters.maxPrice !== undefined) {
//       filtered = filtered.filter((p) => p.normalPrice <= filters.maxPrice!);
//     }

//     if (filters.minRating !== undefined) {
//       filtered = filtered.filter((p) => (p.rating || 0) >= filters.minRating!);
//     }

//     // Apply sorting
//     if (filters.sortBy) {
//       switch (filters.sortBy) {
//         case "price-low":
//           filtered.sort((a, b) => a.normalPrice - b.normalPrice);
//           break;
//         case "price-high":
//           filtered.sort((a, b) => b.normalPrice - a.normalPrice);
//           break;
//         case "rating":
//           filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
//           break;
//         case "newest":
//           filtered.sort((a, b) => {
//             const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
//             const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
//             return dateB - dateA;
//           });
//           break;
//         case "featured":
//           filtered.sort((a, b) => {
//             if (a.featured && !b.featured) return -1;
//             if (!a.featured && b.featured) return 1;
//             if (a.isBestSelling && !b.isBestSelling) return -1;
//             if (!a.isBestSelling && b.isBestSelling) return 1;
//             return (b.rating || 0) - (a.rating || 0);
//           });
//           break;
//       }
//     }

//     if (filters.limit) {
//       filtered = filtered.slice(0, filters.limit);
//     }

//     console.log(
//       `Found ${filtered.length} products via client-side filtering`
//     );
//     return filtered;
//   } catch (error) {
//     console.error("Error fetching products with filters:", error);
//     return [];
//   }
// }

// export async function fetchProductsByBrand(brand: string): Promise<Product[]> {
//   try {
//     console.log(`Fetching products for brand: ${brand}`);

//     // Try brand endpoint
//     try {
//       const response = await axios.get(
//         `${API_URL}/api/products/brand/${encodeURIComponent(brand)}`,
//         { timeout: 10000 }
//       );

//       const products = extractProducts(response.data);
//       console.log(`Found ${products.length} products for brand "${brand}"`);
//       return products;
//     } catch (brandError) {
//       console.log("Brand endpoint failed, filtering client-side:", brandError);
//     }

//     // Fallback: fetch all and filter
//     const allProducts = await fetchAllProducts();
//     const filtered = allProducts.filter(
//       (p) => p.brand?.toLowerCase() === brand.toLowerCase()
//     );

//     console.log(
//       `Found ${filtered.length} products for brand "${brand}" via filtering`
//     );
//     return filtered;
//   } catch (error) {
//     console.error("Error fetching products by brand:", error);
//     return [];
//   }
// }

// export async function fetchDiscountedProducts(): Promise<Product[]> {
//   try {
//     const products = await fetchAllProducts();
//     const discounted = products
//       .filter((p) => p.offerPrice && p.offerPrice < p.normalPrice)
//       .sort((a, b) => {
//         const discountA =
//           ((a.normalPrice - (a.offerPrice || a.normalPrice)) / a.normalPrice) *
//           100;
//         const discountB =
//           ((b.normalPrice - (b.offerPrice || b.normalPrice)) / b.normalPrice) *
//           100;
//         return discountB - discountA; // Highest discount first
//       })
//       .slice(0, 12);

//     console.log(`Found ${discounted.length} discounted products`);
//     return discounted;
//   } catch (error) {
//     console.error("Error fetching discounted products:", error);
//     return [];
//   }
// }

// export async function fetchProductsByTags(tags: string[]): Promise<Product[]> {
//   try {
//     const products = await fetchAllProducts();
//     const filtered = products.filter((p) => {
//       if (!p.tags || !Array.isArray(p.tags)) return false;
//       return tags.some((tag) =>
//         p.tags!.some((productTag) =>
//           productTag.toLowerCase().includes(tag.toLowerCase())
//         )
//       );
//     });

//     console.log(`Found ${filtered.length} products with tags:`, tags);
//     return filtered;
//   } catch (error) {
//     console.error("Error fetching products by tags:", error);
//     return [];
//   }
// }

// // Statistics functions
// export async function getProductStatistics(): Promise<{
//   totalProducts: number;
//   categories: number;
//   bestSellers: number;
//   newArrivals: number;
//   averageRating: number;
//   outOfStock: number;
// }> {
//   try {
//     const products = await fetchAllProducts();

//     const uniqueCategories = new Set<string>();
//     let outOfStockCount = 0;
//     let totalRating = 0;
//     let ratedProducts = 0;

//     products.forEach((product) => {
//       if (product.category) {
//         uniqueCategories.add(product.category);
//       }
//       if (product.stock !== undefined && product.stock <= 0) {
//         outOfStockCount++;
//       }
//       if (product.rating) {
//         totalRating += product.rating;
//         ratedProducts++;
//       }
//     });

//     const stats = {
//       totalProducts: products.length,
//       categories: uniqueCategories.size,
//       bestSellers: products.filter((p) => p.isBestSelling).length,
//       newArrivals: products.filter((p) => p.isNew).length,
//       averageRating: ratedProducts > 0 ? totalRating / ratedProducts : 0,
//       outOfStock: outOfStockCount,
//     };

//     console.log("Product statistics:", stats);
//     return stats;
//   } catch (error) {
//     console.error("Error calculating product statistics:", error);
//     return {
//       totalProducts: 0,
//       categories: 0,
//       bestSellers: 0,
//       newArrivals: 0,
//       averageRating: 0,
//       outOfStock: 0,
//     };
//   }
// }

// const productApi = {
//   // Core functions
//   fetchAllProducts,
//   fetchBestSellingProducts,
//   fetchNewArrivalsProducts,
//   fetchProductsByCategory,
//   getProductById,
  
//   // Collections functions
//   fetchProductsForCollections,
//   searchProducts,
//   fetchProductCategories,
//   fetchFeaturedProducts,
//   fetchProductsWithFilters,
//   fetchProductsByBrand,
//   fetchDiscountedProducts,
//   fetchProductsByTags,
  
//   // Statistics
//   getProductStatistics,
// };

// export default productApi;

 