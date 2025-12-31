// "use client";

// import { useState, useEffect } from "react";
// import { 
//   ArrowLeft, 
//   Lock, 
//   Shield, 
//   Truck, 
//   CreditCard, 
//   Wallet, 
//   CheckCircle,
//   MapPin,
//   User,
//   Phone,
//   Mail,
//   AlertCircle,
//   Package,
//   Calendar,
//   ChevronRight,
//   Sparkles
// } from "lucide-react";
// import Link from "next/link";
// import { useCart } from "@/context/CartContext";
// import { useRouter } from "next/navigation";

// export default function CheckoutPage() {
//   const { cart, clearCart } = useCart();
//   const router = useRouter();

//   const [step, setStep] = useState(1);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isSuccess, setIsSuccess] = useState(false);
//   const [orderNumber, setOrderNumber] = useState("");
  
//   // Form states
//   const [shippingInfo, setShippingInfo] = useState({
//     fullName: "",
//     email: "",
//     phone: "",
//     address: "",
//     city: "",
//     zipCode: "",
//     country: "Bangladesh"
//   });

//   const [paymentMethod, setPaymentMethod] = useState("card");
//   const [cardInfo, setCardInfo] = useState({
//     number: "",
//     name: "",
//     expiry: "",
//     cvv: ""
//   });

//   const [errors, setErrors] = useState<Record<string, string>>({});

//   // Calculate totals
//   const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
//   const shippingCost = subtotal >= 5000 ? 0 : 150;
//   const tax = subtotal * 0.05;
//   const total = subtotal + shippingCost + tax;

//   // Generate order number
//   useEffect(() => {
//     setOrderNumber(`ORD-${Date.now().toString().slice(-8)}`);
//   }, []);

//   const validateStep1 = () => {
//     const newErrors: Record<string, string> = {};
    
//     if (!shippingInfo.fullName.trim()) newErrors.fullName = "Full name is required";
//     if (!shippingInfo.email.trim()) newErrors.email = "Email is required";
//     else if (!/^\S+@\S+\.\S+$/.test(shippingInfo.email)) newErrors.email = "Invalid email format";
    
//     if (!shippingInfo.phone.trim()) newErrors.phone = "Phone number is required";
//     else if (!/^[0-9]{11}$/.test(shippingInfo.phone)) newErrors.phone = "Invalid phone number";
    
//     if (!shippingInfo.address.trim()) newErrors.address = "Address is required";
//     if (!shippingInfo.city.trim()) newErrors.city = "City is required";
//     if (!shippingInfo.zipCode.trim()) newErrors.zipCode = "ZIP code is required";

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const validateStep2 = () => {
//     if (paymentMethod === "card") {
//       const newErrors: Record<string, string> = {};
      
//       if (!cardInfo.number.trim()) newErrors.cardNumber = "Card number is required";
//       else if (!/^[0-9]{16}$/.test(cardInfo.number.replace(/\s/g, ""))) newErrors.cardNumber = "Invalid card number";
      
//       if (!cardInfo.name.trim()) newErrors.cardName = "Name on card is required";
      
//       if (!cardInfo.expiry.trim()) newErrors.cardExpiry = "Expiry date is required";
//       else if (!/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(cardInfo.expiry)) newErrors.cardExpiry = "Invalid expiry (MM/YY)";
      
//       if (!cardInfo.cvv.trim()) newErrors.cardCvv = "CVV is required";
//       else if (!/^[0-9]{3,4}$/.test(cardInfo.cvv)) newErrors.cardCvv = "Invalid CVV";

//       setErrors(newErrors);
//       return Object.keys(newErrors).length === 0;
//     }
//     return true;
//   };

//   const handleNext = () => {
//     if (step === 1 && validateStep1()) {
//       setStep(2);
//     } else if (step === 2 && validateStep2()) {
//       handlePlaceOrder();
//     }
//   };

//   const handlePlaceOrder = async () => {
//     setIsProcessing(true);
    
//     // Simulate API call
//     await new Promise(resolve => setTimeout(resolve, 2000));
    
//     // Clear cart and show success
//     clearCart();
//     setIsProcessing(false);
//     setIsSuccess(true);
//   };

//   const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let value = e.target.value.replace(/\D/g, "");
//     if (value.length > 16) value = value.slice(0, 16);
    
//     // Add spaces for formatting
//     const formatted = value.replace(/(\d{4})/g, "$1 ").trim();
//     setCardInfo({ ...cardInfo, number: formatted });
//   };

//   const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let value = e.target.value.replace(/\D/g, "");
    
//     if (value.length >= 2) {
//       value = value.slice(0, 2) + "/" + value.slice(2, 4);
//     }
    
//     setCardInfo({ ...cardInfo, expiry: value });
//   };

//   // Success Modal
//   const SuccessModal = () => (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
//         <div className="p-8 text-center">
//           <div className="relative mb-6">
//             <div className="w-24 h-24 bg-gradient-to-br from-emerald-50 to-white rounded-full border border-emerald-100 flex items-center justify-center shadow-lg mx-auto">
//               <CheckCircle className="w-12 h-12 text-emerald-500" />
//             </div>
//             <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-500 animate-pulse" />
//           </div>
          
//           <h3 className="text-2xl font-bold text-slate-900 mb-3">Order Confirmed!</h3>
//           <p className="text-slate-600 mb-6">
//             Thank you for your purchase. Your order has been successfully placed.
//           </p>
          
//           <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
//             <p className="text-sm text-slate-500 mb-1">Order Number</p>
//             <p className="text-lg font-bold text-slate-900">{orderNumber}</p>
//             <p className="text-sm text-slate-500 mt-2">
//               We'll send a confirmation email to {shippingInfo.email}
//             </p>
//           </div>
          
//           <div className="space-y-3">
//             <button
//               onClick={() => router.push("/orders")}
//               className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold rounded-lg hover:from-amber-700 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl"
//             >
//               View Order Details
//             </button>
//             <button
//               onClick={() => router.push("/products")}
//               className="w-full py-3 border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors"
//             >
//               Continue Shopping
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );

//   // Loading Overlay
//   if (isProcessing) {
//     return (
//       <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 flex flex-col items-center justify-center">
//         <div className="text-center space-y-4">
//           <div className="relative">
//             <div className="animate-spin h-20 w-20 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
//             <Package className="absolute inset-0 m-auto h-10 w-10 text-amber-600" />
//           </div>
//           <div>
//             <h3 className="text-xl font-bold text-slate-900 mb-2">Processing Order</h3>
//             <p className="text-slate-600">Please wait while we confirm your order...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-12">
//       {/* Success Modal */}
//       {isSuccess && <SuccessModal />}

//       <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//         {/* Header */}
//         <div className="mb-10">
//           <div className="flex items-center justify-between mb-8">
//             <Link
//               href="/cart"
//               className="group flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
//             >
//               <ArrowLeft className="group-hover:-translate-x-1 transition-transform" size={20} />
//               Back to Cart
//             </Link>
            
//             <div className="flex items-center gap-2">
//               <Shield className="w-5 h-5 text-emerald-500" />
//               <span className="text-sm text-slate-600">Secure Checkout</span>
//               <Lock className="w-4 h-4 text-slate-500" />
//             </div>
//           </div>

//           <div className="text-center mb-12">
//             <h1 className="text-4xl font-bold text-slate-900 mb-4">Checkout</h1>
//             <p className="text-slate-600 max-w-2xl mx-auto">
//               Complete your purchase with secure payment. All transactions are encrypted and protected.
//             </p>
//           </div>

