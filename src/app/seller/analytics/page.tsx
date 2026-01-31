"use client";

import { SellerNav } from "@/components/seller/SellerNav";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type AnalyticsPeriod = "7days" | "30days" | "90days" | "365days";

interface AnalyticsData {
  revenue: {
    total: number;
    byDate: Array<{ date: string; amount: number }>;
    percentChange: number;
  };
  orders: {
    total: number;
    byStatus: Record<string, number>;
    percentChange: number;
  };
  products: {
    totalActive: number;
    totalSold: number;
    avgRating: number;
  };
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    unitsSold: number;
  }>;
  recentReviews: Array<{
    id: string;
    productName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
}

export default function SellerAnalyticsPage() {
  const pathname = usePathname();
  const [period, setPeriod] = useState<AnalyticsPeriod>("30days");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/seller/analytics?period=${period}`, {
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

  const avgOrderValue =
    analytics && analytics.orders.total > 0
      ? analytics.revenue.total / analytics.orders.total
      : 0;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Left Sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Seller Dashboard
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage Your Shop
          </p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <SellerNav currentPath={pathname} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Shop Analytics
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Track your shop's performance and sales metrics
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
                  <div
                    className={`text-xs mt-2 ${
                      analytics.revenue.percentChange >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {analytics.revenue.percentChange >= 0 ? "+" : ""}
                    {analytics.revenue.percentChange.toFixed(1)}% from last
                    period
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Total Orders
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {analytics.orders.total}
                  </div>
                  <div
                    className={`text-xs mt-2 ${
                      analytics.orders.percentChange >= 0
                        ? "text-green-600 dark:text-green-400"
                        : "text-red-600 dark:text-red-400"
                    }`}
                  >
                    {analytics.orders.percentChange >= 0 ? "+" : ""}
                    {analytics.orders.percentChange.toFixed(1)}% from last
                    period
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Avg Order Value
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {formatPrice(avgOrderValue)}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Per order average
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Active Products
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {analytics.products.totalActive}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    {analytics.products.totalSold} units sold
                  </div>
                </div>
              </div>

              {/* Orders by Status & Revenue Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Revenue Trend ({getPeriodLabel(period)})
                  </h3>
                  <div className="h-64 flex items-end gap-2">
                    {analytics.revenue.byDate
                      .slice(0, 10)
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
              </div>

              {/* Top Products */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Top 5 Products
                </h3>
                <div className="space-y-4">
                  {analytics.topProducts.map((product, index) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-lg font-bold text-gray-400">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {product.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {product.unitsSold} units sold
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {formatPrice(product.revenue)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Reviews */}
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Reviews
                </h3>
                <div className="space-y-4">
                  {analytics.recentReviews.map((review) => (
                    <div
                      key={review.id}
                      className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {review.productName}
                        </p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-gray-300 dark:text-gray-600"
                              }`}
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {review.comment}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
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
