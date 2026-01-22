// client/src/app/cart/CODCheckoutModal.tsx

"use client";

import React, { memo } from "react";
import {
  Wallet,
  X,
  CheckCircle,
  RefreshCw,
  User,
  Phone,
  Mail,
  Calendar,
  Home,
  MapPin,
  Shield,
  Globe,
  Truck,
} from "lucide-react";

interface CODCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  shippingInfo: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    zipCode: string;
    country: string;
    deliveryInstructions: string;
  };
  setShippingInfo: React.Dispatch<
    React.SetStateAction<{
      fullName: string;
      email: string;
      phone: string;
      address: string;
      city: string;
      district: string;
      zipCode: string;
      country: string;
      deliveryInstructions: string;
    }>
  >;
  errors: Record<string, string>;
  cart: any[];
  subtotal: number;
  discountTotal?: number;
  shippingCharge: number;
  finalTotal: number;
  estimatedDelivery: string;
  isPlacingOrder: boolean;
  handlePlaceOrder: () => void;
  deliveryType: "dhaka" | "outside";
  setDeliveryType: (type: "dhaka" | "outside") => void;
}

const CODCheckoutModal = memo(function CODCheckoutModal({
  isOpen,
  onClose,
  shippingInfo,
  setShippingInfo,
  errors,
  cart,
  subtotal,
  discountTotal = 0,
  shippingCharge,
  finalTotal,
  estimatedDelivery,
  isPlacingOrder,
  handlePlaceOrder,
  deliveryType,
  setDeliveryType,
}: CODCheckoutModalProps) {
  if (!isOpen) return null;

  const handleInputChange = (field: string, value: string) => {
    setShippingInfo((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleDeliveryTypeChange = (type: "dhaka" | "outside") => {
    setDeliveryType(type);
    if (type === "dhaka") {
      setShippingInfo(prev => ({ ...prev, district: "Dhaka" }));
    } else {
      setShippingInfo(prev => ({ ...prev, district: "" }));
    }
  };

  // Calculate items count
  const itemsCount = cart.reduce((total, item) => total + (item.quantity || 1), 0);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Bangladeshi districts
  const bangladeshDistricts = [
    "Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Barisal", "Rangpur",
    "Mymensingh", "Comilla", "Narayanganj", "Gazipur", "Tangail", "Bogra", "Jessore",
    "Pabna", "Dinajpur", "Brahmanbaria", "Kushtia", "Noakhali", "Faridpur", "Manikganj",
    "Satkhira", "Jamalpur", "Magura", "Natore", "Chapainawabganj", "Lakshmipur"
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-300">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg shadow">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">
                  Cash on Delivery Checkout
                </h3>
                <p className="text-sm text-slate-600">
                  Complete your order with cash payment upon delivery
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-xl transition-colors duration-200"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Delivery Type Toggle */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-600" />
                Select Delivery Area
              </h3>
              <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                deliveryType === "dhaka" 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-amber-100 text-amber-700"
              }`}>
                {deliveryType === "dhaka" ? "৳80 Shipping" : "৳150 Shipping"}
              </span>
            </div>
            
            <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 p-1">
              <div className="grid grid-cols-2 gap-1">
                <button
                  onClick={() => handleDeliveryTypeChange("dhaka")}
                  className={`py-4 px-4 rounded-lg font-medium transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                    deliveryType === "dhaka"
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <MapPin className="w-5 h-5" />
                  <div className="text-center">
                    <div className="font-bold">Inside Dhaka</div>
                    <div className="text-xs opacity-90">৳80 shipping</div>
                  </div>
                </button>
                <button
                  onClick={() => handleDeliveryTypeChange("outside")}
                  className={`py-4 px-4 rounded-lg font-medium transition-all duration-300 flex flex-col items-center justify-center gap-2 ${
                    deliveryType === "outside"
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  <Globe className="w-5 h-5" />
                  <div className="text-center">
                    <div className="font-bold">Outside Dhaka</div>
                    <div className="text-xs opacity-90">৳150 shipping</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Shipping Form - Same as before, just use your existing handleInputChange */}
          <div className="space-y-5 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <h3 className="text-lg font-bold text-slate-900">
                Shipping Information
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  <User className="w-4 h-4 inline mr-2" />
                  Full Name *
                </label>
                <input
                  type="text"
                  value={shippingInfo.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  className={`w-full px-4 py-3 text-slate-800 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                    errors.fullName ? "border-red-400" : "border-slate-300"
                  }`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-sm text-red-600 mt-1">{errors.fullName}</p>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-2">
                <label className="block text-slate-800 text-sm font-semibold text-slate-700">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={shippingInfo.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={`w-full px-4 py-3 text-slate-800 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                    errors.phone ? "border-red-400" : "border-slate-300"
                  }`}
                  placeholder="01XXXXXXXXX"
                />
                {errors.phone && (
                  <p className="text-sm text-red-600 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Email Address */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  <Mail className="w-4 h-4 inline mr-2" />
                  Email Address *
                </label>
                <input
                  type="email"
                  value={shippingInfo.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={`w-full px-4 py-3 text-slate-800 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                    errors.email ? "border-red-400" : "border-slate-300"
                  }`}
                  placeholder="your.email@example.com"
                />
                {errors.email && (
                  <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                )}
              </div>

              {/* District Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  District *
                </label>
                <select
                  value={shippingInfo.district}
                  onChange={(e) => handleInputChange("district", e.target.value)}
                  className={`w-full px-4 py-3 text-slate-800 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                    errors.district ? "border-red-400" : "border-slate-300"
                  }`}
                  disabled={deliveryType === "dhaka"}
                >
                  {deliveryType === "dhaka" ? (
                    <option value="Dhaka">Dhaka</option>
                  ) : (
                    <>
                      <option value="">Select your district</option>
                      {bangladeshDistricts
                        .filter(d => d.toLowerCase() !== "dhaka")
                        .map((district) => (
                          <option key={district} value={district}>
                            {district}
                          </option>
                        ))}
                    </>
                  )}
                </select>
                {errors.district && (
                  <p className="text-sm text-red-600 mt-1">{errors.district}</p>
                )}
              </div>

              {/* City */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  City/Town *
                </label>
                <input
                  type="text"
                  value={shippingInfo.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={`w-full px-4 py-3 text-slate-800 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                    errors.city ? "border-red-400" : "border-slate-300"
                  }`}
                  placeholder="Enter your city"
                />
                {errors.city && (
                  <p className="text-sm text-red-600 mt-1">{errors.city}</p>
                )}
              </div>

              {/* ZIP Code */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={shippingInfo.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  className={`w-full px-4 py-3 text-slate-800 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition ${
                    errors.zipCode ? "border-red-400" : "border-slate-300"
                  }`}
                  placeholder="1230"
                />
                {errors.zipCode && (
                  <p className="text-sm text-red-600 mt-1">{errors.zipCode}</p>
                )}
              </div>

              {/* Full Address */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-semibold text-slate-700">
                  <Home className="w-4 h-4 inline mr-2" />
                  Full Address *
                </label>
                <textarea
                  value={shippingInfo.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className={`w-full px-4 py-3 text-slate-800 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition h-24 resize-none ${
                    errors.address ? "border-red-400" : "border-slate-300"
                  }`}
                  placeholder="House #, Road #, Area, Upazila/Thana"
                  rows={3}
                />
                {errors.address && (
                  <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                )}
              </div>

              {/* Delivery Instructions */}
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-slate-700">
                  Delivery Instructions (Optional)
                </label>
                <textarea
                  value={shippingInfo.deliveryInstructions}
                  onChange={(e) => handleInputChange("deliveryInstructions", e.target.value)}
                  className="w-full px-4 py-3 text-slate-800 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition h-20 resize-none"
                  placeholder="e.g., Call before delivery, Leave at gate, etc."
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="p-5 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <h4 className="text-lg font-bold text-slate-900">
                Order Summary
              </h4>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-200">
                <span className="text-slate-600">Subtotal ({itemsCount} items)</span>
                <span className="font-semibold text-slate-900">
                  {formatCurrency(subtotal)}
                </span>
              </div>
              
              {/* Discount Display */}
              {discountTotal > 0 && (
                <div className="flex justify-between py-2 border-b border-slate-200">
                  <span className="text-slate-600">Product Discounts</span>
                  <span className="font-semibold text-emerald-600">
                    -{formatCurrency(discountTotal)}
                  </span>
                </div>
              )}

              {/* Shipping Charge */}
              <div className="flex justify-between py-2 border-b border-slate-300">
                <div>
                  <span className="text-slate-600">Shipping Charge</span>
                  <p className="text-xs text-slate-500">
                    {deliveryType === "dhaka" ? "Inside Dhaka Delivery" : "Outside Dhaka Delivery"}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`font-semibold ${
                    deliveryType === "dhaka" ? "text-emerald-600" : "text-amber-600"
                  }`}>
                    +{formatCurrency(shippingCharge)}
                  </span>
                </div>
              </div>

              {/* Total */}
              <div className="pt-4 border-t border-slate-300">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold text-slate-900">
                    Total Payable
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-amber-600">
                      {formatCurrency(finalTotal)}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Pay upon delivery
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Estimated Delivery */}
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-white rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-blue-600 flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm text-slate-900 mb-1">
                    Estimated Delivery Date
                  </p>
                  <p className="text-sm text-slate-600">{estimatedDelivery}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Delivery within {deliveryType === "dhaka" ? "3" : "5"} business days
                  </p>
                </div>
              </div>
            </div>

            {/* Place Order Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="w-full mt-6 py-4 bg-gradient-to-r from-slate-900 to-slate-700 hover:from-slate-950 hover:to-slate-800 text-white font-bold rounded-xl transition-all duration-300 hover:shadow-xl flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed group"
            >
              {isPlacingOrder ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Processing Your Order...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Confirm Cash on Delivery Order</span>
                </>
              )}
            </button>

            {/* Security Assurance */}
            <div className="mt-4 pt-4 border-t border-slate-200 text-center">
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
                <Shield className="w-3 h-3" />
                <span>100% Secure Order • SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CODCheckoutModal;