//           {/* Progress Steps */}
//           <div className="max-w-2xl mx-auto mb-12">
//             <div className="flex items-center justify-between">
//               {[1, 2, 3].map((s) => (
//                 <div key={s} className="flex items-center">
//                   <div className={`flex flex-col items-center ${s < 3 ? "flex-1" : ""}`}>
//                     <div className={`
//                       w-12 h-12 rounded-full flex items-center justify-center
//                       ${s < step ? "bg-emerald-500 text-white" : 
//                         s === step ? "bg-amber-600 text-white ring-4 ring-amber-100" : 
//                         "bg-slate-100 text-slate-400"}
//                       font-bold text-lg transition-all duration-300
//                     `}>
//                       {s < step ? <CheckCircle size={20} /> : s}
//                     </div>
//                     <span className={`
//                       mt-2 text-sm font-medium
//                       ${s <= step ? "text-slate-900" : "text-slate-400"}
//                     `}>
//                       {s === 1 ? "Shipping" : s === 2 ? "Payment" : "Confirm"}
//                     </span>
//                   </div>
                  
//                   {s < 3 && (
//                     <div className={`flex-1 h-1 mx-4 ${s < step ? "bg-emerald-500" : "bg-slate-200"}`} />
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
//           {/* Left Column - Forms */}
//           <div className="lg:col-span-2 space-y-8">
//             {/* Step 1: Shipping Information */}
//             {step === 1 && (
//               <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="p-2 bg-amber-50 rounded-lg">
//                     <MapPin className="w-5 h-5 text-amber-600" />
//                   </div>
//                   <h2 className="text-2xl font-bold text-slate-900">Shipping Information</h2>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       <User className="w-4 h-4 inline mr-1" />
//                       Full Name
//                     </label>
//                     <input
//                       type="text"
//                       value={shippingInfo.fullName}
//                       onChange={(e) => setShippingInfo({...shippingInfo, fullName: e.target.value})}
//                       className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition ${
//                         errors.fullName ? "border-red-300" : "border-slate-200"
//                       }`}
//                       placeholder="John Doe"
//                     />
//                     {errors.fullName && (
//                       <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                         <AlertCircle size={14} />
//                         {errors.fullName}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       <Mail className="w-4 h-4 inline mr-1" />
//                       Email Address
//                     </label>
//                     <input
//                       type="email"
//                       value={shippingInfo.email}
//                       onChange={(e) => setShippingInfo({...shippingInfo, email: e.target.value})}
//                       className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition ${
//                         errors.email ? "border-red-300" : "border-slate-200"
//                       }`}
//                       placeholder="john@example.com"
//                     />
//                     {errors.email && (
//                       <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                         <AlertCircle size={14} />
//                         {errors.email}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       <Phone className="w-4 h-4 inline mr-1" />
//                       Phone Number
//                     </label>
//                     <input
//                       type="tel"
//                       value={shippingInfo.phone}
//                       onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})}
//                       className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition ${
//                         errors.phone ? "border-red-300" : "border-slate-200"
//                       }`}
//                       placeholder="01XXXXXXXXX"
//                     />
//                     {errors.phone && (
//                       <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                         <AlertCircle size={14} />
//                         {errors.phone}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       City
//                     </label>
//                     <select
//                       value={shippingInfo.city}
//                       onChange={(e) => setShippingInfo({...shippingInfo, city: e.target.value})}
//                       className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition ${
//                         errors.city ? "border-red-300" : "border-slate-200"
//                       }`}
//                     >
//                       <option value="">Select City</option>
//                       <option value="dhaka">Dhaka</option>
//                       <option value="chittagong">Chittagong</option>
//                       <option value="sylhet">Sylhet</option>
//                       <option value="khulna">Khulna</option>
//                       <option value="rajshahi">Rajshahi</option>
//                     </select>
//                     {errors.city && (
//                       <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                         <AlertCircle size={14} />
//                         {errors.city}
//                       </p>
//                     )}
//                   </div>

