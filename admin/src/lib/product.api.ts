// admin/src/lib/product.api.ts

import { getAuthHeaders } from "../utils/auth";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

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

    const response = await fetch(
      `${API_URL}/products/inventory/report${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`,
      {
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

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
    const response = await fetch(
      `${API_URL}/products/${productId}/stock/update`,
      {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      }
    );

    return response.json();
  },

  // Get low stock alerts
  async getLowStockAlerts() {
    const response = await fetch(
      `${API_URL}/products/inventory/low-stock-alerts`,
      {
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    return response.json();
  },

  // Get inventory summary
  async getInventorySummary() {
    const response = await fetch(
      `${API_URL}/products/inventory/summary`,
      {
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    return response.json();
  },

  // Reserve stock for order
  async reserveStock(
    items: Array<{ productId: string; quantity: number }>
  ) {
    const response = await fetch(
      `${API_URL}/products/stock/reserve`,
      {
        method: "POST",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ items }),
      }
    );

    return response.json();
  },
};
