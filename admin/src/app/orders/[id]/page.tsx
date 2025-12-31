// // admin/src/app/orders/page.tsx

// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { 
//   ArrowLeft, Package, Truck, CheckCircle, Clock, User, Phone,
//   Mail, MapPin, DollarSign, CreditCard, Calendar, Printer, 
//   Download, Edit, MoreVertical, ChevronRight
// } from 'lucide-react';
// import { Order } from '../../../types/order';
// import { orderApi } from '../../../lib/order.api';

// export default function OrderDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const [order, setOrder] = useState<Order | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [updating, setUpdating] = useState(false);
//   const [trackingNumber, setTrackingNumber] = useState('');
//   const [notes, setNotes] = useState('');

//   useEffect(() => {
//     if (params.id) {
//       fetchOrder();
//     }
//   }, [params.id]);

//   const fetchOrder = async () => {
//     try {
//       const data = await orderApi.getOrder(params.id as string);
//       if (data.success) {
//         setOrder(data.data);
//         setTrackingNumber(data.data.trackingNumber || '');
//         setNotes(data.data.notes || '');
//       }
//     } catch (error) {
//       console.error('Error fetching order:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStatusChange = async (newStatus: string) => {
//     if (!order) return;
    
//     setUpdating(true);
//     try {
//       const data = await orderApi.updateOrderStatus(order._id, { 
//         status: newStatus,
//         notes,
//         trackingNumber 
//       });
      
//       if (data.success) {
//         setOrder(data.data);
//       }
//     } catch (error) {
//       console.error('Error updating status:', error);
//     } finally {
//       setUpdating(false);
//     }
//   };

//   const handleUpdateTracking = async () => {
//     if (!order) return;
    
//     try {
//       const data = await orderApi.updateOrderStatus(order._id, { 
//         trackingNumber,
//         notes
//       });
      
//       if (data.success) {
//         setOrder(data.data);
//       }
//     } catch (error) {
//       console.error('Error updating tracking:', error);
//     }
//   };

//   const formatCurrency = (amount: number) => {
//     return new Intl.NumberFormat('en-BD', {
//       style: 'currency',
//       currency: 'BDT',
//       minimumFractionDigits: 0
//     }).format(amount);
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric',
//       hour: '2-digit',
//       minute: '2-digit'
//     });
//   };

//   const getStatusColor = (status: string) => {
//     switch (status.toLowerCase()) {
//       case 'pending': return 'bg-amber-100 text-amber-800 border border-amber-200';
//       case 'confirmed': return 'bg-blue-100 text-blue-800 border border-blue-200';
//       case 'processing': return 'bg-purple-100 text-purple-800 border border-purple-200';
//       case 'shipped': return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
//       case 'delivered': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
//       case 'cancelled': return 'bg-red-100 text-red-800 border border-red-200';
//       default: return 'bg-gray-100 text-gray-800 border border-gray-200';
//     }
//   };

//   const getStatusSteps = () => {
//     if (!order) return [];
    
//     const steps = [
//       { id: 'pending', label: 'Order Placed', active: true },
//       { id: 'confirmed', label: 'Confirmed', active: ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status) },
//       { id: 'processing', label: 'Processing', active: ['processing', 'shipped', 'delivered'].includes(order.status) },
//       { id: 'shipped', label: 'Shipped', active: ['shipped', 'delivered'].includes(order.status) },
//       { id: 'delivered', label: 'Delivered', active: order.status === 'delivered' },
//     ];
    
//     return steps;
//   };

//   const calculateItemTotal = (item: Order['items'][0]) => {
//     return item.price * item.quantity;
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-96">
//         <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
//       </div>
//     );
//   }

//   if (!order) {
//     return (
//       <div className="text-center py-12">
//         <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
//         <button
//           onClick={() => router.push('/orders')}
//           className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
//         >
//           Back to Orders
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
//         <div className="flex items-center gap-3">
//           <button
//             onClick={() => router.push('/orders')}
//             className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
//           >
//             <ArrowLeft size={20} />
//           </button>
//           <div>
//             <h1 className="text-2xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
//             <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
//           </div>
//         </div>
        
