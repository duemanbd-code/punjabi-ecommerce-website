// admin/src/app/orders/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { 
  Search, Filter, RefreshCw, FileDown, ChevronRight, Home,
  Clock, Package, Truck, CheckCircle, XCircle, DollarSign, User,
  Eye, X, ShoppingBag, MapPin, Phone, Calendar, CreditCard,
  Download, Printer, Share2
} from 'lucide-react';
import { orderApi } from '../../lib/order.api';
import { Order, OrderStats } from '../../types/order';
import AdminSidebar from '../../components/AdminSidebar';
import Topbar from '../../components/Topbar';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  
  // Order details modal state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, page]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderApi.getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
        page,
        limit: 50,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (data.success) {
        setOrders(data.data);
        setStats(data.stats);
        setTotalOrders(data.pagination?.total || data.data.length);
        setTotalPages(data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchOrders();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchOrders();
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await orderApi.updateOrderStatus(orderId, { status: newStatus });
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // CSV Export Functionality
  const handleExport = async () => {
    try {
      // Get all orders for export (with current filters applied)
      const exportData = await orderApi.getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search || undefined,
        page: 1,
        limit: 1000, // Get more orders for export
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      if (exportData.success && exportData.data.length > 0) {
        // Convert orders to CSV format
        const csvContent = convertToCSV(exportData.data);
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error exporting orders:', error);
      alert('Failed to export orders. Please try again.');
    }
  };

  const convertToCSV = (orders: Order[]) => {
    const headers = [
      'Order Number',
      'Customer Name',
      'Phone',
      'Email',
      'Address',
      'City',
      'District',
      'Order Date',
      'Items Count',
      'Total Amount',
      'Delivery Charge',
      'Grand Total',
      'Status',
      'Payment Method',
      'Payment Status',
      'Delivery Type'
    ];

    const rows = orders.map(order => [
      `"${order.orderNumber}"`,
      `"${order.shippingInfo.fullName}"`,
      `"${order.shippingInfo.phone}"`,
      `"${order.shippingInfo.email || ''}"`,
      `"${order.shippingInfo.address}"`,
      `"${order.shippingInfo.city}"`,
      `"${order.shippingInfo.district}"`,
      `"${formatDate(order.createdAt)}"`,
      order.items.length,
      order.total,
      order.deliveryCharge,
      order.total + order.deliveryCharge,
      order.status,
      order.paymentMethod || '',
      order.paymentStatus,
      order.deliveryType
    ]);

    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'processing':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      case 'shipped':
        return 'bg-indigo-100 text-indigo-800 border border-indigo-200';
      case 'delivered':
        return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Clock size={14} />;
      case 'confirmed':
        return <CheckCircle size={14} />;
      case 'processing':
        return <Package size={14} />;
      case 'shipped':
        return <Truck size={14} />;
      case 'delivered':
        return <CheckCircle size={14} />;
      case 'cancelled':
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  const openOrderModal = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-4 md:p-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Orders
                </h1>
                <p className="text-gray-600 mt-1">
                  Manage and track {totalOrders} customer orders
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
                  title="Refresh orders"
                >
                  <RefreshCw
                    size={18}
                    className={`${refreshing ? 'animate-spin' : ''}`}
                  />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  title="Export orders as CSV"
                >
                  <FileDown size={18} />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                        <Package className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Orders</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stats.totalOrders}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Pending</p>
                        <p className="text-2xl font-bold text-amber-600">
                          {stats.pendingOrders}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg border border-green-100">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Delivered</p>
                        <p className="text-2xl font-bold text-green-600">
                          {stats.deliveredOrders}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <form onSubmit={handleSearch} className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search orders by ID, customer name, phone..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch(e)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>
                </form>

                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>

                  <button
                    onClick={() => {
                      setPage(1);
                      fetchOrders();
                    }}
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors"
                  >
                    <Filter size={18} className="inline mr-2" />
                    Filter
                  </button>
                </div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                        Order #
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                        Customer
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                        Date
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                        Items
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                        Amount
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                        View
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {orders.map((order) => (
                      <tr
                        key={order._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.deliveryType === 'dhaka'
                              ? 'Inside Dhaka'
                              : 'Outside Dhaka'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {order.shippingInfo.fullName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.shippingInfo.phone}
                          </div>
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">
                            {order.shippingInfo.city},{' '}
                            {order.shippingInfo.district}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {formatDate(order.createdAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.createdAt).toLocaleTimeString(
                              'en-US',
                              {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: true,
                              }
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-900">
                            {order.items.length} item
                            {order.items.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-500">
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0
                            )}{' '}
                            units
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">
                            {formatCurrency(order.total)}
                          </div>
                          {order.deliveryCharge > 0 && (
                            <div className="text-xs text-gray-500">
                              +{formatCurrency(order.deliveryCharge)} shipping
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-col gap-2">
                            <span
                              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )} w-fit`}
                            >
                              {getStatusIcon(order.status)}
                              {order.status}
                            </span>
                            <select
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                              className="text-xs border border-gray-300 rounded px-2 py-1.5 focus:ring-1 focus:ring-amber-500 bg-white w-full max-w-[120px]"
                            >
                              <option value="pending">Pending</option>
                              <option value="confirmed">Confirmed</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => openOrderModal(order)}
                            className="p-1.5 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="View Order Details"
                          >
                            <Eye size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No orders found
                  </h3>
                  <p className="text-gray-500 mb-6 max-w-md mx-auto">
                    {search || statusFilter !== 'all'
                      ? 'Try adjusting your filters or search terms'
                      : 'Wait for customers to place orders'}
                  </p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <div className="text-sm text-gray-600">
                      Showing {orders.length} of {totalOrders} orders
                    </div>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="text-sm text-gray-700">
                        Page {page} of {totalPages}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setPage((prev) => Math.max(1, prev - 1))
                          }
                          disabled={page === 1}
                          className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Previous
                        </button>
                        <div className="flex items-center gap-1">
                          {Array.from(
                            { length: Math.min(5, totalPages) },
                            (_, i) => {
                              let pageNum;
                              if (totalPages <= 5) {
                                pageNum = i + 1;
                              } else if (page <= 3) {
                                pageNum = i + 1;
                              } else if (page >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                              } else {
                                pageNum = page - 2 + i;
                              }

                              return (
                                <button
                                  key={pageNum}
                                  onClick={() => setPage(pageNum)}
                                  className={`w-8 h-8 rounded text-sm transition-colors ${
                                    page === pageNum
                                      ? 'bg-amber-600 text-white'
                                      : 'hover:bg-gray-100 text-gray-700 border border-gray-300'
                                  }`}
                                >
                                  {pageNum}
                                </button>
                              );
                            }
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setPage((prev) => Math.min(totalPages, prev + 1))
                          }
                          disabled={page === totalPages}
                          className="px-3 py-1.5 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Order #{selectedOrder.orderNumber}
                </h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    {selectedOrder.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    <Calendar size={14} className="inline mr-1" />
                    {formatDateTime(selectedOrder.createdAt)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    // Generate and download order as PDF/CSV
                    const orderCsv = [
                      ['Order Number', selectedOrder.orderNumber],
                      ['Date', formatDateTime(selectedOrder.createdAt)],
                      ['Status', selectedOrder.status],
                      ['Customer Name', selectedOrder.shippingInfo.fullName],
                      ['Phone', selectedOrder.shippingInfo.phone],
                      ['Address', selectedOrder.shippingInfo.address],
                      ['City', selectedOrder.shippingInfo.city],
                      ['District', selectedOrder.shippingInfo.district],
                      ['Total', formatCurrency(selectedOrder.total)],
                      ['Delivery', formatCurrency(selectedOrder.deliveryCharge)],
                      ['Grand Total', formatCurrency(selectedOrder.total + selectedOrder.deliveryCharge)],
                      ['Payment Method', selectedOrder.paymentMethod || 'N/A'],
                      ['Payment Status', selectedOrder.paymentStatus],
                      ['Delivery Type', selectedOrder.deliveryType === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'],
                    ].map(row => row.join(',')).join('\n');
                    
                    const blob = new Blob([orderCsv], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `order_${selectedOrder.orderNumber}.csv`;
                    a.click();
                  }}
                  className="p-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                  title="Download Order"
                >
                  <Download size={20} />
                </button>
                <button
                  onClick={closeOrderModal}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Customer Information */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User size={20} />
                      Customer Information
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                          <User size={24} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedOrder.shippingInfo.fullName}</p>
                          <div className="flex items-center gap-3 text-sm text-gray-600">
                            <span className="flex items-center gap-1">
                              <Phone size={14} />
                              {selectedOrder.shippingInfo.phone}
                            </span>
                            {selectedOrder.shippingInfo.email && (
                              <span>{selectedOrder.shippingInfo.email}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="border-t border-gray-200 pt-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="text-gray-400 mt-1 flex-shrink-0" size={18} />
                          <div>
                            <p className="font-medium text-gray-900">Shipping Address</p>
                            <p className="text-gray-600">{selectedOrder.shippingInfo.address}</p>
                            <p className="text-gray-600">
                              {selectedOrder.shippingInfo.city}, {selectedOrder.shippingInfo.district}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <ShoppingBag size={20} />
                      Order Items ({selectedOrder.items.length})
                    </h3>
                    <div className="space-y-4">
                      {selectedOrder.items.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package size={24} className="text-gray-400" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              {item.variant && (
                                <p className="text-sm text-gray-600">
                                  {item.variant.size && `Size: ${item.variant.size} `}
                                  {item.variant.color && `Color: ${item.variant.color}`}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">{formatCurrency(item.price)}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            <p className="text-sm font-medium text-gray-900">
                              Total: {formatCurrency(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(selectedOrder.total)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Delivery Charge</span>
                        <span>{formatCurrency(selectedOrder.deliveryCharge)}</span>
                      </div>
                      <div className="border-t border-gray-200 pt-3">
                        <div className="flex justify-between font-bold text-lg text-gray-900">
                          <span>Total Amount</span>
                          <span>{formatCurrency(selectedOrder.total + selectedOrder.deliveryCharge)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <CreditCard size={20} />
                      Payment Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Method</span>
                        <span className="font-medium">{selectedOrder.paymentMethod || 'Cash on Delivery'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Payment Status</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedOrder.paymentStatus === 'paid' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {selectedOrder.paymentStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery Type</span>
                        <span className="font-medium">
                          {selectedOrder.deliveryType === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
                    <div className="space-y-3">
                      <select
                        value={selectedOrder.status}
                        onChange={(e) => {
                          handleStatusChange(selectedOrder._id, e.target.value);
                          closeOrderModal();
                        }}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <button
                        onClick={closeOrderModal}
                        className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-medium transition-colors"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}