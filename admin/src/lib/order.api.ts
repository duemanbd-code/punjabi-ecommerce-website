// admin/src/lib/order.api.ts

import { getAuthHeaders } from "../utils/auth";

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

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
    if (params?.paymentStatus)
      queryParams.append("paymentStatus", params.paymentStatus);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const response = await fetch(
      `${API_URL}/orders?${queryParams.toString()}`,
      {
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    return response.json();
  },

  // Get order by ID
  getOrder: async (id: string) => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return response.json();
  },

  // Get order stats
  getOrderStats: async (params?: { startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append("startDate", params.startDate);
    if (params?.endDate) queryParams.append("endDate", params.endDate);

    const response = await fetch(
      `${API_URL}/orders/stats${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`,
      {
        headers: getAuthHeaders(),
        credentials: "include",
      }
    );

    return response.json();
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
    const response = await fetch(
      `${API_URL}/orders/${id}/status`,
      {
        method: "PUT",
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

  // Update payment status
  updatePaymentStatus: async (id: string, paymentStatus: string) => {
    const response = await fetch(
      `${API_URL}/orders/${id}/payment-status`,
      {
        method: "PUT",
        headers: {
          ...getAuthHeaders(),
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ paymentStatus }),
      }
    );

    return response.json();
  },

  // Delete order
  deleteOrder: async (id: string) => {
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
      credentials: "include",
    });
    return response.json();
  },
};