//         <div className="flex items-center gap-3">
//           <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
//             <Printer size={18} />
//             Print
//           </button>
//           <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
//             <Download size={18} />
//             Export
//           </button>
//           <div className="relative">
//             <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
//               <MoreVertical size={20} />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Status & Actions */}
//       <div className="bg-white rounded-xl border border-gray-200 p-6">
//         <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//           <div className="flex-1">
//             <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Status</h3>
//             <div className="flex items-center gap-4">
//               <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
//                 {order.status.toUpperCase()}
//               </span>
              
//               <select
//                 value={order.status}
//                 onChange={(e) => handleStatusChange(e.target.value)}
//                 disabled={updating}
//                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//               >
//                 <option value="pending">Pending</option>
//                 <option value="confirmed">Confirmed</option>
//                 <option value="processing">Processing</option>
//                 <option value="shipped">Shipped</option>
//                 <option value="delivered">Delivered</option>
//                 <option value="cancelled">Cancelled</option>
//               </select>
//             </div>
//           </div>
          
//           <div className="w-full lg:w-64">
//             <h3 className="text-lg font-semibold text-gray-900 mb-3">Tracking Info</h3>
//             <div className="space-y-3">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                   Tracking Number
//                 </label>
//                 <input
//                   type="text"
//                   value={trackingNumber}
//                   onChange={(e) => setTrackingNumber(e.target.value)}
//                   placeholder="Enter tracking number"
//                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//                 />
//               </div>
//               <button
//                 onClick={handleUpdateTracking}
//                 className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium"
//               >
//                 Update Tracking
//               </button>
//             </div>
//           </div>
//         </div>
        
//         {/* Order Timeline */}
//         <div className="mt-6 pt-6 border-t border-gray-200">
//           <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Timeline</h3>
//           <div className="flex items-center justify-between">
//             {getStatusSteps().map((step, index) => (
//               <div key={step.id} className="flex flex-col items-center flex-1">
//                 <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${
//                   step.active 
//                     ? 'bg-amber-600 text-white' 
//                     : 'bg-gray-100 text-gray-400'
//                 }`}>
//                   {step.active ? <CheckCircle size={20} /> : <Clock size={20} />}
//                 </div>
//                 <span className={`text-sm font-medium ${
//                   step.active ? 'text-gray-900' : 'text-gray-400'
//                 }`}>
//                   {step.label}
//                 </span>
//                 {index < getStatusSteps().length - 1 && (
//                   <div className={`h-0.5 w-full absolute top-5 left-1/2 ${
//                     getStatusSteps()[index + 1].active 
//                       ? 'bg-amber-600' 
//                       : 'bg-gray-200'
//                   }`}></div>
//                 )}
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//         {/* Customer & Shipping Info */}
//         <div className="lg:col-span-2 space-y-6">
//           {/* Customer Information */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                 <div className="p-2 bg-white rounded-lg border border-gray-200">
//                   <User className="w-5 h-5 text-gray-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Customer Name</p>
//                   <p className="font-medium text-gray-900">{order.shippingInfo.fullName}</p>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                 <div className="p-2 bg-white rounded-lg border border-gray-200">
//                   <Phone className="w-5 h-5 text-gray-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Phone Number</p>
//                   <p className="font-medium text-gray-900">{order.shippingInfo.phone}</p>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                 <div className="p-2 bg-white rounded-lg border border-gray-200">
//                   <Mail className="w-5 h-5 text-gray-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Email Address</p>
//                   <p className="font-medium text-gray-900">{order.shippingInfo.email}</p>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                 <div className="p-2 bg-white rounded-lg border border-gray-200">
//                   <MapPin className="w-5 h-5 text-gray-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Delivery Area</p>
//                   <p className="font-medium text-gray-900">
//                     {order.deliveryType === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
//                   </p>
//                 </div>
//               </div>
              