//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       Full Address
//                     </label>
//                     <textarea
//                       value={shippingInfo.address}
//                       onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})}
//                       className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition h-32 resize-none ${
//                         errors.address ? "border-red-300" : "border-slate-200"
//                       }`}
//                       placeholder="House #, Road #, Area"
//                     />
//                     {errors.address && (
//                       <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                         <AlertCircle size={14} />
//                         {errors.address}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       ZIP Code
//                     </label>
//                     <input
//                       type="text"
//                       value={shippingInfo.zipCode}
//                       onChange={(e) => setShippingInfo({...shippingInfo, zipCode: e.target.value})}
//                       className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition ${
//                         errors.zipCode ? "border-red-300" : "border-slate-200"
//                       }`}
//                       placeholder="1230"
//                     />
//                     {errors.zipCode && (
//                       <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                         <AlertCircle size={14} />
//                         {errors.zipCode}
//                       </p>
//                     )}
//                   </div>

//                   <div>
//                     <label className="block text-sm font-medium text-slate-700 mb-2">
//                       Country
//                     </label>
//                     <input
//                       type="text"
//                       value={shippingInfo.country}
//                       readOnly
//                       className="w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-600"
//                     />
//                   </div>
//                 </div>

//                 <div className="mt-8 pt-6 border-t border-slate-200">
//                   <div className="flex items-center gap-3 text-slate-600">
//                     <Truck className="w-4 h-4" />
//                     <span className="text-sm">Standard delivery: 3-5 business days</span>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Step 2: Payment Method */}
//             {step === 2 && (
//               <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="p-2 bg-amber-50 rounded-lg">
//                     <CreditCard className="w-5 h-5 text-amber-600" />
//                   </div>
//                   <h2 className="text-2xl font-bold text-slate-900">Payment Method</h2>
//                 </div>

//                 {/* Payment Options */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//                   {[
//                     { id: "card", icon: CreditCard, label: "Credit/Debit Card", desc: "Pay with Visa, MasterCard, Amex" },
//                     { id: "cod", icon: Wallet, label: "Cash on Delivery", desc: "Pay when you receive your order" },
//                     { id: "bkash", icon: Wallet, label: "bKash", desc: "Pay via bKash mobile payment" },
//                     { id: "nagad", icon: Wallet, label: "Nagad", desc: "Pay via Nagad mobile payment" },
//                   ].map((method) => (
//                     <button
//                       key={method.id}
//                       onClick={() => setPaymentMethod(method.id)}
//                       className={`p-4 border rounded-xl text-left transition-all ${
//                         paymentMethod === method.id 
//                           ? "border-amber-500 bg-amber-50 ring-2 ring-amber-100" 
//                           : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
//                       }`}
//                     >
//                       <div className="flex items-start gap-3">
//                         <div className={`p-2 rounded-lg ${
//                           paymentMethod === method.id ? "bg-amber-100" : "bg-slate-100"
//                         }`}>
//                           <method.icon className={`w-5 h-5 ${
//                             paymentMethod === method.id ? "text-amber-600" : "text-slate-600"
//                           }`} />
//                         </div>
//                         <div>
//                           <h3 className="font-bold text-slate-900">{method.label}</h3>
//                           <p className="text-sm text-slate-500 mt-1">{method.desc}</p>
//                         </div>
//                       </div>
//                     </button>
//                   ))}
//                 </div>

//                 {/* Card Details Form */}
//                 {paymentMethod === "card" && (
//                   <div className="border-t border-slate-200 pt-6">
//                     <h3 className="font-bold text-slate-900 mb-4">Card Details</h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-slate-700 mb-2">
//                           Card Number
//                         </label>
//                         <div className="relative">
//                           <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
//                           <input
//                             type="text"
//                             value={cardInfo.number}
//                             onChange={handleCardNumberChange}
//                             className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition ${
//                               errors.cardNumber ? "border-red-300" : "border-slate-200"
//                             }`}
//                             placeholder="1234 5678 9012 3456"
//                             maxLength={19}
//                           />
//                         </div>
//                         {errors.cardNumber && (
//                           <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                             <AlertCircle size={14} />
//                             {errors.cardNumber}
//                           </p>
//                         )}
//                       </div>

