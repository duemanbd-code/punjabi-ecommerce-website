// admin/src/lib/api.ts

import axios from "axios";

// Function to get the correct base URL for both local and production
const getBaseUrl = (): string => {
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
  console.log('⚠️ NEXT_PUBLIC_API_URL not set, using default: http://localhost:4000');
  return 'http://localhost:4000';
};

// Get base URL
const API_BASE_URL = getBaseUrl();

// Create axios instance with better configuration
export const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 15000, // 15 seconds timeout
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for logging and error handling
api.interceptors.request.use(
  (config) => {
    // Log requests in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    }
    
    // Add timestamp to prevent caching
    if (config.method === 'get') {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Log successful responses in development
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
    });
    
    // Handle specific error cases
    if (error.response) {
      // Server responded with error status
      switch (error.response.status) {
        case 401:
          // Unauthorized - Clear token and redirect
          if (typeof window !== 'undefined') {
            localStorage.removeItem('admin-token');
            localStorage.removeItem('admin-user');
            window.location.href = '/login';
          }
          break;
        case 404:
          console.error('Resource not found');
          break;
        case 500:
          console.error('Server error');
          break;
      }
    } else if (error.request) {
      // Request was made but no response
      console.error('No response received from server');
    } else {
      // Error in setting up request
      console.error('Error setting up request:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Set auth token in headers
export const setAuthToken = (token: string) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    
    // Also store in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('admin-token', token);
    }
  } else {
    delete api.defaults.headers.common['Authorization'];
    
    // Remove from localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin-token');
    }
  }
};

// Remove auth token
export const removeAuthToken = () => {
  delete api.defaults.headers.common['Authorization'];
  
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-user');
  }
};

// Get current auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin-token');
  }
  return null;
};

// Initialize auth token from localStorage on client side
export const initializeAuthToken = () => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('admin-token');
    if (token) {
      setAuthToken(token);
    }
  }
};

// Helper function for file uploads
export const uploadFile = async (file: File, endpoint: string, onProgress?: (progress: number) => void) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const token = getAuthToken();
  
  return api.post(endpoint, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(progress);
      }
    },
  });
};

// Helper function for handling errors consistently
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message.includes('Network Error')) {
    return 'Cannot connect to server. Please check your internet connection and ensure backend is running.';
  }
  
  if (error.message.includes('timeout')) {
    return 'Request timeout. Server might be slow or offline.';
  }
  
  return error.message || 'An unexpected error occurred';
};

// Automatically initialize auth token on client side
if (typeof window !== 'undefined') {
  initializeAuthToken();
  
  // Log the current API configuration
  console.log('🔧 API Configuration:', {
    baseURL: API_BASE_URL,
    environment: process.env.NODE_ENV,
    hostname: window.location.hostname,
  });
}