//               <div className="md:col-span-2">
//                 <div className="p-4 bg-gray-50 rounded-lg">
//                   <p className="text-sm text-gray-600 mb-2">Shipping Address</p>
//                   <p className="font-medium text-gray-900">{order.shippingInfo.address}</p>
//                   <p className="text-gray-600">
//                     {order.shippingInfo.city}, {order.shippingInfo.district}, {order.shippingInfo.country}
//                   </p>
//                   {order.shippingInfo.deliveryInstructions && (
//                     <div className="mt-3 pt-3 border-t border-gray-200">
//                       <p className="text-sm text-gray-600">Delivery Instructions:</p>
//                       <p className="text-gray-900">{order.shippingInfo.deliveryInstructions}</p>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Order Items */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items ({order.items.length})</h3>
//             <div className="space-y-4">
//               {order.items.map((item, index) => (
//                 <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
//                   <img
//                     src={item.image}
//                     alt={item.title}
//                     className="w-20 h-20 object-cover rounded-lg border border-gray-200"
//                     onError={(e) => {
//                       e.currentTarget.src = 'https://via.placeholder.com/80';
//                       e.currentTarget.onerror = null;
//                     }}
//                   />
//                   <div className="flex-1">
//                     <h4 className="font-medium text-gray-900">{item.title}</h4>
//                     <div className="flex items-center gap-4 mt-2">
//                       {item.size && (
//                         <span className="text-sm text-gray-600">Size: {item.size}</span>
//                       )}
//                       {item.color && (
//                         <span className="text-sm text-gray-600">Color: {item.color}</span>
//                       )}
//                       <span className="text-sm text-gray-600">Qty: {item.quantity}</span>
//                     </div>
//                   </div>
//                   <div className="text-right">
//                     <p className="font-medium text-gray-900">{formatCurrency(item.price)}</p>
//                     <p className="text-lg font-bold text-gray-900">{formatCurrency(calculateItemTotal(item))}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Order Summary & Notes */}
//         <div className="space-y-6">
//           {/* Order Summary */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
//             <div className="space-y-3">
//               <div className="flex justify-between py-2">
//                 <span className="text-gray-600">Subtotal</span>
//                 <span className="font-medium text-gray-900">{formatCurrency(order.subtotal)}</span>
//               </div>
              
//               {order.discountTotal && order.discountTotal > 0 && (
//                 <div className="flex justify-between py-2">
//                   <span className="text-gray-600">Discount</span>
//                   <span className="font-medium text-emerald-600">-{formatCurrency(order.discountTotal)}</span>
//                 </div>
//               )}
              
//               <div className="flex justify-between py-2">
//                 <span className="text-gray-600">
//                   Shipping ({order.deliveryType === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})
//                 </span>
//                 <span className="font-medium text-gray-900">+{formatCurrency(order.shippingCharge)}</span>
//               </div>
              
//               <div className="border-t pt-3 mt-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-lg font-bold text-gray-900">Total</span>
//                   <span className="text-2xl font-bold text-amber-600">{formatCurrency(order.total)}</span>
//                 </div>
//                 <p className="text-sm text-gray-500 mt-1">Amount to collect upon delivery</p>
//               </div>
//             </div>
//           </div>

//           {/* Payment Information */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
//             <div className="space-y-3">
//               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                 <div className="p-2 bg-white rounded-lg border border-gray-200">
//                   <CreditCard className="w-5 h-5 text-gray-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Payment Method</p>
//                   <p className="font-medium text-gray-900">{order.paymentMethod.toUpperCase()}</p>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                 <div className="p-2 bg-white rounded-lg border border-gray-200">
//                   <DollarSign className="w-5 h-5 text-gray-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Payment Status</p>
//                   <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
//                     order.paymentStatus === 'paid' 
//                       ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
//                       : order.paymentStatus === 'pending'
//                       ? 'bg-amber-100 text-amber-800 border border-amber-200'
//                       : 'bg-red-100 text-red-800 border border-red-200'
//                   }`}>
//                     {order.paymentStatus.toUpperCase()}
//                   </span>
//                 </div>
//               </div>
              
//               <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
//                 <div className="p-2 bg-white rounded-lg border border-gray-200">
//                   <Calendar className="w-5 h-5 text-gray-600" />
//                 </div>
//                 <div>
//                   <p className="text-sm text-gray-600">Estimated Delivery</p>
//                   <p className="font-medium text-gray-900">{order.estimatedDelivery}</p>
//                 </div>
//               </div>
//             </div>
//           </div>

//           {/* Admin Notes */}
//           <div className="bg-white rounded-xl border border-gray-200 p-6">
//             <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Notes</h3>
//             <textarea
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//               placeholder="Add notes about this order..."
//               rows={4}
//               className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
//             />
//             <button
//               onClick={() => handleStatusChange(order.status)}
//               className="mt-3 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
//             >
//               Save Notes
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }