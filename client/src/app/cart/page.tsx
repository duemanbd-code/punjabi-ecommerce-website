// client/src/app/cart/page.tsx

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  ArrowLeft,
  AlertTriangle,
  X,
  CheckCircle,
  Truck,
  Shield,
  RefreshCw,
  Wallet,
  Package,
  Clock,
  MapPin,
  Globe,
  ArrowRight,
  Sparkles,
  Percent,
  TrendingUp,
  Receipt,
  Smartphone,
  Gift,
  BadgePercent,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart, CartItem } from "@/context/CartContext";
import { toast } from "react-hot-toast";
import CODCheckoutModal from "./CODCheckoutModal";

export default function CartPage() {
  const router = useRouter();
  const {
    cart,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
    getCartCount,
    totalItems,
  } = useCart();

  // State for checkout
  const [showCheckout, setShowCheckout] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [removingItemId, setRemovingItemId] = useState<string | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Delivery type and order data
  const [deliveryType, setDeliveryType] = useState<"dhaka" | "outside">("dhaka");
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    district: "Dhaka",
    zipCode: "",
    country: "Bangladesh",
    deliveryInstructions: "",
  });
  const [orderNumber, setOrderNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("");

  // ✅ FIXED: Properly define API_URL with fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Form validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculate totals based on delivery type
  const calculateTotals = useCallback(() => {
    let subtotal = 0;
    let discountTotal = 0;
    let itemsCount = 0;

    cart.forEach((item) => {
      // Determine the price to use for calculation
      let effectivePrice = item.price;
      let itemNormalPrice = item.normalPrice || item.originalPrice || item.price;
      
      // Check if there's an offer price
      if (item.offerPrice && item.offerPrice < itemNormalPrice) {
        effectivePrice = item.offerPrice;
      }
      // Check if there's a sale price
      else if (item.salePrice && item.salePrice < itemNormalPrice) {
        effectivePrice = item.salePrice;
      }
      
      subtotal += effectivePrice * item.quantity;
      
      // Calculate discount if any
      if (effectivePrice < itemNormalPrice) {
        discountTotal += (itemNormalPrice - effectivePrice) * item.quantity;
      }
      
      itemsCount += item.quantity;
    });

    // Shipping charge based on delivery type
    const shippingCharge = deliveryType === "dhaka" ? 50 : 80;
    const finalTotal = subtotal + shippingCharge;

    return {
      subtotal,
      discountTotal,
      shippingCharge,
      finalTotal,
      itemsCount,
      deliveryType,
    };
  }, [cart, deliveryType]);

  const totals = calculateTotals();

  // Generate order number and delivery date
  useEffect(() => {
    if (cart.length > 0 && !orderNumber) {
      const timestamp = Date.now().toString().slice(-8);
      const random = Math.random().toString(36).substr(2, 4).toUpperCase();
      setOrderNumber(`ORD-${timestamp}-${random}`);
      
      // Generate estimated delivery date
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + (deliveryType === "dhaka" ? 3 : 5));
      const options: Intl.DateTimeFormatOptions = {
        weekday: "long",
        month: "long",
        day: "numeric",
      };
      setEstimatedDelivery(deliveryDate.toLocaleDateString("en-US", options));
    }
  }, [cart.length, orderNumber, deliveryType]);

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!shippingInfo.fullName.trim())
      newErrors.fullName = "Full name is required";
    if (!shippingInfo.email.trim()) newErrors.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(shippingInfo.email))
      newErrors.email = "Invalid email format";

    if (!shippingInfo.phone.trim())
      newErrors.phone = "Phone number is required";
    else if (!/^[0-9]{11}$/.test(shippingInfo.phone))
      newErrors.phone = "Invalid phone number (11 digits required)";

    if (!shippingInfo.address.trim()) newErrors.address = "Address is required";
    if (!shippingInfo.city.trim()) newErrors.city = "City is required";
    if (!shippingInfo.district.trim()) newErrors.district = "District is required";
    if (!shippingInfo.zipCode.trim())
      newErrors.zipCode = "ZIP code is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // ✅ FIXED: Place order function with proper API_URL
  const placeOrder = async () => {
    if (!validateForm()) return;

    setIsPlacingOrder(true);

    try {
      // Transform cart items to match backend order item interface
      const orderItems = cart.map(item => ({
        productId: item.id || item._id,
        title: item.title || item.name,
        price: item.offerPrice || item.salePrice || item.price,
        normalPrice: item.normalPrice || item.price,
        originalPrice: item.originalPrice,
        image: item.image,
        quantity: item.quantity,
        size: item.size || "M",
        color: item.color || undefined,
        category: item.category,
      }));

      // Order data that matches backend schema
      const orderData = {
        orderNumber,
        shippingInfo,
        paymentMethod: "cod",
        deliveryType,
        items: orderItems,
        subtotal: totals.subtotal,
        discount: totals.discountTotal || 0,
        shippingCharge: totals.shippingCharge,
        total: totals.finalTotal,
        estimatedDelivery,
        status: "pending",
        paymentStatus: "pending",
      };

      console.log('Sending order data:', orderData);
      console.log('API_URL:', API_URL);
      console.log('Fetch URL:', `${API_URL}/api/orders`);

      // ✅ FIXED: Use backticks for template literal
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('Server response:', data);

      if (data.success) {
        // Clear cart
        clearCart();
        
        // Show success modal
        setShowSuccessModal(true);
        setShowCheckout(false);
        
        // Redirect to order confirmation page
        if (data.data && data.data._id) {
          router.push(`/order-confirmation/${data.data._id}`);
        } else if (data.order && data.order._id) {
          router.push(`/order-confirmation/${data.order._id}`);
        } else if (data.orderId) {
          router.push(`/order-confirmation/${data.orderId}`);
        }
        
        toast.success("Order placed successfully!");
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error: any) {
      console.error("Error placing order:", error);
      toast.error(error.message || "Failed to place order. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate item discount
  const calculateItemDiscount = (item: CartItem) => {
    const itemPrice = item.price;
    const itemNormalPrice = item.normalPrice || item.originalPrice || itemPrice;
    const hasOffer = item.offerPrice !== undefined && item.offerPrice < itemNormalPrice;
    
    if (hasOffer && item.offerPrice) {
      const discount = itemNormalPrice - item.offerPrice;
      const discountPercentage = Math.round((discount / itemNormalPrice) * 100);
      const discountAmount = discount * item.quantity;
      return { 
        discount, 
        discountPercentage, 
        discountAmount,
        effectivePrice: item.offerPrice,
        hasOffer: true 
      };
    }
    return { 
      discount: 0, 
      discountPercentage: 0, 
      discountAmount: 0,
      effectivePrice: itemPrice,
      hasOffer: false 
    };
  };

  // Item Removal Modal
  const ItemRemovalModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blu">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Remove Item</h3>
            </div>
            <button
              onClick={() => setRemovingItemId(null)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <p className="text-slate-700 mb-6 text-center">
            Are you sure you want to remove this item from your cart?
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setRemovingItemId(null)}
              className="flex-1 py-3 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (removingItemId) removeFromCart(removingItemId);
                setRemovingItemId(null);
                toast.success("Item removed from cart");
              }}
              className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-medium rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
            >
              <Trash2 className="w-4 h-4 inline mr-2" />
              Remove Item
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Clear Cart Modal
  const ClearCartModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Clear Cart</h3>
            </div>
            <button
              onClick={() => setShowClearConfirm(false)}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <ShoppingCart className="w-16 h-16 text-red-400" />
              <Trash2 className="absolute bottom-0 right-0 w-8 h-8 text-red-600" />
            </div>
          </div>
          <p className="text-center text-slate-700 mb-2">
            Are you sure you want to clear your entire cart?
          </p>
          <p className="text-center text-slate-500 text-sm mb-6">
            This will remove{" "}
            <span className="font-bold text-red-600">{cart.length} items</span>{" "}
            permanently.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowClearConfirm(false)}
              className="flex-1 py-3 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                clearCart();
                setShowClearConfirm(false);
                toast.success("Cart cleared");
              }}
              className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
            >
              <Trash2 className="w-5 h-5" />
              Clear All Items
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Success Modal
  const SuccessModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="p-8 text-center">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-white rounded-full border border-emerald-100 flex items-center justify-center shadow-lg mx-auto">
              <CheckCircle className="w-12 h-12 text-emerald-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-3">
            Order Confirmed! 🎉
          </h3>
          <p className="text-slate-600 mb-6">
            Thank you for your order. We'll deliver it to you soon.
          </p>

          <div className="bg-slate-50 rounded-xl p-6 mb-6 border border-slate-100">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Receipt className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-slate-600">
                Order Number
              </span>
            </div>
            <p className="text-xl font-bold text-slate-900 mb-4">
              {orderNumber}
            </p>

            <div className="space-y-3 text-left">
              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Estimated Delivery</p>
                  <p className="font-medium text-slate-900">
                    {estimatedDelivery}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Wallet className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Payment Method</p>
                  <p className="font-medium text-slate-900">Cash on Delivery</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">Delivery Area</p>
                  <p className="font-medium text-slate-900">
                    {deliveryType === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Smartphone className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-sm text-slate-600">We'll contact you at</p>
                  <p className="font-medium text-slate-900">
                    {shippingInfo.phone}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-2">
                Amount to pay upon delivery
              </p>
              <p className="text-2xl font-bold text-amber-600">
                {formatCurrency(totals.finalTotal)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Includes {formatCurrency(totals.shippingCharge)} shipping charge
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => {
                setShowSuccessModal(false);
                router.push("/");
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => {
                setShowSuccessModal(false);
                // Note: You'll need to store the order ID to track
                toast.success("Order tracking will be available soon!");
              }}
              className="w-full py-3 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
            >
              Track My Order
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="relative mb-8">
          <div className="w-32 h-32 bg-gradient-to-br from-amber-50 to-white rounded-full border border-amber-100 flex items-center justify-center shadow-lg">
            <ShoppingCart className="w-16 h-16 text-amber-400" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-3">
          Your Cart is Empty
        </h2>
        <p className="text-slate-600 mb-8 max-w-md">
          Looks like you haven't added any products to your cart yet. Start
          shopping now!
        </p>
        <Link
          href="/all-collections"
          className="group px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-3"
        >
          <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50 py-12">
      {/* Modals */}
      {removingItemId && <ItemRemovalModal />}
      {showClearConfirm && <ClearCartModal />}
      {showCheckout && (
        <CODCheckoutModal
          isOpen={showCheckout}
          onClose={() => setShowCheckout(false)}
          shippingInfo={shippingInfo}
          setShippingInfo={setShippingInfo}
          errors={errors}
          cart={cart}
          subtotal={totals.subtotal}
          discountTotal={totals.discountTotal}
          shippingCharge={totals.shippingCharge}
          finalTotal={totals.finalTotal}
          estimatedDelivery={estimatedDelivery}
          isPlacingOrder={isPlacingOrder}
          handlePlaceOrder={placeOrder}
          deliveryType={deliveryType}
          setDeliveryType={setDeliveryType}
        />
      )}
      {showSuccessModal && <SuccessModal />}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-100">
              <ShoppingCart className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900">
                Shopping Cart
              </h1>
              <p className="text-slate-600 mt-2">
                <span className="font-semibold text-slate-900">
                  {getCartCount()}
                </span>{" "}
                item{getCartCount() !== 1 ? "s" : ""} in your cart
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => {
              const { discountPercentage, discountAmount, effectivePrice, hasOffer } = calculateItemDiscount(item);
              const itemTotal = effectivePrice * item.quantity;
              const itemNormalPrice = item.normalPrice || item.originalPrice || item.price;

              return (
                <div
                  key={`${item.id}-${item.size || ''}-${item.color || ''}`}
                  className="group bg-white rounded-2xl shadow-lg border border-slate-100 p-6 hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Product Image */}
                    <div className="relative">
                      <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-100">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop";
                            e.currentTarget.onerror = null;
                          }}
                        />
                      </div>
                      
                      {/* Offer Badge */}
                      {hasOffer && discountPercentage > 0 && (
                        <div className="absolute -top-2 -right-2">
                          <div className="px-3 py-1.5 bg-gradient-to-r from-rose-500 to-rose-600 text-white text-xs font-bold rounded-full shadow-lg">
                            {discountPercentage}% OFF
                          </div>
                        </div>
                      )}
                      
                      {item.quantity > 1 && (
                        <div className="absolute -top-2 left-2 bg-amber-600 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg">
                          ×{item.quantity}
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                            {item.title}
                          </h3>
                          {item.category && (
                            <p className="text-slate-600 text-sm mb-3">
                              {item.category}
                            </p>
                          )}

                          {/* Size and Color Badges */}
                          <div className="flex flex-wrap gap-3 mb-4">
                            {item.size && (
                              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full border border-slate-200">
                                Size: {item.size}
                              </span>
                            )}
                            {item.color && (
                              <span className="px-3 py-1 bg-slate-100 text-slate-700 text-sm rounded-full border border-slate-200">
                                Color: {item.color}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-slate-900">
                            {formatCurrency(itemTotal)}
                          </p>
                          <p className="text-slate-500 text-sm">
                            {formatCurrency(effectivePrice)} each
                          </p>
                          
                          {/* Show original price if offer exists */}
                          {hasOffer && itemNormalPrice > effectivePrice && (
                            <>
                              <p className="text-slate-400 text-sm line-through">
                                {formatCurrency(itemNormalPrice * item.quantity)}
                              </p>
                              <p className="text-xs font-medium text-emerald-600">
                                Save {formatCurrency(discountAmount)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => decreaseQty(item.id)}
                            disabled={item.quantity <= 1}
                            className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow"
                          >
                            <Minus className="w-4 h-4 text-slate-700" />
                          </button>

                          <span className="w-16 text-center font-bold text-lg text-slate-900">
                            {item.quantity}
                          </span>

                          <button
                            onClick={() => increaseQty(item.id)}
                            className="w-10 h-10 flex items-center justify-center border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm hover:shadow"
                          >
                            <Plus className="w-4 h-4 text-slate-700" />
                          </button>
                        </div>

                        <button
                          onClick={() => setRemovingItemId(item.id)}
                          className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium transition-colors px-4 py-2 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Clear Cart Button */}
            <div className="flex justify-end pt-4">
              <button
                onClick={() => setShowClearConfirm(true)}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-400 text-white font-medium rounded-lg hover:from-red-600 hover:to-red-500 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear Entire Cart
              </button>
            </div>
          </div>

          {/* Cart Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 pb-4 border-b border-slate-200">
                Order Summary
              </h2>

              {/* Delivery Type Toggle */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900 flex items-center gap-2">
                    <Package className="w-4 h-4 text-amber-600" />
                    Delivery Area
                  </h3>
                  <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                    deliveryType === "dhaka" 
                      ? "bg-emerald-100 text-emerald-700" 
                      : "bg-amber-100 text-amber-700"
                  }`}>
                    {deliveryType === "dhaka" ? "৳50 Shipping" : "৳80 Shipping"}
                  </span>
                </div>
                
                <div className="bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-200 p-1">
                  <div className="grid grid-cols-2 gap-1">
                    <button
                      onClick={() => setDeliveryType("dhaka")}
                      className={`py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                        deliveryType === "dhaka"
                          ? "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      Inside Dhaka
                    </button>
                    <button
                      onClick={() => setDeliveryType("outside")}
                      className={`py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
                        deliveryType === "outside"
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Globe className="w-4 h-4" />
                      Outside Dhaka
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-slate-600">Subtotal ({totals.itemsCount} items)</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(totals.subtotal)}
                  </span>
                </div>

                {/* Discount from Offers */}
                {totals.discountTotal > 0 && (
                  <div className="flex justify-between items-center py-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <BadgePercent className="w-4 h-4 text-emerald-600" />
                      <span className="text-slate-600">Product Discounts</span>
                    </div>
                    <span className="font-bold text-emerald-600">
                      -{formatCurrency(totals.discountTotal)}
                    </span>
                  </div>
                )}

                {/* Shipping Charge Display */}
                <div className="flex justify-between items-center py-3 border-b border-slate-300">
                  <div className="flex items-center gap-2">
                    <Truck className={`w-4 h-4 ${deliveryType === "dhaka" ? "text-emerald-600" : "text-amber-600"}`} />
                    <div>
                      <span className="text-slate-600">Shipping Charge</span>
                      <p className="text-xs text-slate-500">
                        {deliveryType === "dhaka" ? "Inside Dhaka" : "Outside Dhaka"}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`font-bold ${deliveryType === "dhaka" ? "text-emerald-600" : "text-amber-600"}`}>
                      +{formatCurrency(totals.shippingCharge)}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <div className="flex justify-between items-center text-xl font-bold">
                    <span className="text-slate-900">Total Payable</span>
                    <span className="text-amber-600 text-2xl">
                      {formatCurrency(totals.finalTotal)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 mt-2 text-center">
                    Pay upon delivery
                  </p>
                  
                  {/* Savings Summary */}
                  {totals.discountTotal > 0 && (
                    <div className="mt-3 p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg border border-emerald-100">
                      <p className="text-sm text-emerald-700 text-center">
                        🎉 You saved {formatCurrency(totals.discountTotal)} on this order!
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-700 text-white font-bold rounded-xl hover:from-slate-950 hover:to-slate-800 transition-all shadow-lg hover:shadow-xl mb-4 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wallet className="w-5 h-5" />
                Proceed with Cash on Delivery
              </button>

              <Link
                href="/products"
                className="w-full py-3.5 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Continue Shopping
              </Link>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Truck className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="text-sm text-slate-600">
                      Nationwide Delivery
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <Shield className="w-4 h-4 text-slate-600" />
                    </div>
                    <span className="text-sm text-slate-600">Secure Order</span>
                  </div>
                </div>
                <p className="text-xs text-slate-500 text-center">
                  ✅ Cash on Delivery • 🔒 100% Secure • 🚚 3-5 Day Delivery
                </p>
              </div>

              {/* Cart Stats */}
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600">Items in cart</p>
                    <p className="text-xl font-bold text-slate-900">
                      {getCartCount()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">Total value</p>
                    <p className="text-xl font-bold text-amber-600">
                      {formatCurrency(totals.subtotal)}
                    </p>
                  </div>
                </div>
                {totals.discountTotal > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-center">
                    <p className="text-sm text-emerald-600">
                      ✨ Total savings: {formatCurrency(totals.discountTotal)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}