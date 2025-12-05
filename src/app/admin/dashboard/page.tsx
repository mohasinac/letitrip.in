/**
 * @fileoverview React Component
 * @module src/app/admin/dashboard/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { analyticsService } from "@/services/analytics.service";
import {
  Activity,
  AlertCircle,
  Clock,
  DollarSign,
  Gavel,
  Loader2,
  Package,
  RefreshCw,
  ShoppingCart,
  Store,
  Ticket,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

/**
 * DashboardStats interface
 * 
 * @interface
 * @description Defines the structure and contract for DashboardStats
 */
interface DashboardStats {
  /** Overview */
  overview: {
    /** Total Users */
    totalUsers: number;
    /** Total Sellers */
    totalSellers: number;
    /** Total Shops */
    totalShops: number;
    /** Total Products */
    totalProducts: number;
    /** Total Orders */
    totalOrders: number;
    /** Total Revenue */
    totalRevenue: number;
    /** Active Auctions */
    activeAuctions: number;
    /** Total Coupons */
    totalCoupons: number;
  };
  /** Trends */
  trends: {
    /** Users */
    users: { value: number; isPositive: boolean };
    /** Shops */
    shops: { value: number; isPositive: boolean };
    /** Products */
    products: { value: number; isPositive: boolean };
    /** Orders */
    orders: { value: number; isPositive: boolean };
    /** Revenue */
    revenue: { value: number; isPositive: boolean };
  };
  /** Recent Activity */
  recentActivity: Array<{
    /** Id */
    id: string;
    /** Type */
    type: string;
    /** Message */
    message: string;
    /** Time */
    time: string;
    /** Status */
    status: "success" | "warning" | "info" | "error";
  }>;
  /** Pending Actions */
  pendingActions: {
    /** Pending Shops */
    pendingShops: number;
    /** Pending Products */
    pendingProducts: number;
    /** Pending Returns */
    pendingReturns: number;
    /** Open Tickets */
    openTickets: number;
  };
}

export default /**
 * Performs admin dashboard page operation
 *
 * @returns {any} The admindashboardpage result
 *
 */
