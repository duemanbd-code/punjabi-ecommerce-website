// client/src/app/track-order/page.tsx

"use client";

import { useState } from "react";
import {
  Search,
  Package,
  Truck,
  CheckCircle,
  MapPin,
  AlertCircle,
} from "lucide-react";

  const API_URL=process.env.NEXT_PUBLIC_API_URL

interface TrackingHistory {
  date: string;
  status: string;
  description: string;
}

interface TrackOrder {
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

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackOrder | null>(null);
  const [error, setError] = useState("");

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const response = await fetch(
        `${API_URL}/api/track-order/track`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Order not found");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to track order");
      }

      setOrder(data.order);
    } catch (err: any) {
      setError(err.message || "Please check your Order ID and Email");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
      case "in-transit":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "shipped":
      case "in-transit":
        return <Truck className="w-5 h-5 text-blue-500" />;
      default:
        return <Package className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return `৳${amount.toLocaleString("en-BD")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center">
              <Package className="w-8 h-8 text-amber-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Track Your Order
          </h1>
          <p className="text-gray-600">
            Enter your Order ID and Email to track your package
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleTrackOrder}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID
                </label>

                <input
                  type="text"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                  placeholder="Enter Order ID"
                  className="
      w-full px-4 py-3 text-slate-900
      border border-slate-400 rounded-lg
      focus:border-amber-600 focus:ring-2 focus:ring-amber-600
      focus:outline-none focus:border-transparent
      transition-all
    "
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 text-slate-900 border border-slate-400 rounded-lg
      focus:border-amber-600 focus:ring-2 focus:ring-amber-600
      focus:outline-none focus:border-transparent
      transition-all"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="
    group
    w-full bg-gradient-to-r from-slate-950 to-slate-800
    text-white font-medium py-3 px-4 rounded-lg
    flex items-center justify-center gap-2
    transition disabled:opacity-50 cursor-pointer
  "
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Tracking...
                </>
              ) : (
                <>
                  {/* Icon changes color on hover */}
                  <Search className="w-5 h-5 text-white group-hover:text-amber-400 transition-colors" />
                  {/* Text changes color on hover */}
                  <span className="group-hover:text-amber-400 transition-colors">
                    Track Order
                  </span>
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}
          </form>
        </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Order #{order.orderId}
                  </h2>
                  <p className="text-gray-600">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                  <p className="text-sm text-gray-500">
                    Tracking Code: {order.trackingCode}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusIcon(order.status)}
                  <span
                    className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">
                    Customer Information
                  </h3>
                  <div className="space-y-1">
                    <p className="text-gray-900">{order.customerName}</p>
                    <p className="text-gray-600">{order.email}</p>
                    <p className="text-gray-600">{order.phone}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Shipping Address
                  </h3>
                  <p className="text-gray-600">
                    {order.address}, {order.district}, {order.city}
                  </p>
                  {order.carrier && (
                    <p className="text-sm text-gray-500 mt-1">
                      Carrier: {order.carrier}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </div>
                {order.estimatedDelivery && (
                  <p className="text-sm text-gray-500 mt-1">
                    Estimated Delivery: {formatDate(order.estimatedDelivery)}
                  </p>
                )}
              </div>
            </div>

            {/* Tracking History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-6">
                Tracking History
              </h3>
              <div className="space-y-4">
                {order.trackingHistory.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {getStatusIcon(item.status)}
                      </div>
                      {index < order.trackingHistory.length - 1 && (
                        <div className="h-6 w-0.5 bg-gray-200 mx-auto mt-1"></div>
                      )}
                    </div>
                    <div className="pb-4 flex-1">
                      <div className="flex justify-between mb-1">
                        <h4 className="font-medium text-gray-900">
                          {item.status}
                        </h4>
                        <span className="text-sm text-gray-500">
                          {formatDate(item.date)}
                        </span>
                      </div>
                      <p className="text-gray-600">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {!order && !error && (
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h3 className="font-bold text-lg text-gray-900 mb-4 text-center">
              How to Track Your Order
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-amber-600 font-bold">1</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Find Order ID
                </h4>
                <p className="text-sm text-gray-600">
                  Check your confirmation email
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-amber-600 font-bold">2</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Enter Details
                </h4>
                <p className="text-sm text-gray-600">
                  Input Order ID and Email
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-amber-600 font-bold">3</span>
                </div>
                <h4 className="font-medium text-gray-900 mb-2">
                  Track Package
                </h4>
                <p className="text-sm text-gray-600">
                  View delivery status and updates
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
