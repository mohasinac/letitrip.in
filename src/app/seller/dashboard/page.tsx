"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { SellerService } from "@/lib/services/seller.service";
import {
  useRealTimeData,
  useRealTimeNotifications,
  useMultipleRealTimeData,
} from "@/hooks/useRealTimeData";
// Enhanced Seller Dashboard Components
import EnhancedSellerStatsCards from "@/components/seller/EnhancedSellerStatsCards";
import EnhancedSellerSalesChart from "@/components/seller/EnhancedSellerSalesChart";
import EnhancedSellerQuickActions from "@/components/seller/EnhancedSellerQuickActions";
import SellerNotificationCenter from "@/components/seller/SellerNotificationCenter";
import SellerPerformanceMetrics from "@/components/seller/SellerPerformanceMetrics";
import RealTimeIndicator from "@/components/ui/RealTimeIndicator";

// Fallback components
import SellerStatsCards from "@/components/seller/SellerStatsCards";
import SellerSalesChart from "@/components/seller/SellerSalesChart";
import SellerQuickActions from "@/components/seller/SellerQuickActions";
import SellerNotifications from "@/components/seller/SellerNotifications";

export default function SellerDashboard() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");
  const [refreshKey, setRefreshKey] = useState(0);
  const [storeInfo, setStoreInfo] = useState<{
    storeName?: string;
    storeStatus?: string;
  }>({});
  const [showStoreSetupAlert, setShowStoreSetupAlert] = useState(false);

  // Load store information
  useEffect(() => {
    const loadStoreInfo = async () => {
      if (!user?.id || !user.getIdToken) return;

      try {
        const token = await user.getIdToken();
        const response = await fetch("/api/seller/store-settings", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setStoreInfo({
            storeName: data.storeName,
            storeStatus: data.storeStatus,
          });

          // Show setup alert if store is not properly configured
          setShowStoreSetupAlert(
            !data.storeName ||
              data.storeStatus === "offline" ||
              data.storeName.includes("'s Store") // Default generated name
          );
        }
      } catch (error) {
        console.error("Failed to load store info:", error);
      }
    };

    loadStoreInfo();
  }, [user?.id]);

  // Real-time data hooks
  const dashboardData = useMultipleRealTimeData({
    stats: {
      fetchFunction: () => SellerService.getDashboardStats(user?.id),
      options: { interval: 30000 }, // 30 seconds
    },
    analytics: {
      fetchFunction: () => SellerService.getAnalytics(user?.id, selectedPeriod),
      options: {
        interval: 60000, // 1 minute
        dependencies: [selectedPeriod],
      },
    },
  });

  const notifications = useRealTimeNotifications();

  // Manual refresh function
  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
    dashboardData.refreshAll();
    notifications.refresh();
  };

  // Auto-refresh on period change
  useEffect(() => {
    dashboardData.refreshAll();
  }, [selectedPeriod]);

  // Check for important alerts
  useEffect(() => {
    if (dashboardData.stats.data) {
      const { pendingOrders, goalProgress } = dashboardData.stats.data;

      if (pendingOrders > 20) {
        console.warn(`Alert: ${pendingOrders} orders are pending processing`);
      }

      if (goalProgress < 25 && new Date().getDate() > 20) {
        console.warn("Goal progress is behind schedule for this month");
      }
    }
  }, [dashboardData.stats.data]);

  const isLoading = dashboardData.isAnyLoading;
  const hasError = dashboardData.hasAnyError;

  // Calculate store health status
  const getStoreStatus = () => {
    if (!dashboardData.stats.data) return "unknown";

    const { activeProducts, pendingOrders, averageRating } =
      dashboardData.stats.data;

    if (activeProducts < 5 || averageRating < 3.5 || pendingOrders > 30) {
      return "warning";
    }

    if (averageRating >= 4.5 && pendingOrders <= 5) {
      return "excellent";
    }

    return "good";
  };

  const storeStatus = getStoreStatus();

  return (
    <div className="seller-layout">
      {/* Enhanced Header */}
      <div className="seller-header">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-3xl font-bold text-primary">
                  {storeInfo.storeName || "Seller Dashboard"}
                </h1>
                <div className="mt-1 text-sm text-secondary flex items-center">
                  Welcome back, {user?.name || user?.displayName}!
                  {storeInfo.storeName
                    ? " Here's your store overview."
                    : " Please set up your store in Settings."}
                  <RealTimeIndicator
                    isConnected={dashboardData.allConnected}
                    className="ml-2"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* Store Status */}
              <div
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                  storeStatus === "excellent"
                    ? "bg-green-50"
                    : storeStatus === "good"
                    ? "bg-blue-50"
                    : storeStatus === "warning"
                    ? "bg-yellow-50"
                    : "bg-gray-50"
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    storeStatus === "excellent"
                      ? "bg-green-500 animate-pulse"
                      : storeStatus === "good"
                      ? "bg-blue-500 animate-pulse"
                      : storeStatus === "warning"
                      ? "bg-yellow-500 animate-pulse"
                      : "bg-gray-500"
                  }`}
                ></div>
                <span
                  className={`text-sm font-medium ${
                    storeStatus === "excellent"
                      ? "text-green-700"
                      : storeStatus === "good"
                      ? "text-blue-700"
                      : storeStatus === "warning"
                      ? "text-yellow-700"
                      : "text-gray-700"
                  }`}
                >
                  Store{" "}
                  {storeStatus === "excellent"
                    ? "Excellent"
                    : storeStatus === "good"
                    ? "Active"
                    : storeStatus === "warning"
                    ? "Needs Attention"
                    : "Status"}
                </span>
              </div>

              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value as any)}
                className="input"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh Dashboard"
              >
                <svg
                  className={`w-5 h-5 ${isLoading ? "animate-spin" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>

              {/* Notifications */}
              <SellerNotificationCenter
                notifications={notifications.notifications}
                unreadCount={notifications.unreadCount}
                onMarkAsRead={notifications.markAsRead}
                loading={notifications.loading}
              />

              {/* Quick Actions */}
              <Link href="/seller/products/new" className="btn btn-primary">
                Add Product
              </Link>
              <Link href="/seller/auctions/new" className="btn btn-success">
                Create Auction
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {hasError && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">
                Some dashboard data couldn't be loaded. Using cached data where
                available.
                <button
                  onClick={handleRefresh}
                  className="ml-2 underline hover:no-underline"
                >
                  Try again
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Store Setup Alert */}
      {showStoreSetupAlert && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Complete your store setup:</strong> Your store is
                currently offline and using a default name.
                {!storeInfo.storeName && " Set your store name,"}
                {storeInfo.storeStatus === "offline" &&
                  " change status to 'Live' to start selling,"}
                {storeInfo.storeName?.includes("'s Store") &&
                  " customize your store name,"}
                {" and configure your store settings."}
                <Link
                  href="/seller/settings?tab=store"
                  className="font-medium text-yellow-800 hover:underline ml-2"
                >
                  Complete Setup →
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Performance Metrics */}
          <SellerPerformanceMetrics
            stats={dashboardData.stats.data}
            analytics={dashboardData.analytics.data}
            loading={isLoading}
            period={selectedPeriod}
          />

          {/* Enhanced Stats Cards */}
          {dashboardData.stats.data ? (
            <EnhancedSellerStatsCards
              stats={dashboardData.stats.data}
              loading={dashboardData.stats.loading}
              lastUpdated={dashboardData.stats.lastUpdated}
            />
          ) : (
            <SellerStatsCards />
          )}

          {/* Charts and Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {dashboardData.analytics.data ? (
                <EnhancedSellerSalesChart
                  data={dashboardData.analytics.data.salesData}
                  loading={dashboardData.analytics.loading}
                  period={selectedPeriod}
                />
              ) : (
                <SellerSalesChart />
              )}
            </div>
            <div>
              <EnhancedSellerQuickActions
                stats={dashboardData.stats.data}
                onRefresh={handleRefresh}
              />
            </div>
          </div>

          {/* Orders, Products, and Performance Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Orders Placeholder */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Orders
              </h3>
              <p className="text-gray-500">Orders management coming soon...</p>
            </div>

            {/* Products Placeholder */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Top Products
              </h3>
              <p className="text-gray-500">Product analytics coming soon...</p>
            </div>

            {/* Auctions Placeholder */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Active Auctions
              </h3>
              <p className="text-gray-500">Auction management coming soon...</p>
            </div>
          </div>

          {/* Notifications */}
          <SellerNotifications />
        </div>
      </div>
    </div>
  );
}
