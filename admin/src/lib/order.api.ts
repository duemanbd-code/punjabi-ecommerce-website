// admin/src/lib/order.api.ts

import { getAuthHeaders } from "../utils/auth";

// ==================== CONFIGURATION ====================
const getBaseUrl = () => {
  // Check environment variable first
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (envUrl) {
    // Ensure URL has protocol
    if (!envUrl.startsWith('http')) {
      // Determine protocol based on environment
      const isProduction = typeof window !== 'undefined' ? 
        !window.location.hostname.includes('localhost') : 
        process.env.NODE_ENV === 'production';
      
      if (isProduction) {
        console.log('🚀 Production mode detected, using HTTPS');
        return `https://${envUrl}`;
      } else {
        console.log('🌐 Development mode detected, using HTTP');
        return `http://${envUrl}`;
      }
    }
    return envUrl;
  }
  
  // No environment variable, detect based on current location
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.hostname === '';
    
    if (isLocalhost) {
      console.log('🌐 Local development: Using http://localhost:4000');
      return 'http://localhost:4000';
    } else {
      console.log('🚀 Production: Using https://taskin-panjabi-server.onrender.com');
      return 'https://taskin-panjabi-server.onrender.com';
    }
  }
  
  // Fallback for server-side rendering
  console.warn('⚠️ NEXT_PUBLIC_API_URL not set, using default: http://localhost:4000');
  return 'http://localhost:4000';
};

const API_BASE = getBaseUrl();
const API_URL = `${API_BASE}/api`;

// ==================== API UTILS ====================
const handleApiResponse = async (response: Response) => {
  console.log(`📡 API Response: ${response.status} ${response.url}`);
  
  if (!response.ok) {
    let errorMessage = `API Error: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || errorMessage;
      
      // Add additional context if available
      if (errorData.details) {
        errorMessage += ` - ${JSON.stringify(errorData.details)}`;
      }
    } catch {
      // If response is not JSON, use status text
    }
    
    // Specific error handling
    if (response.status === 401) {
      // Unauthorized - clear tokens and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin-token');
        localStorage.removeItem('admin-user');
        window.location.href = '/login';
      }
      errorMessage = 'Session expired. Please login again.';
    } else if (response.status === 404) {
      errorMessage = 'Resource not found.';
    } else if (response.status === 500) {
      errorMessage = 'Server error. Please try again later.';
    }
    
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }
  
  // Parse successful response
  try {
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Failed to parse JSON response:', error);
    throw new Error('Invalid response from server');
  }
};

const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const authHeaders = getAuthHeaders();
  
  // Add timeout functionality
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
  
  const config: RequestInit = {
    ...options,
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers,
    },
    signal: controller.signal,
  };
  
  try {
    console.log(`📡 API Request: ${config.method || 'GET'} ${url}`);
    
    const response = await fetch(url, config);
    clearTimeout(timeoutId);
    
    return await handleApiResponse(response);
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    // Handle specific error types
    if (error.name === 'AbortError') {
      console.error(`❌ Request timeout for ${url}`);
      throw new Error('Request timeout. Server might be slow or offline.');
    } else if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
      console.error(`❌ Network error for ${url}`);
      console.error(`🌐 API Base URL: ${API_BASE}`);
      console.error(`🔗 Full URL: ${url}`);
      throw new Error('Cannot connect to server. Check your internet connection and ensure backend is running.');
    } else if (error.message.includes('Session expired')) {
      // Already handled in handleApiResponse for 401
      throw error;
    } else {
      console.error(`❌ API call failed for ${url}:`, error);
      throw error;
    }
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
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.status) queryParams.append("status", params.status);
    if (params?.paymentStatus) queryParams.append("paymentStatus", params.paymentStatus);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `${API_URL}/orders${queryString ? `?${queryString}` : ''}`;
    
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
    status?: string;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const url = `${API_URL}/orders/stats${queryString ? `?${queryString}` : ''}`;
    
    return fetchWithAuth(url);
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const url = `${API_URL}/orders/dashboard-stats`;
    return fetchWithAuth(url);
  },

  // Update order status
  updateOrderStatus: async (
    id: string,
    data: {
      status: string;
      notes?: string;
      trackingNumber?: string;
      notifyCustomer?: boolean;
    }
  ) => {
    const url = `${API_URL}/orders/${id}/status`;
    
    return fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Update payment status
  updatePaymentStatus: async (id: string, paymentStatus: string, notes?: string) => {
    const url = `${API_URL}/orders/${id}/payment-status`;
    
    return fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify({ paymentStatus, notes }),
    });
  },

  // Update order (general update)
  updateOrder: async (
    id: string,
    data: {
      shippingAddress?: any;
      billingAddress?: any;
      notes?: string;
      discount?: number;
      tax?: number;
      shippingCost?: number;
    }
  ) => {
    const url = `${API_URL}/orders/${id}`;
    
    return fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Delete order
  deleteOrder: async (id: string, reason?: string) => {
    const url = `${API_URL}/orders/${id}`;
    
    return fetchWithAuth(url, {
      method: "DELETE",
      body: reason ? JSON.stringify({ reason }) : undefined,
    });
  },

  // Send order invoice
  sendInvoice: async (id: string, email?: string) => {
    const url = `${API_URL}/orders/${id}/send-invoice`;
    
    return fetchWithAuth(url, {
      method: "POST",
      body: email ? JSON.stringify({ email }) : undefined,
    });
  },

  // Export orders
  exportOrders: async (params?: {
    startDate?: string;
    endDate?: string;
    status?: string;
    format?: 'csv' | 'excel';
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.format) queryParams.append("format", params.format);

    const queryString = queryParams.toString();
    const url = `${API_URL}/orders/export${queryString ? `?${queryString}` : ''}`;
    
    return fetchWithAuth(url);
  },

  // Bulk update order status
  bulkUpdateStatus: async (orderIds: string[], status: string, notes?: string) => {
    const url = `${API_URL}/orders/bulk/status`;
    
    return fetchWithAuth(url, {
      method: "PUT",
      body: JSON.stringify({ orderIds, status, notes }),
    });
  },

  // Get order analytics
  getOrderAnalytics: async (params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }) => {
    const queryParams = new URLSearchParams();
    
    if (params?.period) queryParams.append("period", params.period);
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const queryString = queryParams.toString();
    const url = `${API_URL}/orders/analytics${queryString ? `?${queryString}` : ''}`;
    
    return fetchWithAuth(url);
  },
};

// ==================== ENVIRONMENT SETUP ====================
// Log the API configuration (only in development)
if (typeof window !== 'undefined') {
  console.log('🔧 Order API Configuration:', {
    baseUrl: API_BASE,
    apiUrl: API_URL,
    environment: process.env.NODE_ENV,
    hostname: window.location.hostname,
    timestamp: new Date().toISOString(),
  });
}