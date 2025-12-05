/**
 * @fileoverview React Component
 * @module src/app/admin/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { Quantity } from "@/components/common/values/Quantity";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import { logError } from "@/lib/firebase-error-logger";
import { analyticsService } from "@/services/analytics.service";
import {
  ArrowRight,
  FolderTree,
  Loader2,
  Package,
  ShoppingCart,
  Store,
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
  /** Total Users */
  totalUsers: number;
  /** Total Sellers */
  totalSellers: number;
  /** Total Shops */
  totalShops: number;
  /** Total Categories */
  totalCategories: number;
  /** Total Products */
  totalProducts: number;
  /** Total Orders */
  totalOrders: number;
  /** Active Users */
  activeUsers: number;
  /** Pending Orders */
  pendingOrders: number;
}

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const {
    /** Is Loading */
    isLoading: loading,
    /** Data */
    data: stats,
    execute,
  } = useLoadingState<DashboardStats>({
    /** Initial Data */
    initialData: {
      /** Total Users */
      totalUsers: 0,
      /** Total Sellers */
      totalSellers: 0,
      /** Total Shops */
      totalShops: 0,
      /** Total Categories */
      totalCategories: 0,
      /** Total Products */
      totalProducts: 0,
      /** Total Orders */
      totalOrders: 0,
      /** Active Users */
      activeUsers: 0,
      /** Pending Orders */
      pendingOrders: 0,
    },
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
        return {
          /** Total Users */
          totalUsers: (data as any).totalUsers || data.totalCustomers || 0,
          /** Total Sellers */
          totalSellers: (data as any).totalSellers || 0,
          /** Total Shops */
          totalShops: (data as any).totalShops || 0,
          /** Total Categories */
          totalCategories: (data as any).totalCategories || 0,
          /** Total Products */
          totalProducts: data.totalProducts || 0,
          /** Total Orders */
          totalOrders: data.totalOrders || 0,
          /** Active Users */
          activeUsers: (data as any).activeUsers || 0,
          /** Pending Orders */
          pendingOrders: (data as any).pendingOrders || 0,
        };
      });

    if (isAdmin) {
      loadStats();
    }
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const quickActions = [
    {
      /** Title */
      title: "User Management",
      /** Description */
      description: "Manage users, roles, and permissions",
      /** Href */
      href: "/admin/users",
      /** Icon */
      icon: Users,
      /** Color */
      color: "blue",
      /** Stats */
      stats: `${stats?.totalUsers || 0} users`,
    },
    {
      /** Title */
      title: "Category Management",
      /** Description */
      description: "Organize products into categories",
      /** Href */
      href: "/admin/categories",
      /** Icon */
      icon: FolderTree,
      /** Color */
      color: "green",
      /** Stats */
      stats: `${stats?.totalCategories || 0} categories`,
    },
    {
      /** Title */
      title: "Shop Management",
      /** Description */
      description: "Review and manage seller shops",
      /** Href */
      href: "/admin/shops",
      /** Icon */
      icon: Store,
      /** Color */
      color: "purple",
      /** Stats */
      stats: `${stats?.totalShops || 0} shops`,
    },
    {
      /** Title */
      title: "Product Management",
      /** Description */
      description: "Monitor and moderate product listings",
      /** Href */
      href: "/admin/products",
      /** Icon */
      icon: Package,
      /** Color */
      color: "orange",
      /** Stats */
      stats: `${stats?.totalProducts || 0} products`,
    },
  ];

  const statsCards = [
    {
      /** Title */
      title: "Total Users",
      /** Value */
      value: stats?.totalUsers || 0,
      /** Change */
      change: "+12.5%",
      /** Trend */
      trend: "up" as const,
      /** Icon */
      icon: Users,
      /** Color */
      color: "blue",
    },
    {
      /** Title */
      title: "Active Shops",
      /** Value */
      value: stats?.totalShops || 0,
      /** Change */
      change: "+8.3%",
      /** Trend */
      trend: "up" as const,
      /** Icon */
      icon: Store,
      /** Color */
      color: "purple",
    },
    {
      /** Title */
      title: "Total Products",
      /** Value */
      value: stats?.totalProducts || 0,
      /** Change */
      change: "+23.1%",
      /** Trend */
      trend: "up" as const,
      /** Icon */
      icon: Package,
      /** Color */
      color: "green",
    },
    {
      /** Title */
      title: "Total Orders",
      /** Value */
      value: stats?.totalOrders || 0,
      /** Change */
      change: "+15.7%",
      /** Trend */
      trend: "up" as const,
      /** Icon */
      icon: ShoppingCart,
      /** Color */
      color: "orange",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div>
        {" "}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back, {user?.fullName || "Admin"}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.title}
              className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md dark:hover:shadow-gray-900/30 transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3 bg-${stat.color}-100 rounded-lg`}>
                  <Icon className={`h-6 w-6 text-${stat.color}-600`} />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-green-600 font-medium">
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {stat.title}
                </h3>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                  <Quantity value={stat.value} />
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg hover:border-purple-200 dark:hover:border-purple-700 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 bg-${action.color}-100 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    {action.description}
                  </p>
                  <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {action.stats}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New user registered
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  2 minutes ago
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              Just now
            </span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Store className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  New shop pending approval
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  15 minutes ago
                </p>
              </div>
            </div>
            <Link
              href="/admin/shops/pending"
              className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
            >
              Review
            </Link>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  5 new products listed
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  1 hour ago
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              1h ago
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