//                       <div className="md:col-span-2">
//                         <label className="block text-sm font-medium text-slate-700 mb-2">
//                           Name on Card
//                         </label>
//                         <input
//                           type="text"
//                           value={cardInfo.name}
//                           onChange={(e) => setCardInfo({...cardInfo, name: e.target.value})}
//                           className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition ${
//                             errors.cardName ? "border-red-300" : "border-slate-200"
//                           }`}
//                           placeholder="JOHN DOE"
//                         />
//                         {errors.cardName && (
//                           <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                             <AlertCircle size={14} />
//                             {errors.cardName}
//                           </p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-2">
//                           Expiry Date
//                         </label>
//                         <input
//                           type="text"
//                           value={cardInfo.expiry}
//                           onChange={handleCardExpiryChange}
//                           className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition ${
//                             errors.cardExpiry ? "border-red-300" : "border-slate-200"
//                           }`}
//                           placeholder="MM/YY"
//                           maxLength={5}
//                         />
//                         {errors.cardExpiry && (
//                           <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                             <AlertCircle size={14} />
//                             {errors.cardExpiry}
//                           </p>
//                         )}
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-slate-700 mb-2">
//                           CVV
//                         </label>
//                         <div className="relative">
//                           <input
//                             type="password"
//                             value={cardInfo.cvv}
//                             onChange={(e) => setCardInfo({...cardInfo, cvv: e.target.value.replace(/\D/g, "")})}
//                             className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition ${
//                               errors.cardCvv ? "border-red-300" : "border-slate-200"
//                             }`}
//                             placeholder="123"
//                             maxLength={4}
//                           />
//                           <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
//                             <Lock className="w-4 h-4 text-slate-400" />
//                           </div>
//                         </div>
//                         {errors.cardCvv && (
//                           <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
//                             <AlertCircle size={14} />
//                             {errors.cardCvv}
//                           </p>
//                         )}
//                       </div>
//                     </div>

//                     {/* Security Badge */}
//                     <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
//                       <div className="flex items-center gap-3">
//                         <Shield className="w-5 h-5 text-emerald-500" />
//                         <div>
//                           <p className="font-medium text-slate-900">Secure Payment</p>
//                           <p className="text-sm text-slate-600">
//                             Your payment information is encrypted and secure. We never store your card details.
//                           </p>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 )}

//                 {/* COD Notice */}
//                 {paymentMethod === "cod" && (
//                   <div className="mt-6 p-4 bg-amber-50 rounded-xl border border-amber-100">
//                     <div className="flex items-start gap-3">
//                       <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
//                       <div>
//                         <p className="font-medium text-slate-900">Cash on Delivery Notice</p>
//                         <p className="text-sm text-slate-600 mt-1">
//                           You'll pay when you receive your order. An additional ৳50 service charge applies.
//                           Please have exact change ready.
//                         </p>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>

//           {/* Right Column - Order Summary */}
//           <div className="space-y-6">
//             {/* Order Summary */}
//             <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 sticky top-6">
//               <h2 className="text-2xl font-bold text-slate-900 mb-6">Order Summary</h2>
              
//               {/* Order Items */}
//               <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2">
//                 {cart.map((item) => (
//                   <div key={item.id} className="flex items-center gap-3 pb-4 border-b border-slate-100">
//                     <div className="w-16 h-16 rounded-lg overflow-hidden border border-slate-100">
//                       <img
//                         src={item.image}
//                         alt={item.title}
//                         className="w-full h-full object-cover"
//                         onError={(e) => {
//                           e.currentTarget.src = "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400&h=400&fit=crop";
//                           e.currentTarget.onerror = null;
//                         }}
//                       />
//                     </div>
//                     <div className="flex-1">
//                       <h4 className="font-medium text-slate-900 line-clamp-1">{item.title}</h4>
//                       <div className="flex items-center justify-between mt-1">
//                         <span className="text-sm text-slate-500">Qty: {item.quantity}</span>
//                         <span className="font-bold text-slate-900">
//                           ৳{(item.price * item.quantity).toLocaleString()}
//                         </span>
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </div>

