// client/src/app/order-confirmation/[id]/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle,
  Package,
  MapPin,
  Clock,
  User,
  Phone,
  Mail,
  Home,
  ArrowLeft,
  Printer,
  ShoppingCart,
  Truck,
  Shield,
  CreditCard,
  FileText,
} from "lucide-react";
import Link from "next/link";

// TypeScript type for dataLayer
declare global {
  interface Window {
    dataLayer?: Array<Record<string, any>>;
  }
}

// Helper to push GTM events
const pushGTMEvent = (event: Record<string, any>) => {
  if (typeof window !== "undefined" && window.dataLayer) {
    window.dataLayer.push(event);
  }
  // Also log for debugging
  console.log("GTM Event:", event);
};

interface Order {
  _id: string;
  orderNumber: string;
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    zipCode: string;
    country: string;
    deliveryInstructions?: string;
  };
  subtotal: number;
  discountTotal: number;
  shippingCharge: number;
  total: number;
  items: Array<{
    productId: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
    size?: string;
    color?: string;
    category?: string;
    brand?: string;
    sku?: string;
    normalPrice?: number;
    originalPrice?: number;
  }>;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  deliveryType: 'dhaka' | 'outside';
  estimatedDelivery: string;
  createdAt: string;
  updatedAt?: string;
}

