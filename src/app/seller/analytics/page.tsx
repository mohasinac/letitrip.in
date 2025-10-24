"use client";

import { useState, useEffect } from "react";
import SellerLayout from "@/components/seller/SellerLayout";

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
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("7d");

  useEffect(() => {
    // Mock analytics data
    const mockAnalytics: AnalyticsData = {
      overview: {
        totalSales: 15420.5,
        totalOrders: 187,
        totalProducts: 42,
        totalCustomers: 156,
        revenue: {
          current: 15420.5,
          previous: 12890.25,
          change: 19.6,
        },
        orders: {
          current: 187,
          previous: 162,
          change: 15.4,
        },
      },
      salesChart: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        data: [2100, 1800, 2400, 2200, 2800, 3200, 2900],
      },
      topProducts: [
        {
          id: "1",
          name: "Dragon Storm Beyblade Burst",
          sales: 45,
          revenue: 1348.5,
          image: "/images/beyblade-1.jpg",
        },
        {
          id: "2",
          name: "Lightning L-Drago Metal Fight",
          sales: 38,
          revenue: 1140.0,
          image: "/images/beyblade-2.jpg",
        },
        {
          id: "3",
          name: "Thunder Dome Stadium",
          sales: 22,
          revenue: 1099.0,
          image: "/images/stadium-1.jpg",
        },
        {
          id: "4",
          name: "Power Grip Pro Launcher",
          sales: 31,
          revenue: 619.0,
          image: "/images/launcher-1.jpg",
        },
      ],
      recentOrders: [
        {
          id: "ORD-001",
          customer: "John Smith",
          product: "Dragon Storm Beyblade",
          amount: 29.99,
          status: "completed",
          date: "2024-10-23T10:30:00Z",
        },
        {
          id: "ORD-002",
          customer: "Emily Johnson",
          product: "Thunder Dome Stadium",
          amount: 49.99,
          status: "shipped",
          date: "2024-10-23T09:15:00Z",
        },
        {
          id: "ORD-003",
          customer: "Mike Wilson",
          product: "Lightning L-Drago",
          amount: 24.99,
          status: "processing",
          date: "2024-10-23T08:45:00Z",
        },
        {
          id: "ORD-004",
          customer: "Sarah Davis",
          product: "Power Grip Launcher",
          amount: 19.99,
          status: "completed",
          date: "2024-10-22T16:20:00Z",
        },
      ],
      customerInsights: {
        newCustomers: 23,
        returningCustomers: 134,
        avgOrderValue: 82.46,
        conversionRate: 3.2,
      },
    };

    // Simulate API call
    setTimeout(() => {
      setAnalytics(mockAnalytics);
      setLoading(false);
    }, 1000);
  }, [timeRange]);

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
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </SellerLayout>
    );
  }

  if (!analytics) {
    return (
      <SellerLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Analytics Not Available
            </h1>
            <p className="text-gray-600">Unable to load analytics data.</p>
          </div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Sales Analytics
                </h1>
                <p className="text-gray-600 mt-1">
                  Track your sales performance and insights
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    ${analytics.overview.totalSales.toLocaleString()}
                  </p>
                  <p
                    className={`text-sm ${
                      analytics.overview.revenue.change > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {analytics.overview.revenue.change > 0 ? "+" : ""}
                    {analytics.overview.revenue.change}% from last period
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

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Orders
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.overview.totalOrders}
                  </p>
                  <p
                    className={`text-sm ${
                      analytics.overview.orders.change > 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {analytics.overview.orders.change > 0 ? "+" : ""}
                    {analytics.overview.orders.change}% from last period
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

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Products Listed
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.overview.totalProducts}
                  </p>
                  <p className="text-sm text-gray-500">Active listings</p>
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

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Customers
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.overview.totalCustomers}
                  </p>
                  <p className="text-sm text-gray-500">Unique buyers</p>
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
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Sales Trend
              </h2>
              <div className="h-64 flex items-end justify-between space-x-2">
                {analytics.salesChart.data.map((value, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div
                      className="bg-primary rounded-t-sm w-8 transition-all duration-500 hover:bg-primary-dark"
                      style={{
                        height: `${
                          (value / Math.max(...analytics.salesChart.data)) * 200
                        }px`,
                      }}
                      title={`$${value.toLocaleString()}`}
                    ></div>
                    <span className="text-xs text-gray-500 mt-2">
                      {analytics.salesChart.labels[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Customer Insights */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Customer Insights
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">New Customers</span>
                  <span className="font-semibold">
                    {analytics.customerInsights.newCustomers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Returning Customers
                  </span>
                  <span className="font-semibold">
                    {analytics.customerInsights.returningCustomers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Avg. Order Value
                  </span>
                  <span className="font-semibold">
                    ${analytics.customerInsights.avgOrderValue}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Conversion Rate</span>
                  <span className="font-semibold">
                    {analytics.customerInsights.conversionRate}%
                  </span>
                </div>
              </div>

              {/* Customer Distribution */}
              <div className="mt-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <span className="text-xs text-gray-600">New</span>
                  <div className="w-3 h-3 bg-primary/40 rounded-full ml-4"></div>
                  <span className="text-xs text-gray-600">Returning</span>
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
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Top Selling Products
              </h2>
              <div className="space-y-4">
                {analytics.topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full text-sm font-medium text-gray-600">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                      <svg
                        className="h-6 w-6 text-gray-400"
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
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {product.sales} sold
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ${product.revenue.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
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
                        <p className="text-sm font-medium text-gray-900">
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
                      <p className="text-xs text-gray-600">{order.customer}</p>
                      <p className="text-xs text-gray-500 truncate">
                        {order.product}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">
                        ${order.amount}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button className="text-sm text-primary hover:text-primary-dark font-medium">
                  View All Orders →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}
