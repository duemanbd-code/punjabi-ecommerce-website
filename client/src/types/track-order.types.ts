// client/src/types/track-order.types.ts

export interface TrackingHistory {
  date: string;
  status: string;
  description: string;
}

export interface TrackOrder {
  orderId: string;
  trackingCode: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  totalAmount: number;
  status: string;
  estimatedDelivery?: string;
  carrier?: string;
  trackingHistory: TrackingHistory[];
  createdAt: string;
}

export interface TrackOrderResponse {
  success: boolean;
  order?: TrackOrder;
  error?: string;
}