export default function OrderConfirmationPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [purchaseEventSent, setPurchaseEventSent] = useState(false);
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' && 
     (window.location.hostname === 'localhost' || 
      window.location.hostname === '127.0.0.1') 
      ? 'http://localhost:4000' 
      : 'https://taskin-panjabi-server.onrender.com');

  // Initialize dataLayer
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.dataLayer = window.dataLayer || [];
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      fetchOrder();
    }
  }, [params.id]);

  useEffect(() => {
    // Push page_view event for order confirmation page
    if (!loading) {
      const userId = localStorage.getItem("currentUserId") || "guest";
      const cartCount = JSON.parse(localStorage.getItem("cart") || "[]").length;
      
      pushGTMEvent({
        event: "page_view",
        page_title: "Order Confirmation",
        page_location: window.location.href,
        page_path: `/order-confirmation/${params.id}`,
        order_id: params.id,
        order_status: order?.status || "loading",
        user_id: userId,
        cart_size: cartCount,
      });
    }
  }, [loading, order, params.id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/orders/${params.id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch order`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        const orderData = data.data;
        setOrder(orderData);
        
        // Send purchase event only once
        sendPurchaseEvent(orderData);
        
      } else {
        setError(data.error || "Failed to fetch order");
      }
    } catch (error: any) {
      console.error("Error fetching order:", error);
      setError("Failed to load order details. Please try again.");
      
      // Push error event
      pushGTMEvent({
        event: "order_error",
        error_type: "fetch_failed",
        error_message: error.message,
        order_id: params.id,
      });
    } finally {
      setLoading(false);
    }
  };

  const sendPurchaseEvent = (orderData: Order) => {
    // Check if purchase event has already been sent for this order
    const purchaseSentKey = `purchase_sent_${orderData._id}`;
    const alreadySent = localStorage.getItem(purchaseSentKey);
    
    if (!alreadySent && !purchaseEventSent) {
      // Calculate total discount
      const totalDiscount = orderData.discountTotal || 0;
      
      // Push purchase event
      pushGTMEvent({
        event: "purchase",
        ecommerce: {
          transaction_id: orderData._id,
          affiliation: "Puti Collection",
          value: orderData.total,
          tax: 0,
          shipping: orderData.shippingCharge,
          currency: "BDT",
          coupon: orderData.deliveryType === "dhaka" ? "DHKASHIPPING" : "OUTSIDESHIPPING",
          payment_type: orderData.paymentMethod,
          delivery_type: orderData.deliveryType,
          estimated_delivery: orderData.estimatedDelivery,
          order_number: orderData.orderNumber,
          order_date: orderData.createdAt,

          items: orderData.items.map((item, index) => ({
            item_id: item.productId,
            item_name: item.title,
            item_brand: item.brand || "Default",
            item_category: item.category || "Uncategorized",
            item_variant: item.color 
                          ? `${item.color}${item.size ? ` - ${item.size}` : ""}` 
                          : item.size || "",
            price: item.price,
            quantity: item.quantity,
            discount: (item.normalPrice || item.originalPrice || item.price) - item.price,
            item_sku: item.sku || "",
            item_image: item.image,
            position: index + 1,
          })),
        },
        user_properties: {
          user_id: localStorage.getItem("currentUserId") || "guest",
          has_placed_order: true,
          total_orders: parseInt(localStorage.getItem("total_orders") || "0") + 1,
          lifetime_value: (parseFloat(localStorage.getItem("lifetime_value") || "0") + orderData.total).toFixed(2),
        }
      });

      // Mark as sent in localStorage and state
      localStorage.setItem(purchaseSentKey, "true");
      setPurchaseEventSent(true);
      
      // Update user stats
      updateUserStats(orderData.total);
      
      // Clear cart from localStorage if exists
      localStorage.removeItem("cart");
    }
  };

  const updateUserStats = (orderValue: number) => {
    // Increment total orders
    const totalOrders = parseInt(localStorage.getItem("total_orders") || "0") + 1;
    localStorage.setItem("total_orders", totalOrders.toString());
    
    // Update lifetime value
    const lifetimeValue = parseFloat(localStorage.getItem("lifetime_value") || "0") + orderValue;
    localStorage.setItem("lifetime_value", lifetimeValue.toFixed(2));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getDeliveryDays = () => {
    return order?.deliveryType === "dhaka" ? "3" : "5";
  };

  const printInvoice = () => {
    // GTM: print_invoice event
    pushGTMEvent({
      event: "print_invoice",
      order_id: order?._id,
      order_number: order?.orderNumber,
    });
    
    window.print();
  };

  const handleContinueShopping = () => {
    // GTM: continue_shopping_after_confirmation event
    pushGTMEvent({
      event: "continue_shopping_after_confirmation",
      order_id: order?._id,
      order_value: order?.total,
      time_on_page: Math.floor((Date.now() - window.performance.timing.navigationStart) / 1000),
    });
    
    router.push("/");
  };

  const handleTrackOrder = () => {
    // GTM: track_order event
    pushGTMEvent({
      event: "track_order",
      order_id: order?._id,
      order_number: order?.orderNumber,
      order_status: order?.status,
    });
    
    alert("Order tracking will be available soon! We'll notify you via SMS and email.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="animate-spin h-16 w-16 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
            <FileText className="absolute inset-0 m-auto h-8 w-8 text-amber-600" />
          </div>
          <p className="text-slate-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col items-center justify-center text-center px-4">
        <div className="relative mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-white rounded-full border border-amber-100 flex items-center justify-center shadow-lg">
            <FileText className="w-12 h-12 text-amber-400" />
          </div>
          <div className="absolute -top-2 -right-2">
            <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">
          {error || "Order Not Found"}
        </h2>
        <p className="text-slate-600 mb-6">
          {error ? error : "The order you're looking for doesn't exist."}
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/"
            onClick={handleContinueShopping}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Go Back Home
          </Link>
          <Link
            href="/orders"
            onClick={() => {
              pushGTMEvent({
                event: "view_orders_from_error",
                error_type: error ? "fetch_error" : "not_found",
              });
            }}
            className="px-6 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
          >
            View My Orders
          </Link>
        </div>
      </div>
    );
  }

  // Calculate items count
  const itemsCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 print:py-0">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 print:px-0">
        {/* Header - Hidden in print */}
        <div className="mb-8 print:hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Order Confirmation
              </h1>
              <p className="text-slate-600 mt-2">
                Thank you for your order! Your order has been confirmed.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={printInvoice}
                className="px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 shadow-sm hover:shadow"
              >
                <Printer size={18} />
                Print Invoice
              </button>
              <button
                onClick={handleContinueShopping}
                className="px-4 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all flex items-center gap-2 shadow-lg hover:shadow-xl"
              >
                <ArrowLeft size={18} />
                Continue Shopping
              </button>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="bg-gradient-to-r from-emerald-50 to-white rounded-2xl border border-emerald-200 p-8 mb-8 print:border print:rounded-none print:p-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Order #{order.orderNumber} Confirmed!
              </h2>
              <p className="text-slate-600 mt-2">
                Your order has been received and is being processed. 
                Order ID: <span className="font-mono font-medium">{order._id}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 print:border print:rounded-none print:p-4 print:shadow-none">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Order Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Order Number</p>
                    <p className="font-bold text-lg text-slate-900 font-mono">
                      {order.orderNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Order Date</p>
                    <p className="font-bold text-slate-900">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Order Status</p>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                      <Package className="w-3 h-3" />
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-600">Payment Method</p>
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-slate-500" />
                      <p className="font-bold text-slate-900">
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Payment Status</p>
                    <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                      order.paymentStatus === 'paid' 
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Delivery Type</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-slate-900">
                        {order.deliveryType === "dhaka" 
                          ? "Inside Dhaka (৳80)" 
                          : "Outside Dhaka (৳150)"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Estimated Delivery</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span className="font-bold text-slate-900">
                        {order.estimatedDelivery} ({getDeliveryDays()} business days)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 print:border print:rounded-none print:p-4 print:shadow-none">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-600" />
                Order Items ({itemsCount} items)
              </h3>
              <div className="space-y-4">
                {order.items.map((item, index) => {
                  const itemDiscount = (item.normalPrice || item.originalPrice || item.price) - item.price;
                  const hasDiscount = itemDiscount > 0;
                  
                  return (
                    <div 
                      key={index} 
                      className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      data-gtm-item-id={item.productId}
                    >
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-20 h-20 object-cover rounded-lg border border-slate-200 flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=200&h=200&fit=crop';
                          e.currentTarget.onerror = null;
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-slate-900 truncate">{item.title}</h4>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          {item.size && (
                            <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                              Size: {item.size}
                            </span>
                          )}
                          {item.color && (
                            <span className="text-sm text-slate-600 bg-slate-100 px-2 py-1 rounded">
                              Color: {item.color}
                            </span>
                          )}
                          <span className="text-sm text-slate-600">
                            Qty: {item.quantity}
                          </span>
                          {hasDiscount && (
                            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                              Save {formatCurrency(itemDiscount * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-slate-900">{formatCurrency(item.price)}</p>
                        <p className="text-lg font-bold text-slate-900">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                        {hasDiscount && (
                          <p className="text-sm text-slate-400 line-through">
                            {formatCurrency((item.normalPrice || item.originalPrice || item.price) * item.quantity)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 print:border print:rounded-none print:p-4 print:shadow-none">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" />
                Shipping Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Customer Name</p>
                      <p className="font-bold text-slate-900">
                        {order.shippingInfo.fullName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Phone Number</p>
                      <p className="font-bold text-slate-900">
                        {order.shippingInfo.phone}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Email Address</p>
                      <p className="font-bold text-slate-900">
                        {order.shippingInfo.email}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Home className="w-5 h-5 text-slate-500" />
                    <div>
                      <p className="text-sm text-slate-600">Address</p>
                      <p className="font-bold text-slate-900">
                        {order.shippingInfo.address}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">City/District</p>
                    <p className="font-bold text-slate-900">
                      {order.shippingInfo.city}, {order.shippingInfo.district}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">ZIP Code</p>
                    <p className="font-bold text-slate-900">
                      {order.shippingInfo.zipCode}
                    </p>
                  </div>
                  {order.shippingInfo.deliveryInstructions && (
                    <div>
                      <p className="text-sm text-slate-600">Delivery Instructions</p>
                      <p className="font-medium text-slate-900">
                        {order.shippingInfo.deliveryInstructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-6 print:static print:border print:rounded-none print:p-4 print:shadow-none">
              <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                Order Summary
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-600">Subtotal ({itemsCount} items)</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(order.subtotal)}
                  </span>
                </div>
                {order.discountTotal > 0 && (
                  <div className="flex justify-between py-2 border-b border-slate-200">
                    <span className="text-slate-600 flex items-center gap-1">
                      <span className="text-emerald-600">🎉</span>
                      Product Discounts
                    </span>
                    <span className="font-bold text-emerald-600">
                      -{formatCurrency(order.discountTotal)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b border-slate-300">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Truck className="w-4 h-4 text-amber-600" />
                    Shipping Charge
                  </span>
                  <span className="font-bold text-amber-600">
                    +{formatCurrency(order.shippingCharge)}
                  </span>
                </div>
                <div className="pt-4 border-t border-slate-300">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">
                      Total Payable
                    </span>
                    <span className="text-2xl font-bold text-amber-600">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 text-center">
                    Pay upon delivery
                  </p>
                  
                  {/* Savings Summary */}
                  {order.discountTotal > 0 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                      <p className="text-sm text-emerald-700 text-center">
                        🎉 You saved {formatCurrency(order.discountTotal)} on this order!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Steps */}
              <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 print:hidden">
                <h4 className="font-bold text-slate-900 mb-3">What's Next?</h4>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-blue-600">1</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Order Processing
                      </p>
                      <p className="text-xs text-slate-600">
                        We'll prepare your items for shipping
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">2</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Shipping & Delivery
                      </p>
                      <p className="text-xs text-slate-600">
                        Your order will be delivered within {getDeliveryDays()} business days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-emerald-600">3</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        Cash Payment
                      </p>
                      <p className="text-xs text-slate-600">
                        Pay {formatCurrency(order.total)} to the delivery person
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Support */}
              <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-white rounded-xl border border-amber-200 print:hidden">
                <h4 className="font-bold text-slate-900 mb-2">Need Help?</h4>
                <p className="text-sm text-slate-600 mb-2">
                  Contact our customer support:
                </p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    +8801914600880
                  </p>
                  <p className="text-sm font-medium text-amber-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    duemanbd@gmail.com
                  </p>
                </div>
                <button
                  onClick={handleTrackOrder}
                  className="w-full mt-3 py-2 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors text-sm"
                >
                  Track My Order
                </button>
              </div>

              {/* Print Notice */}
              <div className="mt-6 p-3 bg-slate-50 rounded-lg border border-slate-200 hidden print:block">
                <p className="text-xs text-slate-600 text-center">
                  This is a computer-generated invoice. No signature required.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons (Bottom) */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 print:hidden">
          <button
            onClick={handleContinueShopping}
            className="flex-1 py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} />
            Continue Shopping
          </button>
          <button
            onClick={handleTrackOrder}
            className="flex-1 py-3.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Shield className="w-5 h-5" />
            Track My Order
          </button>
          <button
            onClick={printInvoice}
            className="flex-1 py-3.5 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print Invoice
          </button>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          body {
            background: white !important;
            font-size: 12px !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:border {
            border: 1px solid #e2e8f0 !important;
          }
          .print\\:rounded-none {
            border-radius: 0 !important;
          }
          .print\\:p-4 {
            padding: 1rem !important;
          }
          .print\\:px-0 {
            padding-left: 0 !important;
            padding-right: 0 !important;
          }
          .print\\:py-0 {
            padding-top: 0 !important;
            padding-bottom: 0 !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}




// // client/src/app/order-confirmation/[id]/page.tsx

// "use client";

// import { useEffect, useState } from "react";
// import { useParams, useRouter } from "next/navigation";
// import {
//   CheckCircle,
//   Package,
//   Truck,
//   MapPin,
//   Clock,
//   User,
//   Phone,
//   Mail,
//   Home,
//   ArrowLeft,
//   Printer,
//   Download,
// } from "lucide-react";
// import Link from "next/link";

//   const API_URL=process.env.NEXT_PUBLIC_API_URL

// interface Order {
//   _id: string;
//   orderNumber: string;
//   shippingInfo: {
//     fullName: string;
//     email: string;
//     phone: string;
//     address: string;
//     city: string;
//     district: string;
//     zipCode: string;
//     country: string;
//   };
//   subtotal: number;
//   discountTotal: number;
//   shippingCharge: number;
//   total: number;
//   items: Array<{
//     productId: string;
//     title: string;
//     price: number;
//     image: string;
//     quantity: number;
//     size?: string;
//     color?: string;
//   }>;
//   status: string;
//   paymentStatus: string;
//   deliveryType: 'dhaka' | 'outside';
//   estimatedDelivery: string;
//   createdAt: string;
// }

// export default function OrderConfirmationPage() {
//   const params = useParams();
//   const router = useRouter();
//   const [order, setOrder] = useState<Order | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (params.id) {
//       fetchOrder();
//     }
//   }, [params.id]);

//   const fetchOrder = async () => {
//     try {
//       const response = await fetch(`${API_URL}/api/orders/${params.id}`);
//       const data = await response.json();
      
//       if (data.success) {
//         setOrder(data.data);
//       } else {
//         setError(data.error || "Failed to fetch order");
//       }
//     } catch (error: any) {
//       console.error("Error fetching order:", error);
//       setError("Failed to load order details");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat("en-BD", {
//       style: "currency",
//       currency: "BDT",
//       minimumFractionDigits: 0,
//     }).format(amount);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString("en-US", {
//       year: "numeric",
//       month: "long",
//       day: "numeric",
//       hour: "2-digit",
//       minute: "2-digit",
//     });
//   };

//   const printInvoice = () => {
//     window.print();
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
//       </div>
//     );
//   }

//   if (error || !order) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
//         <h2 className="text-2xl font-bold text-slate-900 mb-3">
//           {error || "Order Not Found"}
//         </h2>
//         <p className="text-slate-600 mb-6">
//           {error ? error : "The order you're looking for doesn't exist."}
//         </p>
//         <Link
//           href="/"
//           className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all"
//         >
//           Go Back Home
//         </Link>
//       </div>
//     );
//   }

//   // Calculate items count
//   const itemsCount = order.items.reduce((total, item) => total + item.quantity, 0);

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-8">
//           <div className="flex items-center justify-between">
//             <div>
//               <h1 className="text-3xl font-bold text-slate-900">
//                 Order Confirmation
//               </h1>
//               <p className="text-slate-600 mt-2">
//                 Thank you for your order!
//               </p>
//             </div>
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={printInvoice}
//                 className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
//               >
//                 <Printer size={18} />
//                 Print Invoice
//               </button>
//               <Link
//                 href="/"
//                 className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 text-white rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all flex items-center gap-2"
//               >
//                 <ArrowLeft size={18} />
//                 Continue Shopping
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Success Message */}
//         <div className="bg-gradient-to-r from-emerald-50 to-white rounded-2xl border border-emerald-200 p-8 mb-8">
//           <div className="flex items-center gap-4">
//             <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full">
//               <CheckCircle className="w-8 h-8 text-white" />
//             </div>
//             <div>
//               <h2 className="text-2xl font-bold text-slate-900">
//                 Order #{order.orderNumber} Confirmed!
//               </h2>
//               <p className="text-slate-600 mt-2">
//                 Your order has been received and is being processed. Order ID: {order._id}
//               </p>
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Order Details */}
//           <div className="lg:col-span-2 space-y-6">
//             {/* Order Information */}
//             <div className="bg-white rounded-2xl border border-slate-200 p-6">
//               <h3 className="text-xl font-bold text-slate-900 mb-6">
//                 Order Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-sm text-slate-600">Order Number</p>
//                     <p className="font-bold text-lg text-slate-900">
//                       {order.orderNumber}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-600">Order Date</p>
//                     <p className="font-bold text-slate-900">
//                       {formatDate(order.createdAt)}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-600">Order Status</p>
//                     <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
//                       <Package className="w-3 h-3" />
//                       {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
//                     </span>
//                   </div>
//                 </div>
//                 <div className="space-y-4">
//                   <div>
//                     <p className="text-sm text-slate-600">Payment Method</p>
//                     <p className="font-bold text-slate-900">
//                       {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-600">Payment Status</p>
//                     <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
//                       order.paymentStatus === 'paid' 
//                         ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
//                         : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
//                     }`}>
//                       {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
//                     </span>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-600">Delivery Type</p>
//                     <div className="flex items-center gap-2">
//                       <MapPin className="w-4 h-4 text-slate-500" />
//                       <span className="font-bold text-slate-900">
//                         {order.deliveryType === "dhaka" 
//                           ? "Inside Dhaka" 
//                           : "Outside Dhaka"}
//                       </span>
//                     </div>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-600">Estimated Delivery</p>
//                     <div className="flex items-center gap-2">
//                       <Clock className="w-4 h-4 text-slate-500" />
//                       <span className="font-bold text-slate-900">
//                         {order.estimatedDelivery}
//                       </span>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>

//             {/* Order Items */}
//             <div className="bg-white rounded-2xl border border-slate-200 p-6">
//               <h3 className="text-xl font-bold text-slate-900 mb-6">
//                 Order Items ({itemsCount} items)
//               </h3>
//               <div className="space-y-4">
//                 {order.items.map((item, index) => (
//                   <div key={index} className="flex items-center gap-4 p-4 border border-slate-200 rounded-lg">
//                     <img
//                       src={item.image}
//                       alt={item.title}
//                       className="w-20 h-20 object-cover rounded-lg border border-slate-200"
//                       onError={(e) => {
//                         e.currentTarget.src = 'https://via.placeholder.com/80';
//                         e.currentTarget.onerror = null;
//                       }}
//                     />
//                     <div className="flex-1">
//                       <h4 className="font-medium text-slate-900">{item.title}</h4>
//                       <div className="flex items-center gap-4 mt-2">
//                         {item.size && (
//                           <span className="text-sm text-slate-600">Size: {item.size}</span>
//                         )}
//                         {item.color && (
//                           <span className="text-sm text-slate-600">Color: {item.color}</span>
//                         )}
//                         <span className="text-sm text-slate-600">Qty: {item.quantity}</span>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <p className="font-medium text-slate-900">{formatCurrency(item.price)}</p>
//                       <p className="text-lg font-bold text-slate-900">
//                         {formatCurrency(item.price * item.quantity)}
//                       </p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>

//             {/* Shipping Information */}
//             <div className="bg-white rounded-2xl border border-slate-200 p-6">
//               <h3 className="text-xl font-bold text-slate-900 mb-6">
//                 Shipping Information
//               </h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-3">
//                   <div className="flex items-center gap-3">
//                     <User className="w-5 h-5 text-slate-500" />
//                     <div>
//                       <p className="text-sm text-slate-600">Customer Name</p>
//                       <p className="font-bold text-slate-900">
//                         {order.shippingInfo.fullName}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Phone className="w-5 h-5 text-slate-500" />
//                     <div>
//                       <p className="text-sm text-slate-600">Phone Number</p>
//                       <p className="font-bold text-slate-900">
//                         {order.shippingInfo.phone}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-center gap-3">
//                     <Mail className="w-5 h-5 text-slate-500" />
//                     <div>
//                       <p className="text-sm text-slate-600">Email Address</p>
//                       <p className="font-bold text-slate-900">
//                         {order.shippingInfo.email}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="space-y-3">
//                   <div className="flex items-center gap-3">
//                     <Home className="w-5 h-5 text-slate-500" />
//                     <div>
//                       <p className="text-sm text-slate-600">Address</p>
//                       <p className="font-bold text-slate-900">
//                         {order.shippingInfo.address}
//                       </p>
//                     </div>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-600">City/District</p>
//                     <p className="font-bold text-slate-900">
//                       {order.shippingInfo.city}, {order.shippingInfo.district}
//                     </p>
//                   </div>
//                   <div>
//                     <p className="text-sm text-slate-600">ZIP Code</p>
//                     <p className="font-bold text-slate-900">
//                       {order.shippingInfo.zipCode}
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Order Summary */}
//           <div className="lg:col-span-1">
//             <div className="bg-white rounded-2xl border border-slate-200 p-6 sticky top-6">
//               <h3 className="text-xl font-bold text-slate-900 mb-6">
//                 Order Summary
//               </h3>
//               <div className="space-y-4">
//                 <div className="flex justify-between py-2 border-b border-slate-200">
//                   <span className="text-slate-600">Subtotal ({itemsCount} items)</span>
//                   <span className="font-bold text-slate-900">
//                     {formatCurrency(order.subtotal)}
//                   </span>
//                 </div>
//                 {order.discountTotal > 0 && (
//                   <div className="flex justify-between py-2 border-b border-slate-200">
//                     <span className="text-slate-600">Discount</span>
//                     <span className="font-bold text-emerald-600">
//                       -{formatCurrency(order.discountTotal)}
//                     </span>
//                   </div>
//                 )}
//                 <div className="flex justify-between py-2 border-b border-slate-300">
//                   <span className="text-slate-600">Shipping Charge</span>
//                   <span className="font-bold text-amber-600">
//                     +{formatCurrency(order.shippingCharge)}
//                   </span>
//                 </div>
//                 <div className="pt-4 border-t border-slate-300">
//                   <div className="flex justify-between items-center">
//                     <span className="text-lg font-bold text-slate-900">
//                       Total Payable
//                     </span>
//                     <span className="text-2xl font-bold text-amber-600">
//                       {formatCurrency(order.total)}
//                     </span>
//                   </div>
//                   <p className="text-sm text-slate-500 mt-2 text-center">
//                     Pay upon delivery
//                   </p>
//                 </div>
//               </div>

//               {/* Next Steps */}
//               <div className="mt-8 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200">
//                 <h4 className="font-bold text-slate-900 mb-3">What's Next?</h4>
//                 <div className="space-y-3">
//                   <div className="flex items-start gap-3">
//                     <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
//                       <span className="text-xs font-bold text-blue-600">1</span>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-slate-900">
//                         Order Processing
//                       </p>
//                       <p className="text-xs text-slate-600">
//                         We'll prepare your items for shipping
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
//                       <span className="text-xs font-bold text-purple-600">2</span>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-slate-900">
//                         Shipping & Delivery
//                       </p>
//                       <p className="text-xs text-slate-600">
//                         Your order will be delivered within {order.deliveryType === "dhaka" ? "3" : "5"} business days
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
//                       <span className="text-xs font-bold text-emerald-600">3</span>
//                     </div>
//                     <div>
//                       <p className="text-sm font-medium text-slate-900">
//                         Cash Payment
//                       </p>
//                       <p className="text-xs text-slate-600">
//                         Pay {formatCurrency(order.total)} to the delivery person
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Contact Support */}
//               <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-white rounded-xl border border-amber-200">
//                 <h4 className="font-bold text-slate-900 mb-2">Need Help?</h4>
//                 <p className="text-sm text-slate-600">
//                   Contact our customer support:
//                 </p>
//                 <p className="text-sm font-medium text-amber-600 mt-1">
//                   📞 +880 1234 567890
//                 </p>
//                 <p className="text-sm font-medium text-amber-600">
//                   ✉️ support@puti.com
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }