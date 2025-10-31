"use client";

import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  ShoppingCart,
  DollarSign,
  Users,
  Download,
  Loader2,
  AlertCircle,
} from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { useAuth } from "@/contexts/AuthContext";
import { apiGet } from "@/lib/api/seller";
import Link from "next/link";

interface AnalyticsData {
  overview: {
    totalRevenue: number;
    totalOrders: number;
    averageOrderValue: number;
    totalCustomers: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customerName: string;
    total: number;
    status: string;
    createdAt: string;
  }>;
  lowStockProducts: Array<{
    id: string;
    name: string;
    stock: number;
    threshold: number;
  }>;
}

export default function AnalyticsPage() {
  useBreadcrumbTracker([
    { label: "Seller Panel", href: "/seller/dashboard" },
    { label: "Analytics", href: "/seller/analytics" },
  ]);
  const { user } = useAuth();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30days");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error" | "info" | "warning",
  });

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    } else {
      setLoading(false);
    }
  }, [user, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response: any = await apiGet(
        `/api/seller/analytics/overview?period=${period}`
      );
      if (response.success) {
        setData(response.data);
      } else {
        setSnackbar({
          open: true,
          message: response.error || "Failed to fetch analytics",
          severity: "error",
        });
      }
    } catch (error: any) {
      console.error("Error fetching analytics:", error);
      const errorMessage = error.message || "Failed to load analytics";
      setSnackbar({
        open: true,
        message: errorMessage.includes("not authenticated")
          ? "Please log in to view analytics"
          : errorMessage,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setSnackbar({
      open: true,
      message: "Export feature coming soon!",
      severity: "info",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipped: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <RoleGuard requiredRole="seller">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </RoleGuard>
    );
  }

  // Show empty state if no user
  if (!user) {
    return (
      <RoleGuard requiredRole="seller">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[60vh]">
            <p className="text-lg text-gray-600">
              Please log in to view analytics
            </p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  // Show empty state if no data
  if (!data) {
    return (
      <RoleGuard requiredRole="seller">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Track your store performance
            </p>
          </div>
          <div className="flex justify-center items-center min-h-[40vh]">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                No data available
              </h2>
              <p className="text-sm text-gray-600">
                Analytics will appear here once you have orders
              </p>
            </div>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="seller">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Snackbar */}
        {snackbar.open && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <div
              className={`p-4 rounded-lg shadow-lg flex items-start gap-3 ${
                snackbar.severity === "error"
                  ? "bg-red-50 border border-red-200"
                  : snackbar.severity === "success"
                  ? "bg-green-50 border border-green-200"
                  : snackbar.severity === "warning"
                  ? "bg-amber-50 border border-amber-200"
                  : "bg-blue-50 border border-blue-200"
              }`}
            >
              <AlertCircle
                className={`w-5 h-5 flex-shrink-0 ${
                  snackbar.severity === "error"
                    ? "text-red-600"
                    : snackbar.severity === "success"
                    ? "text-green-600"
                    : snackbar.severity === "warning"
                    ? "text-amber-600"
                    : "text-blue-600"
                }`}
              />
              <p
                className={`text-sm flex-1 ${
                  snackbar.severity === "error"
                    ? "text-red-800"
                    : snackbar.severity === "success"
                    ? "text-green-800"
                    : snackbar.severity === "warning"
                    ? "text-amber-800"
                    : "text-blue-800"
                }`}
              >
                {snackbar.message}
              </p>
              <button
                onClick={() => setSnackbar({ ...snackbar, open: false })}
                className={`${
                  snackbar.severity === "error"
                    ? "text-red-600 hover:text-red-800"
                    : snackbar.severity === "success"
                    ? "text-green-600 hover:text-green-800"
                    : snackbar.severity === "warning"
                    ? "text-amber-600 hover:text-amber-800"
                    : "text-blue-600 hover:text-blue-800"
                }`}
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-gray-600">
              Track your store performance
            </p>
          </div>

          <div className="flex gap-3 items-center">
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="1year">Last Year</option>
              <option value="alltime">All Time</option>
            </select>

            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{data?.overview.totalRevenue.toLocaleString() || 0}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-green-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data?.overview.totalOrders.toLocaleString() || 0}
                </p>
              </div>
              <ShoppingCart className="w-10 h-10 text-blue-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg. Order Value</p>
                <p className="text-3xl font-bold text-gray-900">
                  ₹{data?.overview.averageOrderValue.toLocaleString() || 0}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-purple-600" />
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900">
                  {data?.overview.totalCustomers.toLocaleString() || 0}
                </p>
              </div>
              <Users className="w-10 h-10 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Products */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Top Products
              </h2>
            </div>
            <div className="p-6">
              {data?.topProducts && data.topProducts.length > 0 ? (
                <div className="space-y-4">
                  {data.topProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {product.sales} sales
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ₹{product.revenue.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center py-8">
                  No top products yet
                </p>
              )}
            </div>
          </div>

          {/* Low Stock Products */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Low Stock Alerts
              </h2>
            </div>
            <div className="p-6">
              {data?.lowStockProducts && data.lowStockProducts.length > 0 ? (
                <div className="space-y-4">
                  {data.lowStockProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {product.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          Threshold: {product.threshold}
                        </p>
                      </div>
                      <span className="px-3 py-1 text-sm font-semibold text-red-700 bg-red-100 rounded-full">
                        {product.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-600 text-center py-8">
                  All products well stocked
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Orders
            </h2>
          </div>
          <div className="overflow-x-auto">
            {data?.recentOrders && data.recentOrders.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/seller/orders/${order.id}`}
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {order.orderNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        ₹{order.total.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center">
                <p className="text-sm text-gray-600">No recent orders</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  );
}
