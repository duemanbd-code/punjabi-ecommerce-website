// admin/src/app/dashboard/page.tsx

"use client";

import { useEffect, useState } from "react";
import {
  ShoppingCart,
  DollarSign,
  Clock,
  CheckCircle,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  PieChart as PieChartIcon,
  BarChart3,
} from "lucide-react";
import AdminSidebar from "../../components/AdminSidebar";
import Topbar from "../../components/Topbar";
import { Order, OrderStats } from "../../types/order";
import { orderApi } from "../../lib/order.api";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  trend: "up" | "down";
}

const StatCard = ({ title, value, change, icon, trend }: StatCardProps) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-sm transition-shadow">
    <div className="flex items-center gap-4 mb-4">
      <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
        <div className="text-amber-600">{icon}</div>
      </div>
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <div
            className={`flex items-center text-sm font-medium ${
              trend === "up" ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {trend === "up" ? (
              <ArrowUpRight size={16} />
            ) : (
              <ArrowDownRight size={16} />
            )}
            <span>{change}%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [orderStats, setOrderStats] = useState<OrderStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch order stats
      const statsResponse = await orderApi.getOrderStats();
      if (statsResponse.success) {
        setOrderStats(statsResponse.data);
      }

      // Fetch recent orders
      const ordersResponse = await orderApi.getOrders({
        limit: 5,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (ordersResponse.success) {
        setRecentOrders(ordersResponse.data);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-BD", {
      style: "currency",
      currency: "BDT",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "pending":
        return "bg-amber-100 text-amber-800 border border-amber-200";
      case "processing":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "shipped":
        return "bg-indigo-100 text-indigo-800 border border-indigo-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Calculate stats with real data
  const stats = [
    {
      title: "Total Revenue",
      value: orderStats ? formatCurrency(orderStats.totalRevenue) : "৳0",
      change: 12.5,
      icon: <DollarSign size={24} />,
      trend: "up",
    },
    {
      title: "Total Orders",
      value: orderStats ? orderStats.totalOrders.toString() : "0",
      change: 8.2,
      icon: <ShoppingCart size={24} />,
      trend: orderStats && orderStats.totalOrders > 0 ? "up" : "down",
    },
    {
      title: "Pending Orders",
      value: orderStats ? orderStats.pendingOrders.toString() : "0",
      change: orderStats && orderStats.pendingOrders > 0 ? 5.7 : -5.7,
      icon: <Clock size={24} />,
      trend: orderStats && orderStats.pendingOrders > 0 ? "up" : "down",
    },
    {
      title: "Delivered Orders",
      value: orderStats ? orderStats.deliveredOrders.toString() : "0",
      change: orderStats && orderStats.deliveredOrders > 0 ? 15.3 : 0,
      icon: <CheckCircle size={24} />,
      trend: orderStats && orderStats.deliveredOrders > 0 ? "up" : "up",
    },
  ];

  // Prepare pie chart data from order stats
  const pieChartData = orderStats
    ? [
        { name: "Pending", value: orderStats.pendingOrders, color: "#f59e0b" },
        {
          name: "Processing",
          value: orderStats.processingOrders || 0,
          color: "#3b82f6",
        },
        {
          name: "Shipped",
          value: orderStats.shippedOrders || 0,
          color: "#6366f1",
        },
        {
          name: "Delivered",
          value: orderStats.deliveredOrders,
          color: "#10b981",
        },
        {
          name: "Cancelled",
          value: orderStats.cancelledOrders || 0,
          color: "#ef4444",
        },
      ].filter((item) => item.value > 0)
    : [];

  // Monthly revenue data (mock - you can replace with real API data)
  const monthlyRevenueData = [
    { month: "Jan", revenue: 45000, orders: 45 },
    { month: "Feb", revenue: 52000, orders: 52 },
    { month: "Mar", revenue: 61000, orders: 61 },
    { month: "Apr", revenue: 73000, orders: 73 },
    { month: "May", revenue: 82000, orders: 82 },
    { month: "Jun", revenue: 95000, orders: 95 },
  ];

  if (loading) {
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
                  Dashboard
                </h1>
                <p className="text-gray-600 mt-1">
                  Welcome back, here's what's happening with your store
                </p>
              </div>

              <button
                onClick={fetchDashboardData}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <TrendingUp size={18} />
                Refresh Data
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <StatCard key={idx} {...stat} />
              ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart - Revenue Trend (MOST IMPORTANT FOR ECOMMERCE) */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Monthly Revenue Trend
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Revenue and order growth over time
                    </p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <BarChart3 className="text-blue-600" size={20} />
                  </div>
                </div>

                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyRevenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="month" stroke="#6b7280" fontSize={12} />
                      <YAxis
                        stroke="#6b7280"
                        fontSize={12}
                        tickFormatter={(value) => `৳${value / 1000}k`}
                      />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "revenue")
                            return [formatCurrency(Number(value)), "Revenue"];
                          if (name === "orders")
                            return [`${value} orders`, "Orders"];
                          return [value, name];
                        }}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "8px",
                          padding: "8px 12px",
                        }}
                      />
                      <Legend />
                      <Bar
                        dataKey="revenue"
                        name="Revenue"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <span>Revenue Growth</span>
                  </div>
                  <span className="font-medium text-emerald-600">
                    +15% from last month
                  </span>
                </div>
              </div>

              {/* Pie Chart - Order Status Distribution */}
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Order Status Distribution
                    </h2>
                    <p className="text-gray-600 text-sm">
                      Overview of all order statuses
                    </p>
                  </div>
                  <div className="p-2 bg-amber-50 rounded-lg border border-amber-100">
                    <PieChartIcon className="text-amber-600" size={20} />
                  </div>
                </div>

                {pieChartData.length > 0 ? (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          innerRadius={30}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value} orders`, "Count"]}
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                            padding: "8px 12px",
                          }}
                        />
                        <Legend
                          layout="vertical"
                          verticalAlign="middle"
                          align="right"
                          wrapperStyle={{
                            paddingLeft: "20px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[300px] flex flex-col items-center justify-center text-gray-500">
                    <PieChartIcon className="w-12 h-12 mb-3 text-gray-300" />
                    <p>No order data available</p>
                    <p className="text-sm text-gray-400 mt-1">
                      Chart will appear when orders are placed
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Recent Orders
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Latest transactions from your store
                  </p>
                </div>
                <button
                  className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                  onClick={() => (window.location.href = "/admin/orders")}
                >
                  View All Orders →
                </button>
              </div>

              {recentOrders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Order #
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Customer
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Date
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Amount
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Payment
                        </th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentOrders.map((order) => (
                        <tr
                          key={order._id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                        >
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            #{order.orderNumber}
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            <div>
                              <p className="font-medium">
                                {order.shippingInfo.fullName}
                              </p>
                              <p className="text-xs text-gray-500">
                                {order.shippingInfo.city}
                              </p>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-700">
                            {formatDate(order.createdAt)}
                          </td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">
                            {formatCurrency(order.total)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                                order.paymentStatus === "paid"
                                  ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                                  : order.paymentStatus === "pending"
                                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                                  : "bg-gray-100 text-gray-800 border border-gray-200"
                              }`}
                            >
                              {order.paymentStatus}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.status
                              )}`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No recent orders</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Orders will appear here as they come in
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
