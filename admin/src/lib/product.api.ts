// admin/src/lib/product.api.ts

import { getAuthHeaders } from "../utils/auth";

// FIX: Add fallback for API_URL
const API_URL = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api`;

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