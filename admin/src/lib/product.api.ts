// admin/src/lib/product.api.ts

import { getAuthHeaders } from "../utils/auth";

// Function to get the correct API URL based on environment
const getApiBaseUrl = (): string => {
  // First check for environment variable
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl) {
    // If env URL is provided, ensure it has the correct protocol
    if (!envUrl.startsWith('http')) {
      // For production environments, default to https
      if (process.env.NODE_ENV === 'production' || 
          (typeof window !== 'undefined' && window.location.hostname !== 'localhost')) {
        return `https://${envUrl}`;
      } else {
        return `http://${envUrl}`;
      }
    }
    return envUrl;
  }
  
  // If no env variable, detect based on current environment
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    
    if (isLocalhost) {
      console.log('🌐 Using local development API: http://localhost:4000');
      return 'http://localhost:4000';
    } else {
      console.log('🚀 Using production API: https://taskin-panjabi-server.onrender.com');
      return 'https://taskin-panjabi-server.onrender.com';
    }
  }
  
  // Server-side rendering - use environment or default to local
  return process.env.NODE_ENV === 'production' 
    ? 'https://taskin-panjabi-server.onrender.com'
    : 'http://localhost:4000';
};

// Get API URL with /api prefix
const getApiUrl = (): string => {
  const baseUrl = getApiBaseUrl();
  return `${baseUrl}/api`;
};

// API URL for use in functions
const API_URL = getApiUrl();

export const productApi = {
  // Get inventory report
  async getInventoryReport(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== "") {
          queryParams.append(key, value.toString());
        }
      });
    }

    const url = `${API_URL}/products/inventory/report${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    
    console.log("Fetching inventory report from:", url);

    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    return response.json();
  },

  // Update product stock
  async updateProductStock(
    productId: string,
    data: {
      quantity: number;
      action: "add" | "remove";
      reason?: string;
    }
  ) {
    const url = `${API_URL}/products/${productId}/stock/update`;
    console.log("Updating stock at:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });

    return response.json();
  },

  // Get low stock alerts
  async getLowStockAlerts() {
    const url = `${API_URL}/products/inventory/low-stock-alerts`;
    console.log("Fetching low stock alerts from:", url);

    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    return response.json();
  },

  // Get inventory summary
  async getInventorySummary() {
    const url = `${API_URL}/products/inventory/summary`;
    console.log("Fetching inventory summary from:", url);

    const response = await fetch(url, {
      headers: getAuthHeaders(),
      credentials: "include",
    });

    return response.json();
  },

  // Reserve stock for order
  async reserveStock(
    items: Array<{ productId: string; quantity: number }>
  ) {
    const url = `${API_URL}/products/stock/reserve`;
    console.log("Reserving stock at:", url);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ items }),
    });

    return response.json();
  },
};