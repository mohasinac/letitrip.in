"use client";

import { AdminNav } from "@/components/admin/AdminNav";
import { useEffect, useState } from "react";

type AnalyticsPeriod = "7days" | "30days" | "90days" | "365days";

interface AdminAnalyticsData {
  users: {
    total: number;
    byDate: Array<{ date: string; count: number }>;
    byRole: Record<string, number>;
    growthRate: number;
  };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    byDate: Array<{ date: string; count: number }>;
  };
  revenue: {
    total: number;
    byDate: Array<{ date: string; amount: number }>;
    platformFees: number;
  };
  products: {
    total: number;
    active: number;
    pendingApproval: number;
  };
  auctions: {
    total: number;
    active: number;
    pendingApproval: number;
  };
  topSellers: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
  }>;
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("30days");
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/analytics?period=${period}`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch analytics");
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err.message : "Failed to load analytics");
    } finally {
      setIsLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
  };

  const getPeriodLabel = (p: AnalyticsPeriod) => {
    switch (p) {
      case "7days":
        return "Last 7 Days";
      case "30days":
        return "Last 30 Days";
      case "90days":
        return "Last 90 Days";
      case "365days":
        return "This Year";
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            System Management
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <AdminNav />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Platform Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Comprehensive platform metrics and performance indicators
            </p>
          </div>

          {/* Date Range */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex gap-4">
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value as AnalyticsPeriod)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="365days">This Year</option>
              </select>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export Report
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* Analytics Data */}
          {!isLoading && !error && analytics && (
            <>
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatPrice(analytics.revenue.total)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Platform fees: {formatPrice(analytics.revenue.platformFees)}
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Orders
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {analytics.orders.total}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Across all sellers
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Users
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {analytics.users.total}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      analytics.users.growthRate >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {analytics.users.growthRate >= 0 ? "+" : ""}
                    {analytics.users.growthRate.toFixed(1)}% growth rate
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Active Products
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {analytics.products.active}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {analytics.products.pendingApproval} pending approval
                  </div>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Revenue Trend ({getPeriodLabel(period)})
                  </h3>
                  <div className="h-64 flex items-end gap-2">
                    {analytics.revenue.byDate
                      .slice(0, 15)
                      .map((item, index) => {
                        const maxRevenue = Math.max(
                          ...analytics.revenue.byDate.map((d) => d.amount),
                        );
                        const height = (item.amount / maxRevenue) * 100;
                        return (
                          <div
                            key={index}
                            className="flex-1 flex flex-col items-center gap-2"
                          >
                            <div
                              className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-colors cursor-pointer"
                              style={{ height: `${height}%` }}
                              title={`${formatPrice(item.amount)} on ${new Date(
                                item.date,
                              ).toLocaleDateString()}`}
                            />
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              {new Date(item.date).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                              })}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>

                {/* Users Growth Chart */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    User Growth ({getPeriodLabel(period)})
                  </h3>
                  <div className="h-64 flex items-end gap-2">
                    {analytics.users.byDate.slice(0, 15).map((item, index) => {
                      const maxUsers = Math.max(
                        ...analytics.users.byDate.map((d) => d.count),
                      );
                      const height = (item.count / maxUsers) * 100;
                      return (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div
                            className="w-full bg-green-600 rounded-t hover:bg-green-700 transition-colors cursor-pointer"
                            style={{ height: `${height}%` }}
                            title={`${item.count} users on ${new Date(
                              item.date,
                            ).toLocaleDateString()}`}
                          />
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            {new Date(item.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Additional Metrics Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Orders by Status */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Orders by Status
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.orders.byStatus).map(
                      ([status, count]) => (
                        <div
                          key={status}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {status}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {count}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Users by Role */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Users by Role
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(analytics.users.byRole).map(
                      ([role, count]) => (
                        <div
                          key={role}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                            {role}
                          </span>
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {count}
                          </span>
                        </div>
                      ),
                    )}
                  </div>
                </div>

                {/* Pending Approvals */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Pending Approvals
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Products
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {analytics.products.pendingApproval}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Auctions
                      </span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {analytics.auctions.pendingApproval}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        Total
                      </span>
                      <span className="font-bold text-blue-600 dark:text-blue-400">
                        {analytics.products.pendingApproval +
                          analytics.auctions.pendingApproval}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Sellers */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top 5 Sellers
                </h3>
                <div className="space-y-4">
                  {analytics.topSellers.map((seller, index) => (
                    <div
                      key={seller.id}
                      className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {seller.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {seller.orders} orders
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(seller.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