//               {/* Price Breakdown */}
//               <div className="space-y-3 mb-6">
//                 <div className="flex justify-between items-center">
//                   <span className="text-slate-600">Subtotal</span>
//                   <span className="font-medium text-slate-900">৳{subtotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-slate-600">Shipping</span>
//                   <span className={`font-medium ${shippingCost === 0 ? "text-emerald-600" : "text-slate-900"}`}>
//                     {shippingCost === 0 ? "FREE" : `৳${shippingCost.toLocaleString()}`}
//                   </span>
//                 </div>
//                 <div className="flex justify-between items-center">
//                   <span className="text-slate-600">Tax (5%)</span>
//                   <span className="font-medium text-slate-900">৳{tax.toLocaleString()}</span>
//                 </div>
                
//                 {/* Free Shipping Progress */}
//                 {subtotal < 5000 && (
//                   <div className="mt-4 p-3 bg-slate-50 rounded-lg">
//                     <div className="flex items-center justify-between mb-2">
//                       <span className="text-xs font-medium text-slate-700">
//                         Free shipping at ৳5,000
//                       </span>
//                       <span className="text-xs font-bold text-amber-600">
//                         ৳{(5000 - subtotal).toLocaleString()} to go
//                       </span>
//                     </div>
//                     <div className="w-full bg-slate-200 rounded-full h-1.5">
//                       <div 
//                         className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full transition-all duration-500"
//                         style={{ width: `${Math.min((subtotal / 5000) * 100, 100)}%` }}
//                       ></div>
//                     </div>
//                   </div>
//                 )}
//               </div>

//               {/* Total */}
//               <div className="pt-4 border-t border-slate-200 mb-6">
//                 <div className="flex justify-between items-center">
//                   <span className="text-lg font-bold text-slate-900">Total</span>
//                   <span className="text-2xl font-bold text-amber-600">
//                     ৳{total.toLocaleString()}
//                   </span>
//                 </div>
//                 <p className="text-sm text-slate-500 mt-2">
//                   Includes all taxes and shipping charges
//                 </p>
//               </div>

//               {/* Action Button */}
//               <button
//                 onClick={handleNext}
//                 className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-bold rounded-xl hover:from-amber-700 hover:to-amber-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
//               >
//                 {step === 1 ? (
//                   <>
//                     Continue to Payment
//                     <ChevronRight className="w-5 h-5" />
//                   </>
//                 ) : (
//                   <>
//                     <Lock className="w-5 h-5" />
//                     Place Order
//                   </>
//                 )}
//               </button>

//               {/* Security Notice */}
//               <div className="mt-6 pt-6 border-t border-slate-200">
//                 <div className="flex items-center gap-2 text-slate-600 text-sm">
//                   <Shield className="w-4 h-4 text-emerald-500" />
//                   <span>SSL Encrypted • 256-bit Security</span>
//                 </div>
//                 <p className="text-xs text-slate-500 mt-2">
//                   By completing your purchase, you agree to our Terms of Service and Privacy Policy
//                 </p>
//               </div>
//             </div>

//             {/* Help Card */}
//             <div className="bg-gradient-to-r from-slate-50 to-white rounded-2xl border border-slate-100 p-6">
//               <h3 className="font-bold text-slate-900 mb-4">Need Help?</h3>
//               <div className="space-y-3">
//                 <div className="flex items-center gap-3">
//                   <Phone className="w-4 h-4 text-slate-500" />
//                   <div>
//                     <p className="text-sm font-medium text-slate-900">Call Us</p>
//                     <p className="text-sm text-slate-600">+880 1234-567890</p>
//                   </div>
//                 </div>
//                 <div className="flex items-center gap-3">
//                   <Mail className="w-4 h-4 text-slate-500" />
//                   <div>
//                     <p className="text-sm font-medium text-slate-900">Email Support</p>
//                     <p className="text-sm text-slate-600">support@example.com</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }