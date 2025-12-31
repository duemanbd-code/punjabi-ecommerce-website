export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  image: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface ShippingInfo {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  zipCode?: string;
  country: string;
  deliveryInstructions?: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  shippingInfo: ShippingInfo;
  items: OrderItem[];
  subtotal: number;
  discountTotal?: number;
  shippingCharge: number;
  total: number;
  paymentMethod: 'cod' | 'card' | 'bkash' | 'nagad' | 'rocket';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  deliveryType: 'dhaka' | 'outside';
  estimatedDelivery: string;
  notes?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OrderStats {
  totalOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  pendingOrders: number;
  confirmedOrders?: number;
  processingOrders?: number;
  shippedOrders?: number;
  deliveredOrders: number;
  cancelledOrders?: number;
  paidOrders: number;
  todayOrders?: number;
  todayRevenue?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  stats?: OrderStats;
}