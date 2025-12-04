"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { DateDisplay, Price } from "@/components/common/values";
import { FormInput, FormSelect } from "@/components/forms";
import { useLoadingState } from "@/hooks/useLoadingState";
import { getTodayDateInputValue, toDateInputValue } from "@/lib/date-utils";
import { logError } from "@/lib/firebase-error-logger";
import { formatCurrency } from "@/lib/formatters";
import { analyticsService } from "@/services/analytics.service";
import {
  Calendar,
  CreditCard,
  DollarSign,
  Download,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

interface RevenueData {
  overview: any;
  salesData: any[];
  topProducts: any[];
}

export default function SellerRevenuePage() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<{
    startDate: string;
    endDate: string;
  }>({
    startDate: toDateInputValue(
      new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ),
    endDate: getTodayDateInputValue(),
  });
  const [period, setPeriod] = useState<"day" | "week" | "month">("day");

  const {
    data,
    isLoading: loading,
    execute,
  } = useLoadingState<RevenueData>({
    initialData: { overview: null, salesData: [], topProducts: [] },
  });

  const loadData = useCallback(async () => {
    const filters = {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      period,
    };

    const [overviewData, salesChartData, topProductsData] = await Promise.all([
      analyticsService.getOverview(filters),
      analyticsService.getSalesData(filters),
      analyticsService.getTopProducts({ ...filters, limit: 5 }),
    ]);

    return {
      overview: overviewData,
      salesData: salesChartData,
      topProducts: topProductsData,
    };
  }, [dateRange, period]);

  useEffect(() => {
    execute(loadData);
  }, [execute, loadData]);

  // Safe access to data
  const overview = data?.overview || null;
  const salesData = data?.salesData || [];
  const topProducts = data?.topProducts || [];

  const handleExport = async (format: "csv" | "pdf") => {
    try {
      const blob = await analyticsService.exportData(
        {
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
          period,
        },
        format
      );
      const url = globalThis.URL?.createObjectURL(blob) || "";
      const link = document.createElement("a");
      link.href = url;
      link.download = `revenue-report-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      globalThis.URL?.revokeObjectURL(url);
    } catch (error: any) {
      logError(error as Error, {
        component: "SellerRevenue.handleExportData",
        metadata: { dateRange, format },
      });
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-IN").format(num);
  };

  const formatGrowth = (growth: number) => {
    const isPositive = growth >= 0;
    return (
      <span
        className={`inline-flex items-center ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4 mr-1" />
        ) : (
          <TrendingDown className="w-4 h-4 mr-1" />
        )}
        {Math.abs(growth).toFixed(1)}%
      </span>
    );
  };

  if (loading) {
    return (
      <AuthGuard requireAuth allowedRoles={["seller"]}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard requireAuth allowedRoles={["seller"]}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Revenue Dashboard
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Track your sales performance and earnings
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleExport("csv")}
                  className="flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export CSV
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Date Range:
                </span>
              </div>
              <FormInput
                id="start-date"
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                  }))
                }
                max={dateRange.endDate}
                compact
              />
              <span className="text-gray-500 dark:text-gray-400">to</span>
              <FormInput
                id="end-date"
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange((prev) => ({
                    ...prev,
                    endDate: e.target.value,
                  }))
                }
                min={dateRange.startDate}
                max={new Date().toISOString().split("T")[0]}
                compact
              />
              <div className="ml-4 flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Period:
                </span>
                <FormSelect
                  id="period-select"
                  value={period}
                  onChange={(e) =>
                    setPeriod(e.target.value as "day" | "week" | "month")
                  }
                  options={[
                    { value: "day", label: "Daily" },
                    { value: "week", label: "Weekly" },
                    { value: "month", label: "Monthly" },
                  ]}
                  compact
                />
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Revenue
                </div>
                <DollarSign className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                <Price amount={overview?.totalRevenue || 0} />
              </div>
              {overview?.revenueGrowth !== undefined && (
                <div className="text-sm">
                  {formatGrowth(overview.revenueGrowth)} vs last period
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Orders
                </div>
                <ShoppingCart className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {formatNumber(overview?.totalOrders || 0)}
              </div>
              {overview?.ordersGrowth !== undefined && (
                <div className="text-sm">
                  {formatGrowth(overview.ordersGrowth)} vs last period
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Average Order Value
                </div>
                <CreditCard className="w-8 h-8 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                <Price amount={overview?.averageOrderValue || 0} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Customers
                </div>
                <Users className="w-8 h-8 text-orange-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                {formatNumber(overview?.totalCustomers || 0)}
              </div>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Sales Trend
            </h2>
            {salesData.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                No sales data available for the selected period
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="min-w-full">
                  <div className="h-64 flex items-end justify-between gap-2">
                    {salesData.map((data, index) => {
                      const maxRevenue = Math.max(
                        ...salesData.map((d) => d.revenue)
                      );
                      const height = (data.revenue / maxRevenue) * 100;
                      return (
                        <div
                          key={index}
                          className="flex-1 flex flex-col items-center group"
                        >
                          <div className="relative w-full">
                            <div
                              className="bg-indigo-500 rounded-t hover:bg-indigo-600 transition-all cursor-pointer"
                              style={{ height: `${height}%`, minHeight: "4px" }}
                              title={`${formatCurrency(data.revenue, {
                                showDecimals: false,
                              })} - ${data.orders} orders`}
                            >
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                <Price amount={data.revenue} />
                                <br />
                                {data.orders} orders
                              </div>
                            </div>
                          </div>
                          <DateDisplay
                            date={data.date}
                            format="short"
                            className="text-xs text-gray-600 dark:text-gray-400 mt-2 whitespace-nowrap"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Top Products
              </h2>
              {topProducts.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No product data available
                </div>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div
                      key={product.productId}
                      className="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center font-semibold">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {product.productName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {product.sales} sales · {product.views} views
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          <Price amount={product.revenue} />
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Quick Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/seller/orders")}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    View Orders
                  </span>
                  <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => router.push("/seller/products")}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    Manage Products
                  </span>
                  <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={() => router.push("/seller/returns")}
                  className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    View Returns
                  </span>
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
              </div>

              {/* Additional Stats */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Conversion Rate
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {overview?.conversionRate?.toFixed(2) || 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">
                    Total Products
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {formatNumber(overview?.totalProducts || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
