/**
 * @fileoverview React Component
 * @module src/app/seller/analytics/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ShopSelector from "@/components/seller/ShopSelector";
import DateTimePicker from "@/components/common/DateTimePicker";
import { FormLabel } from "@/components/forms/FormLabel";
import AnalyticsOverview from "@/components/seller/AnalyticsOverview";
import SalesChart from "@/components/seller/SalesChart";
import TopProducts from "@/components/seller/TopProducts";
import { analyticsService } from "@/services/analytics.service";
import { toDateInputValue } from "@/lib/date-utils";
import { useLoadingState } from "@/hooks/useLoadingState";

/**
 * AnalyticsData interface
 * 
 * @interface
 * @description Defines the structure and contract for AnalyticsData
 */
interface AnalyticsData {
  /** Revenue */
  revenue: { total: number; average: number; trend: number };
  /** Orders */
  orders: {
    /** Total */
    total: number;
    /** Pending */
    pending: number;
    /** Completed */
    completed: number;
    /** Cancelled */
    cancelled: number;
  };
  /** Products */
  products: { total: number; active: number; outOfStock: number };
  /** Customers */
  customers: { total: number; new: number; returning: number };
  /** Conversion Rate */
  conversionRate: number;
  /** Average Order Value */
  averageOrderValue: number;
  /** Sales Over Time */
  salesOverTime: Array<{ date: string; revenue: number }>;
  /** Top Products */
  topProducts: Array<{
    /** Id */
    id: string;
    /** Name */
    name: string;
    /** Revenue */
    revenue: number;
    /** Quantity */
    quantity: number;
  }>;
  /** Revenue By Category */
  revenueByCategory: Array<{ category: string; revenue: number }>;
}

export default /**
 * Performs analytics page operation
 *
 * @returns {any} The analyticspage result
 *
 */
function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();

  // Filters
  const [selectedShopId, setSelectedShopId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Last 30 days
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());

  const {
    /** Data */
    data: analytics,
    /** Is Loading */
    isLoading: loading,
    error,
    execute,
  } = useLoadingState<AnalyticsData | null>({ initialData: null });

  // Auth guard
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    if (user.role !== "seller" && user.role !== "admin") {
      router.push("/");
      return;
    }
  }, [user, router]);

  // Fetch analytics data
  /**
 * Fetches analytics
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The fetchanalytics result
 *
 */
const fetchAnalytics = useCallback(async () => {
    const data = await analyticsService.getOverview({
      /** Shop Id */
      shopId: selectedShopId || undefined,
      /** Start Date */
      startDate: toDateInputValue(startDate),
      /** End Date */
      endDate: toDateInputValue(endDate),
    });

    // Map analytics overview to detailed analytics format
    return {
      /** Revenue */
      revenue: {
        /** Total */
        total: data.totalRevenue || 0,
        /** Average */
        average: data.averageOrderValue || 0,
        /** Trend */
        trend: data.revenueGrowth || 0,
      },
      /** Orders */
      orders: {
        /** Total */
        total: data.totalOrders || 0,
        /** Pending */
        pending: (data as any).pendingOrders || 0,
        /** Completed */
        completed: (data as any).completedOrders || 0,
        /** Cancelled */
        cancelled: (data as any).cancelledOrders || 0,
      },
      /** Products */
      products: {
        /** Total */
        total: data.totalProducts || 0,
        /** Active */
        active: (data as any).activeProducts || 0,
        /** Out Of Stock */
        outOfStock: (data as any).outOfStockProducts || 0,
      },
      /** Customers */
      customers: {
        /** Total */
        total: data.totalCustomers || 0,
        /** New */
        new: (data as any).newCustomers || 0,
        /** Returning */
        returning: (data as any).returningCustomers || 0,
      },
      /** Conversion Rate */
      conversionRate: data.conversionRate || 0,
      /** Average Order Value */
      averageOrderValue: data.averageOrderValue || 0,
      /** Sales Over Time */
      salesOverTime: (data as any).salesOverTime || [],
      /** Top Products */
      topProducts: (data as any).topProducts || [],
      /** Revenue By Category */
      revenueByCategory: (data as any).revenueByCategory || [],
    };
  }, [selectedShopId, startDate, endDate]);

  useEffect(() => {
    if (user) {
      execute(fetchAnalytics);
    }
  }, [user, execute, fetchAnalytics]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Track your shop's performance and sales metrics
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Filters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Shop Selector */}
            <ShopSelector
              value={selectedShopId}
              onChange={(shopId) => setSelectedShopId(shopId || "")}
              includeAllOption={user.role === "admin"}
            />

            {/* Date Range */}
            <div id="analytics-start-date-wrapper">
              <FormLabel htmlFor="analytics-start-date-wrapper">
                Start Date
              </FormLabel>
              <DateTimePicker
                value={startDate}
                onChange={(date) => date && setStartDate(date)}
              />
            </div>

            <div id="analytics-end-date-wrapper">
              <FormLabel htmlFor="analytics-end-date-wrapper">
                End Date
              </FormLabel>
              <DateTimePicker
                value={endDate}
                onChange={(date) => date && setEndDate(date)}
              />
            </div>
          </div>

          {/* Quick Filters */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => {
                const date = new Date();
                date.setDate(date.getDate() - 7);
                setStartDate(date);
                setEndDate(new Date());
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Last 7 Days
            </button>
            <button
              onClick={() => {
                const date = new Date();
                date.setDate(date.getDate() - 30);
                setStartDate(date);
                setEndDate(new Date());
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Last 30 Days
            </button>
            <button
              onClick={() => {
                const date = new Date();
                date.setDate(date.getDate() - 90);
                setStartDate(date);
                setEndDate(new Date());
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Last 90 Days
            </button>
            <button
              onClick={() => {
                const date = new Date();
                date.setMonth(0, 1); // January 1st
                setStartDate(date);
                setEndDate(new Date());
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              Year to Date
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading analytics...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-8">
            <p className="text-red-800 dark:text-red-400">
              {error.message || String(error)}
            </p>
          </div>
        )}

        {/* Analytics Content */}
        {!loading && !error && analytics && (
          <div className="space-y-8">
            {/* Overview Stats */}
            <AnalyticsOverview data={analytics} />

            {/* Sales Chart */}
            <SalesChart data={analytics.salesOverTime} />

            {/* Top Products */}
            <TopProducts data={analytics.topProducts} />

            {/* Additional Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Order Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Completed
                    </span>
                    <span className="text-lg font-semibold text-green-600 dark:text-green-400">
                      {analytics.orders.completed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Pending
                    </span>
                    <span className="text-lg font-semibold text-yellow-600 dark:text-yellow-400">
                      {analytics.orders.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Cancelled
                    </span>
                    <span className="text-lg font-semibold text-red-600 dark:text-red-400">
                      {analytics.orders.cancelled}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Key Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Average Order Value
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {new Intl.NumberFormat("en-IN", {
                        /** Style */
                        style: "currency",
                        /** Currency */
                        currency: "INR",
                        /** Maximum Fraction Digits */
                        maximumFractionDigits: 0,
                      }).format(analytics.averageOrderValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Conversion Rate
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {analytics.conversionRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total Customers
                    </span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      {analytics.customers.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
