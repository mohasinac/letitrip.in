"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import ShopSelector from "@/components/seller/ShopSelector";
import DateTimePicker from "@/components/common/DateTimePicker";
import AnalyticsOverview from "@/components/seller/AnalyticsOverview";
import SalesChart from "@/components/seller/SalesChart";
import TopProducts from "@/components/seller/TopProducts";
import { Calendar } from "lucide-react";

interface AnalyticsData {
  revenue: { total: number; average: number; trend: number };
  orders: {
    total: number;
    pending: number;
    completed: number;
    cancelled: number;
  };
  products: { total: number; active: number; outOfStock: number };
  customers: { total: number; new: number; returning: number };
  conversionRate: number;
  averageOrderValue: number;
  salesOverTime: Array<{ date: string; revenue: number }>;
  topProducts: Array<{
    id: string;
    name: string;
    revenue: number;
    quantity: number;
  }>;
  revenueByCategory: Array<{ category: string; revenue: number }>;
}

export default function AnalyticsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  // Filters
  const [selectedShopId, setSelectedShopId] = useState<string>("");
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Last 30 days
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(new Date());

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
  useEffect(() => {
    if (!user) return;

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (selectedShopId) {
          params.append("shop_id", selectedShopId);
        }
        params.append("start_date", startDate.toISOString());
        params.append("end_date", endDate.toISOString());

        const response = await fetch(`/api/analytics?${params.toString()}`);
        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error || "Failed to fetch analytics");
        }

        setAnalytics(result.data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load analytics",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, selectedShopId, startDate, endDate]);

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Track your shop's performance and sales metrics
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Shop Selector */}
            <ShopSelector
              value={selectedShopId}
              onChange={(shopId) => setSelectedShopId(shopId || "")}
              includeAllOption={user.role === "admin"}
            />

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <DateTimePicker
                value={startDate}
                onChange={(date) => date && setStartDate(date)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
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
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
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
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Year to Date
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading analytics...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <p className="text-red-800">{error}</p>
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
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Status
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Completed</span>
                    <span className="text-lg font-semibold text-green-600">
                      {analytics.orders.completed}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending</span>
                    <span className="text-lg font-semibold text-yellow-600">
                      {analytics.orders.pending}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cancelled</span>
                    <span className="text-lg font-semibold text-red-600">
                      {analytics.orders.cancelled}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Key Metrics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average Order Value</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(analytics.averageOrderValue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Conversion Rate</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {analytics.conversionRate.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Customers</span>
                    <span className="text-lg font-semibold text-gray-900">
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
