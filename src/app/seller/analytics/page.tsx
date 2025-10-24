"use client";

import { useState, useEffect } from "react";
import { SellerService } from "@/lib/services/seller.service";
import { useRealTimeData } from "@/hooks/useRealTimeData";
import { useEnhancedAuth } from "@/hooks/useEnhancedAuth";
interface AnalyticsData {
  overview: {
    totalSales: number;
    totalOrders: number;
    totalProducts: number;
    totalCustomers: number;
    revenue: {
      current: number;
      previous: number;
      change: number;
    };
    orders: {
      current: number;
      previous: number;
      change: number;
    };
  };
  salesChart: {
    labels: string[];
    data: number[];
  };
  topProducts: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
    image: string;
  }[];
  recentOrders: {
    id: string;
    customer: string;
    product: string;
    amount: number;
    status: string;
    date: string;
  }[];
  customerInsights: {
    newCustomers: number;
    returningCustomers: number;
    avgOrderValue: number;
    conversionRate: number;
  };
}

export default function SellerAnalyticsPage() {
  const { user } = useEnhancedAuth();
  const [timeRange, setTimeRange] = useState("7d");

  // Real-time analytics data
  const {
    data: analytics,
    loading,
    error,
    refresh,
    lastUpdated,
  } = useRealTimeData(() => SellerService.getAnalytics(timeRange), {
    interval: 60000, // 1 minute
    enabled: !!user,
  });

  // Real-time stats data for metrics
  const { data: stats } = useRealTimeData(SellerService.getDashboardStats, {
    interval: 30000, // 30 seconds
    enabled: !!user,
  });

  // Trigger refresh when time range changes
  useEffect(() => {
    if (user) {
      refresh();
    }
  }, [timeRange, user, refresh]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary mb-4">
            Analytics Not Available
          </h1>
          <p className="text-secondary">Unable to load analytics data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-primary">
                  Sales Analytics
                </h1>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      loading ? "bg-yellow-400 animate-pulse" : "bg-green-400"
                    }`}
                  ></div>
                  <span className="text-sm text-muted">
                    {loading
                      ? "Updating..."
                      : `Updated ${
                          lastUpdated
                            ? new Date(lastUpdated).toLocaleTimeString()
                            : "now"
                        }`}
                  </span>
                </div>
              </div>
              <p className="text-secondary mt-1">
                Track your sales performance and insights
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={refresh}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-secondary bg-surface rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                {loading ? "Refreshing..." : "Refresh"}
              </button>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              <button className="btn btn-outline">
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Export Report
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">Error: {error}</p>
            </div>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="admin-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-primary">
                  ${stats?.totalRevenue?.toLocaleString() || "0"}
                </p>
                <p
                  className={`text-sm ${
                    (stats?.revenueChange || 0) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(stats?.revenueChange || 0) > 0 ? "+" : ""}
                  {stats?.revenueChange || 0}% from last period
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats?.totalOrders || 0}
                </p>
                <p
                  className={`text-sm ${
                    (stats?.ordersChange || 0) > 0
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {(stats?.ordersChange || 0) > 0 ? "+" : ""}
                  {stats?.ordersChange || 0}% from last period
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">
                  Products Listed
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats?.totalProducts || 0}
                </p>
                <p className="text-sm text-muted">
                  {stats?.activeProducts || 0} active listings
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="admin-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-secondary">
                  Reviews & Rating
                </p>
                <p className="text-2xl font-bold text-primary">
                  {stats?.totalReviews || 0}
                </p>
                <p className="text-sm text-muted">
                  Avg rating: {stats?.averageRating?.toFixed(1) || "0.0"}
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <svg
                  className="h-6 w-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Sales Chart */}
          <div className="admin-card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Sales Trend
            </h2>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analytics?.salesData?.datasets?.[0]?.data?.map(
                (value: number, index: number) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-primary rounded-t-sm w-8 transition-all duration-500 hover:bg-primary-dark"
                      style={{
                        height: `${
                          (value /
                            Math.max(
                              ...(analytics?.salesData?.datasets?.[0]?.data || [
                                1,
                              ])
                            )) *
                          200
                        }px`,
                      }}
                      title={`$${value.toLocaleString()}`}
                    ></div>
                    <span className="text-xs text-muted mt-2">
                      {analytics?.salesData?.labels?.[index] ||
                        `Day ${index + 1}`}
                    </span>
                  </div>
                )
              ) || (
                <div className="flex items-center justify-center w-full h-full text-muted">
                  No sales data available
                </div>
              )}
            </div>
          </div>

          {/* Customer Insights */}
          <div className="admin-card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Customer Insights
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">New Customers</span>
                <span className="font-semibold">
                  {analytics.customerInsights.newCustomers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">
                  Returning Customers
                </span>
                <span className="font-semibold">
                  {analytics.customerInsights.returningCustomers}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Monthly Goal</span>
                <span className="font-semibold">
                  ${stats?.monthlyGoal?.toLocaleString() || "0"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-secondary">Goal Progress</span>
                <span className="font-semibold">
                  {stats?.goalProgress || 0}%
                </span>
              </div>
            </div>

            {/* Customer Distribution */}
            <div className="mt-6">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span className="text-xs text-secondary">New</span>
                <div className="w-3 h-3 bg-primary/40 rounded-full ml-4"></div>
                <span className="text-xs text-secondary">Returning</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary h-3 rounded-full relative"
                  style={{
                    width: `${
                      (analytics.customerInsights.newCustomers /
                        (analytics.customerInsights.newCustomers +
                          analytics.customerInsights.returningCustomers)) *
                      100
                    }%`,
                  }}
                >
                  <div
                    className="bg-primary/40 h-3 rounded-r-full absolute right-0"
                    style={{
                      width: `${
                        (analytics.customerInsights.returningCustomers /
                          analytics.customerInsights.newCustomers) *
                        100
                      }%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Products */}
          <div className="admin-card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Top Selling Products
            </h2>
            <div className="space-y-4">
              {analytics.topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-8 h-8 bg-surface rounded-full text-sm font-medium text-secondary">
                    {index + 1}
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {product.name}
                    </p>
                    <p className="text-xs text-muted">
                      {product.sales} sold
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      ${product.revenue.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted">revenue</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="admin-card p-6">
            <h2 className="text-lg font-semibold text-primary mb-4">
              Recent Orders
            </h2>
            <div className="space-y-4">
              {analytics.recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-primary">
                        {order.id}
                      </p>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-secondary">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-muted truncate">
                      {order.items} item{order.items !== 1 ? "s" : ""} •{" "}
                      {order.paymentStatus}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-primary">
                      ${order.amount}
                    </p>
                    <p className="text-xs text-muted">
                      {new Date(order.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <button className="text-sm text-primary hover:text-primary-dark font-medium">
                View All Orders →
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
