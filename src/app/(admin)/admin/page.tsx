"use client";

import { Quantity } from "@letitrip/react-library";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@letitrip/react-library";
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

interface DashboardStats {
  totalUsers: number;
  totalSellers: number;
  totalShops: number;
  totalCategories: number;
  totalProducts: number;
  totalOrders: number;
  activeUsers: number;
  pendingOrders: number;
}

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const {
    isLoading: loading,
    data: stats,
    execute,
  } = useLoadingState<DashboardStats>({
    initialData: {
      totalUsers: 0,
      totalSellers: 0,
      totalShops: 0,
      totalCategories: 0,
      totalProducts: 0,
      totalOrders: 0,
      activeUsers: 0,
      pendingOrders: 0,
    },
    onLoadError: (err) => {
      logError(err, { component: "AdminDashboardPage.loadStats" });
    },
  });

  useEffect(() => {
    const loadStats = () =>
      execute(async () => {
        const data = await analyticsService.getOverview();
        return {
          totalUsers: (data as any).totalUsers || data.totalCustomers || 0,
          totalSellers: (data as any).totalSellers || 0,
          totalShops: (data as any).totalShops || 0,
          totalCategories: (data as any).totalCategories || 0,
          totalProducts: data.totalProducts || 0,
          totalOrders: data.totalOrders || 0,
          activeUsers: (data as any).activeUsers || 0,
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
      title: "User Management",
      description: "Manage users, roles, and permissions",
      href: "/admin/users",
      icon: Users,
      color: "blue",
      stats: `${stats?.totalUsers || 0} users`,
    },
    {
      title: "Category Management",
      description: "Organize products into categories",
      href: "/admin/categories",
      icon: FolderTree,
      color: "green",
      stats: `${stats?.totalCategories || 0} categories`,
    },
    {
      title: "Shop Management",
      description: "Review and manage seller shops",
      href: "/admin/shops",
      icon: Store,
      color: "purple",
      stats: `${stats?.totalShops || 0} shops`,
    },
    {
      title: "Product Management",
      description: "Monitor and moderate product listings",
      href: "/admin/products",
      icon: Package,
      color: "orange",
      stats: `${stats?.totalProducts || 0} products`,
    },
  ];

  const statsCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
      color: "blue",
    },
    {
      title: "Active Shops",
      value: stats?.totalShops || 0,
      change: "+8.3%",
      trend: "up" as const,
      icon: Store,
      color: "purple",
    },
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      change: "+23.1%",
      trend: "up" as const,
      icon: Package,
      color: "green",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      change: "+15.7%",
      trend: "up" as const,
      icon: ShoppingCart,
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
