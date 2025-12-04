"use client";

import { PeriodSelector } from "@/components/common/PeriodSelector";
import { StatCard } from "@/components/common/StatCard";
import { DateDisplay, Price, Quantity } from "@/components/common/values";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { analyticsService } from "@/services/analytics.service";
import type {
  AnalyticsOverviewFE,
  SalesDataPointFE,
  TopProductFE,
} from "@/types/frontend/analytics.types";
import {
  ArrowRight,
  BarChart2,
  Calendar,
  DollarSign,
  Gavel,
  Loader2,
  Package,
  RefreshCw,
  ShoppingCart,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

// Simple bar chart for sales
function SalesChart({ data }: { data: SalesDataPointFE[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No sales data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));

  return (
    <div className="h-64 flex items-end gap-2">
      {data.map((point, i) => {
        const height = maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
        return (
          <div
            key={i}
            className="flex-1 flex flex-col items-center gap-1"
            title={`Revenue on ${point.date}`}
          >
            <div
              className="w-full bg-indigo-500 rounded-t transition-all hover:bg-indigo-600"
              style={{ height: `${Math.max(height, 2)}%` }}
            />
            <span className="text-xs text-gray-500 truncate w-full text-center">
              <DateDisplay date={point.date} format="short" />
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Top products table
function TopProductsTable({ products }: { products: TopProductFE[] }) {
  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No product data available
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 dark:border-gray-700">
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Product
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Sales
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Revenue
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Views
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => (
            <tr
              key={product.productId}
              className="border-b border-gray-100 dark:border-gray-800"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    #{i + 1}
                  </span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.productName}
                  </span>
                </div>
              </td>
              <td className="text-right py-3 px-4 text-sm text-gray-900 dark:text-white">
                <Quantity value={product.sales} />
              </td>
              <td className="text-right py-3 px-4 text-sm font-medium text-gray-900 dark:text-white">
                <Price amount={product.revenue} />
              </td>
              <td className="text-right py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                <Quantity value={product.views} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [period, setPeriod] = useState("month");
  const {
    isLoading: loading,
    error,
    execute,
  } = useLoadingState({
    onLoadError: (error) => {
      logError(error, {
        component: "AdminAnalyticsPage.fetchAnalytics",
        period,
      });
    },
  });
  const [overview, setOverview] = useState<AnalyticsOverviewFE | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPointFE[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductFE[]>([]);

  const fetchAnalytics = useCallback(() => {
    execute(async () => {
      const filters = { period: period as "day" | "week" | "month" | "year" };
      const [overviewData, salesPoints, products] = await Promise.all([
        analyticsService.getOverview(filters),
        analyticsService.getSalesData(filters),
        analyticsService.getTopProducts({ ...filters, limit: 10 }),
      ]);
      setOverview(overviewData);
      setSalesData(salesPoints);
      setTopProducts(products);
    });
  }, [period, execute]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="h-7 w-7 text-indigo-600" />
              Analytics Dashboard
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Platform-wide sales and performance metrics
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PeriodSelector value={period} onChange={setPeriod} />
            <button
              onClick={fetchAnalytics}
              disabled={loading}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && !overview ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : overview ? (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                title="Total Revenue"
                value={overview.totalRevenue}
                change={overview.revenueGrowth}
                icon={DollarSign}
                color="green"
                prefix="₹"
              />
              <StatCard
                title="Total Orders"
                value={overview.totalOrders}
                change={overview.ordersGrowth}
                icon={ShoppingCart}
                color="blue"
              />
              <StatCard
                title="Active Products"
                value={overview.totalProducts}
                icon={Package}
                color="purple"
              />
              <StatCard
                title="Total Customers"
                value={overview.totalCustomers}
                icon={Users}
                color="indigo"
              />
            </div>

            {/* Secondary stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Average Order Value
                </h3>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  <Price amount={overview.averageOrderValue} />
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Conversion Rate
                </h3>
                <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">
                  {overview.conversionRate.toFixed(2)}%
                </p>
              </div>
            </div>

            {/* Sales Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  Sales Trend
                </h2>
              </div>
              <SalesChart data={salesData} />
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-500" />
                Top Products
              </h2>
              <TopProductsTable products={topProducts} />
            </div>

            {/* Quick Links to Sub-Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/analytics/sales"
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                    <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Sales Analytics
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Revenue breakdown & trends
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </Link>

              <Link
                href="/admin/analytics/auctions"
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                    <Gavel className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      Auction Analytics
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Bidding activity & success rates
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </Link>

              <Link
                href="/admin/analytics/users"
                className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      User Analytics
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Growth & engagement metrics
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors" />
              </Link>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