function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const {
    /** Is Loading */
    isLoading: loading,
    /** Data */
    data: stats,
    execute,
  } = useLoadingState<DashboardStats>({
    /** On Load Error */
    onLoadError: (err) => {
      logError(err, { component: "AdminDashboardPage.loadStats" });
    },
  });

  useEffect(() => {
    /**
     * Fetches stats from server
     *
     * @returns {Promise<any>} Promise resolving to stats result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    /**
     * Fetches stats from server
     *
     * @returns {Promise<any>} Promise resolving to stats result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    const loadStats = () =>
      execute(async () => {
        const data = await analyticsService.getOverview();

        // Map analytics data to dashboard stats format
        return {
          /** Overview */
          overview: {
            /** Total Users */
            totalUsers: (data as any).totalUsers || data.totalCustomers || 0,
            /** Total Sellers */
            totalSellers: (data as any).totalSellers || 0,
            /** Total Shops */
            totalShops: (data as any).totalShops || 0,
            /** Total Products */
            totalProducts: data.totalProducts || 0,
            /** Total Orders */
            totalOrders: data.totalOrders || 0,
            /** Total Revenue */
            totalRevenue: data.totalRevenue || 0,
            /** Active Auctions */
            activeAuctions: (data as any).activeAuctions || 0,
            /** Total Coupons */
            totalCoupons: (data as any).totalCoupons || 0,
          },
          /** Trends */
          trends: (data as any).trends || {
            /** Users */
            users: { value: 0, isPositive: true },
            /** Shops */
            shops: { value: 0, isPositive: true },
            /** Products */
            products: { value: 0, isPositive: true },
            /** Orders */
            orders: {
              /** Value */
              value: data.ordersGrowth || 0,
              /** Is Positive */
              isPositive: (data.ordersGrowth || 0) >= 0,
            },
            /** Revenue */
            revenue: {
              /** Value */
              value: data.revenueGrowth || 0,
              /** Is Positive */
              isPositive: (data.revenueGrowth || 0) >= 0,
            },
          },
          /** Recent Activity */
          recentActivity: (data as any).recentActivity || [],
          /** Pending Actions */
          pendingActions: (data as any).pendingActions || {
            /** Pending Shops */
            pendingShops: 0,
            /** Pending Products */
            pendingProducts: 0,
            /** Pending Returns */
            pendingReturns: 0,
            /** Open Tickets */
            openTickets: 0,
          },
        };
      });

    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  const statsCards = [
    {
      /** Title */
      title: "Total Users",
      /** Value */
      value: stats?.overview.totalUsers || 0,
      /** Change */
      change: stats?.trends.users.value || 0,
      /** Trend */
      trend: stats?.trends.users.isPositive ? "up" : "down",
      /** Icon */
      icon: Users,
      /** Color */
      color: "blue",
      /** Href */
      href: "/admin/users",
    },
    {
      /** Title */
      title: "Active Shops",
      /** Value */
      value: stats?.overview.totalShops || 0,
      /** Change */
      change: stats?.trends.shops.value || 0,
      /** Trend */
      trend: stats?.trends.shops.isPositive ? "up" : "down",
      /** Icon */
      icon: Store,
      /** Color */
      color: "purple",
      /** Href */
      href: "/admin/shops",
    },
    {
      /** Title */
      title: "Total Products",
      /** Value */
      value: stats?.overview.totalProducts || 0,
      /** Change */
      change: stats?.trends.products.value || 0,
      /** Trend */
      trend: stats?.trends.products.isPositive ? "up" : "down",
      /** Icon */
      icon: Package,
      /** Color */
      color: "green",
      /** Href */
      href: "/admin/products",
    },
    {
      /** Title */
      title: "Total Orders",
      /** Value */
      value: stats?.overview.totalOrders || 0,
      /** Change */
      change: stats?.trends.orders.value || 0,
      /** Trend */
      trend: stats?.trends.orders.isPositive ? "up" : "down",
      /** Icon */
      icon: ShoppingCart,
      /** Color */
      color: "orange",
      /** Href */
      href: "/admin/orders",
    },
    {
      /** Title */
      title: "Revenue",
      /** Value */
      value: `₹${((stats?.overview.totalRevenue || 0) / 100000).toFixed(1)}L`,
      /** Change */
      change: stats?.trends.revenue.value || 0,
      /** Trend */
      trend: stats?.trends.revenue.isPositive ? "up" : "down",
      /** Icon */
      icon: DollarSign,
      /** Color */
      color: "emerald",
      /** Href */
      href: "/admin/payments",
    },
    {
      /** Title */
      title: "Active Auctions",
      /** Value */
      value: stats?.overview.activeAuctions || 0,
      /** Change */
      change: 0,
      /** Trend */
      trend: "up" as const,
      /** Icon */
      icon: Gavel,
      /** Color */
      color: "amber",
      /** Href */
      href: "/admin/auctions/live",
    },
    {
      /** Title */
      title: "Active Coupons",
      /** Value */
      value: stats?.overview.totalCoupons || 0,
      /** Change */
      change: 0,
      /** Trend */
      trend: "up" as const,
      /** Icon */
      icon: Ticket,
      /** Color */
      color: "pink",
      /** Href */
      href: "/admin/coupons",
    },
    {
      /** Title */
      title: "Sellers",
      /** Value */
      value: stats?.overview.totalSellers || 0,
      /** Change */
      change: 0,
      /** Trend */
      trend: "up" as const,
      /** Icon */
      icon: Store,
      /** Color */
      color: "indigo",
      /** Href */
      href: "/admin/users?role=seller",
    },
  ];

  const pendingActions = [
    {
      /** Title */
      title: "Pending Shops",
      /** Count */
      count: stats?.pendingActions.pendingShops || 0,
      /** Href */
      href: "/admin/shops?status=pending",
      /** Icon */
      icon: Store,
      /** Color */
      color: "yellow",
    },
    {
      /** Title */
      title: "Pending Products",
      /** Count */
      count: stats?.pendingActions.pendingProducts || 0,
      /** Href */
      href: "/admin/products?status=pending",
      /** Icon */
      icon: Package,
      /** Color */
      color: "blue",
    },
    {
      /** Title */
      title: "Pending Returns",
      /** Count */
      count: stats?.pendingActions.pendingReturns || 0,
      /** Href */
      href: "/admin/returns?status=pending",
      /** Icon */
      icon: RefreshCw,
      /** Color */
      color: "orange",
    },
    {
      /** Title */
      title: "Open Tickets",
      /** Count */
      count: stats?.pendingActions.openTickets || 0,
      /** Href */
      href: "/admin/support-tickets?status=open",
      /** Icon */
      icon: AlertCircle,
      /** Color */
      color: "red",
    },
  ];

  /**
   * Retrieves activity icon
   *
   * @param {string} type - The type
   *
   * @returns {string} The activityicon result
   */

  /**
   * Retrieves activity icon
   *
   * @param {string} type - The type
   *
   * @returns {string} The activityicon result
   */

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "user":
        return Users;
      case "shop":
        return Store;
      case "order":
        return ShoppingCart;
      case "product":
        return Package;
      case "ticket":
        return AlertCircle;
      /** Default */
      default:
        return Activity;
    }
  };

  /**
   * Retrieves activity color
   *
   * @param {string} status - The status
   *
   * @returns {string} The activitycolor result
   */

  /**
   * Retrieves activity color
   *
   * @param {string} status - The status
   *
   * @returns {string} The activitycolor result
   */

  const getActivityColor = (status: string) => {
    switch (status) {
      case "success":
        return "green";
      case "warning":
        return "yellow";
      case "error":
        return "red";
      /** Default */
      default:
        return "blue";
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Welcome back, {user?.fullName || "Admin"}! Here's your platform
            overview.
          </p>
        </div>
        <button
          onClick={() => globalThis.location?.reload()}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === "up" ? TrendingUp : TrendingDown;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-yellow-200 dark:hover:border-yellow-600 transition-all"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-lg`}
                >
                  <Icon
                    className={`h-6 w-6 text-${stat.color}-600 dark:text-${stat.color}-400`}
                  />
                </div>
                {stat.change > 0 && (
                  <div className="flex items-center gap-1 text-sm">
                    <TrendIcon
                      className={`h-4 w-4 ${
                        stat.trend === "up"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        stat.trend === "up"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {stat.change}%
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </h3>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pending Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Actions Required
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pendingActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className={`bg-${action.color}-50 dark:bg-${action.color}-900/20 border border-${action.color}-200 dark:border-${action.color}-800 rounded-lg p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 bg-${action.color}-100 dark:bg-${action.color}-900/40 rounded-lg`}
                    >
                      <Icon
                        className={`h-5 w-5 text-${action.color}-600 dark:text-${action.color}-400`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {action.title}
                      </p>
                      <p
                        className={`text-2xl font-bold text-${action.color}-600 dark:text-${action.color}-400`}
                      >
                        {action.count}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recent Activity
          </h2>
          {/* NOTE: /admin/analytics does not exist - link to orders for now */}
          <Link
            href="/admin/orders"
            className="text-sm text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-300 font-medium"
          >
            View All →
          </Link>
        </div>
        <div className="space-y-4">
          {stats?.recentActivity.map((activity) => {
            const Icon = getActivityIcon(activity.type);
            const color = getActivityColor(activity.status);
            return (
              <div
                key={activity.id}
                className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-10 w-10 rounded-full bg-${color}-100 dark:bg-${color}-900/30 flex items-center justify-center`}
                  >
                    <Icon
                      className={`h-5 w-5 text-${color}-600 dark:text-${color}-400`}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-gray-400 dark:text-gray-500" />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                </div>
                {activity.status === "warning" && (
                  <button className="text-xs text-yellow-600 dark:text-yellow-400 hover:text-yellow-700 font-medium px-3 py-1 border border-yellow-300 dark:border-yellow-600 rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20 transition-colors">
                    Review
                  </button>
                )}
                {activity.status === "error" && (
                  <button className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-medium px-3 py-1 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    View
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Links Grid */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Links
        </h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { label: "Users", href: "/admin/users", icon: Users },
            { label: "Shops", href: "/admin/shops", icon: Store },
            { label: "Products", href: "/admin/products", icon: Package },
            { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
            { label: "Auctions", href: "/admin/auctions", icon: Gavel },
            { label: "Analytics", href: "/admin/analytics", icon: Activity },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-yellow-200 dark:hover:border-yellow-600 transition-all"
              >
                <Icon className="h-6 w-6 text-gray-600 dark:text-gray-400 mb-2" />
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {link.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
