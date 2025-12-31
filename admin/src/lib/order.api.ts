// admin/src/lib/order.api.ts

import { getAuthHeaders } from "../utils/auth";

// ==================== CONFIGURATION ====================
const getBaseUrl = () => {
  // Always provide a fallback for local development
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  
  // Validate the URL
  if (!baseUrl.startsWith('http')) {
    console.error('❌ Invalid API URL:', baseUrl);
    return "http://localhost:5000"; // Fallback to localhost
  }
  
  return baseUrl;
};

const API_BASE = getBaseUrl();
const API_URL = `${API_BASE}/api`;

// ==================== API UTILS ====================
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      // If response is not JSON, use status text
    }
    
    throw new Error(errorMessage);
  }
  
  return response.json();
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const authHeaders = getAuthHeaders();
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      ...options.headers,
    },
    credentials: "include" as RequestCredentials,
  };
  
  try {
    const response = await fetch(url, config);
    return await handleApiResponse(response);
  } catch (error) {
    console.error(`API call failed for ${url}:`, error);
    throw error;
  }
};

// ==================== ORDER API ====================
export const orderApi = {
  // Get all orders
  getOrders: async (params?: {
    status?: string;
    paymentStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append("status", params.status);
    if (params?.paymentStatus) queryParams.append("paymentStatus", params.paymentStatus);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `${API_URL}/orders${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    return fetchWithAuth(url);
  },

  // Get order by ID
  getOrder: async (id: string) => {
    const url = `${API_URL}/orders/${id}`;
    return fetchWithAuth(url);
  },

  // Get order stats
  getOrderStats: async (params?: { 
    startDate?: string; 
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    const url = `${API_URL}/orders/stats${queryString}`;
    
    return fetchWithAuth(url);
  },

  // Update order status
  updateOrderStatus: async (
    id: string,
    data: {
      status: string;
      notes?: string;
      trackingNumber?: string;
    }
  ) => {
    const url = `${API_URL}/orders/${id}/status`;
    
    return fetchWithAuth(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
  },

  // Update payment status
  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    const url = `${API_URL}/orders/${id}/payment-status`;
    
    return fetchWithAuth(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentStatus }),
    });
  },

  // Delete order
  deleteOrder: async (id: string) => {
    const url = `${API_URL}/orders/${id}`;
    
    return fetchWithAuth(url, {
      method: "DELETE",
    });
  },
};

// ==================== ENVIRONMENT SETUP ====================
// Log the API configuration (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 API Configuration:', {
    baseUrl: API_BASE,
    apiUrl: API_URL,
    environment: process.env.NODE_ENV,
  });
}