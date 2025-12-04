"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  ArrowLeft,
  RefreshCw,
  Loader2,
  Calendar,
  Download,
  PieChart,
  BarChart3,
} from "lucide-react";
import { analyticsService } from "@/services/analytics.service";
import { Price, Quantity, DateDisplay } from "@/components/common/values";
import { PeriodSelector } from "@/components/common/PeriodSelector";
import { StatCard } from "@/components/common/StatCard";
import type {
  SalesDataPointFE,
  CategoryPerformanceFE,
  TopProductFE,
} from "@/types/frontend/analytics.types";

// Revenue trend chart
function RevenueTrendChart({ data }: { data: SalesDataPointFE[] }) {
  if (data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        No sales data available
      </div>
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue));
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Total Revenue
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            <Price amount={totalRevenue} />
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Daily</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            <Price amount={Math.round(totalRevenue / (data.length || 1))} />
          </p>
        </div>
      </div>
      <div className="h-64 flex items-end gap-1">
        {data.map((point, i) => {
          const height =
            maxRevenue > 0 ? (point.revenue / maxRevenue) * 100 : 0;
          return (
            <div
              key={i}
              className="flex-1 flex flex-col items-center gap-1 group relative"
            >
              <div
                className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t transition-all hover:from-indigo-700 hover:to-indigo-500 cursor-pointer"
                style={{ height: `${Math.max(height, 4)}%` }}
              />
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block z-10">
                <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                  <p className="font-medium">
                    <Price amount={point.revenue} />
                  </p>
                  <p className="text-gray-300">{point.orders} orders</p>
                </div>
              </div>
              <span className="text-xs text-gray-500 truncate w-full text-center">
                <DateDisplay date={point.date} format="short" />
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Category breakdown chart
function CategoryBreakdown({ data }: { data: CategoryPerformanceFE[] }) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        No category data available
      </div>
    );
  }

  const totalRevenue = data.reduce((sum, cat) => sum + cat.revenue, 0);
  const colors = [
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-orange-500",
    "bg-red-500",
  ];

  return (
    <div className="space-y-4">
      {data.slice(0, 8).map((category, i) => {
        const percentage =
          totalRevenue > 0 ? (category.revenue / totalRevenue) * 100 : 0;
        return (
          <div key={category.categoryId} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-gray-900 dark:text-white">
                {category.categoryName}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                <Price amount={category.revenue} /> ({percentage.toFixed(1)}%)
              </span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  colors[i % colors.length]
                } rounded-full transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>{category.orders} orders</span>
              <span>{category.products} products</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Top products table with more detail
function DetailedProductsTable({ products }: { products: TopProductFE[] }) {
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
              #
            </th>
            <th className="text-left py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Product
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Units Sold
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Revenue
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Views
            </th>
            <th className="text-right py-3 px-4 text-sm font-medium text-gray-500 dark:text-gray-400">
              Conversion
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product, i) => {
            const conversionRate =
              product.views > 0 ? (product.sales / product.views) * 100 : 0;
            return (
              <tr
                key={product.productId}
                className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
              >
                <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                  {i + 1}
                </td>
                <td className="py-3 px-4">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {product.productName}
                  </span>
                </td>
                <td className="text-right py-3 px-4 text-sm text-gray-900 dark:text-white">
                  <Quantity value={product.sales} />
                </td>
                <td className="text-right py-3 px-4 text-sm font-medium text-green-600 dark:text-green-400">
                  <Price amount={product.revenue} />
                </td>
                <td className="text-right py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                  <Quantity value={product.views} />
                </td>
                <td className="text-right py-3 px-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      conversionRate >= 5
                        ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-400"
                        : conversionRate >= 2
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-400"
                    }`}
                  >
                    {conversionRate.toFixed(1)}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminAnalyticsSalesPage() {
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPointFE[]>([]);
  const [categories, setCategories] = useState<CategoryPerformanceFE[]>([]);
  const [topProducts, setTopProducts] = useState<TopProductFE[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filters = { period: period as "day" | "week" | "month" | "year" };
      const [sales, cats, products] = await Promise.all([
        analyticsService.getSalesData(filters),
        analyticsService.getCategoryPerformance(filters),
        analyticsService.getTopProducts({ ...filters, limit: 20 }),
      ]);
      setSalesData(sales);
      setCategories(cats);
      setTopProducts(products);
    } catch (err) {
      console.error("Failed to load sales data:", err);
      setError("Failed to load sales analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate totals
  const totalRevenue = salesData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = salesData.reduce((sum, d) => sum + d.orders, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate growth (mock for now - would need previous period data)
  const revenueGrowth = salesData.length > 1 ? 12.5 : 0;
  const ordersGrowth = salesData.length > 1 ? 8.3 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link
              href="/admin/analytics"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Analytics
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-indigo-600" />
              Sales Analytics
            </h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Detailed breakdown of sales performance
            </p>
          </div>
          <div className="flex items-center gap-3">
            <PeriodSelector value={period} onChange={setPeriod} />
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
              title="Refresh"
            >
              <RefreshCw
                className={`h-5 w-5 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => {
                // Export functionality placeholder
                toast.info("Export functionality coming soon!");
              }}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={fetchData}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && salesData.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          </div>
        ) : (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <StatCard
                title="Total Revenue"
                value={totalRevenue}
                change={revenueGrowth}
                icon={DollarSign}
                color="green"
                prefix="₹"
              />
              <StatCard
                title="Total Orders"
                value={totalOrders}
                change={ordersGrowth}
                icon={ShoppingCart}
                color="blue"
              />
              <StatCard
                title="Avg Order Value"
                value={Math.round(avgOrderValue)}
                icon={TrendingUp}
                color="indigo"
                prefix="₹"
              />
            </div>

            {/* Revenue Trend */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  Revenue Trend
                </h2>
              </div>
              <RevenueTrendChart data={salesData} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-gray-500" />
                  Revenue by Category
                </h2>
                <CategoryBreakdown data={categories} />
              </div>

              {/* Quick Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Quick Insights
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Best Day
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {salesData.length > 0
                          ? new Date(
                              salesData.reduce((best, day) =>
                                day.revenue > best.revenue ? day : best,
                              ).date,
                            ).toLocaleDateString("en-IN", {
                              weekday: "long",
                              month: "short",
                              day: "numeric",
                            })
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-green-600 dark:text-green-400">
                        <Price
                          amount={
                            salesData.length > 0
                              ? Math.max(...salesData.map((d) => d.revenue))
                              : 0
                          }
                        />
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Top Category
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {categories.length > 0
                          ? categories[0].categoryName
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {categories.length > 0 ? categories[0].orders : 0}{" "}
                        orders
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Best Product
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[180px]">
                        {topProducts.length > 0
                          ? topProducts[0].productName
                          : "N/A"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        <Price
                          amount={
                            topProducts.length > 0 ? topProducts[0].revenue : 0
                          }
                        />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Top Products Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-gray-500" />
                Top Selling Products
              </h2>
              <DetailedProductsTable products={topProducts} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
