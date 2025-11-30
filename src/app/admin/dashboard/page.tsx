"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { analyticsService } from "@/services/analytics.service";
import Link from "next/link";
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Loader2,
  DollarSign,
  Activity,
  AlertCircle,
  Clock,
  Gavel,
  Ticket,
  RefreshCw,
} from "lucide-react";

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalSellers: number;
    totalShops: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
    activeAuctions: number;
    totalCoupons: number;
  };
  trends: {
    users: { value: number; isPositive: boolean };
    shops: { value: number; isPositive: boolean };
    products: { value: number; isPositive: boolean };
    orders: { value: number; isPositive: boolean };
    revenue: { value: number; isPositive: boolean };
  };
  recentActivity: Array<{
    id: string;
    type: string;
    message: string;
    time: string;
    status: "success" | "warning" | "info" | "error";
  }>;
  pendingActions: {
    pendingShops: number;
    pendingProducts: number;
    pendingReturns: number;
    openTickets: number;
  };
}

export default function AdminDashboardPage() {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await analyticsService.getOverview();

        // Map analytics data to dashboard stats format
        setStats({
          overview: {
            totalUsers: (data as any).totalUsers || data.totalCustomers || 0,
            totalSellers: (data as any).totalSellers || 0,
            totalShops: (data as any).totalShops || 0,
            totalProducts: data.totalProducts || 0,
            totalOrders: data.totalOrders || 0,
            totalRevenue: data.totalRevenue || 0,
            activeAuctions: (data as any).activeAuctions || 0,
            totalCoupons: (data as any).totalCoupons || 0,
          },
          trends: (data as any).trends || {
            users: { value: 0, isPositive: true },
            shops: { value: 0, isPositive: true },
            products: { value: 0, isPositive: true },
            orders: {
              value: data.ordersGrowth || 0,
              isPositive: (data.ordersGrowth || 0) >= 0,
            },
            revenue: {
              value: data.revenueGrowth || 0,
              isPositive: (data.revenueGrowth || 0) >= 0,
            },
          },
          recentActivity: (data as any).recentActivity || [],
          pendingActions: (data as any).pendingActions || {
            pendingShops: 0,
            pendingProducts: 0,
            pendingReturns: 0,
            openTickets: 0,
          },
        });
      } catch (error) {
        console.error("Failed to load stats:", error);

        // Set empty data structure
        setStats({
          overview: {
            totalUsers: 0,
            totalSellers: 0,
            totalShops: 0,
            totalProducts: 0,
            totalOrders: 0,
            totalRevenue: 0,
            activeAuctions: 0,
            totalCoupons: 0,
          },
          trends: {
            users: { value: 0, isPositive: true },
            shops: { value: 0, isPositive: true },
            products: { value: 0, isPositive: true },
            orders: { value: 0, isPositive: true },
            revenue: { value: 0, isPositive: true },
          },
          recentActivity: [],
          pendingActions: {
            pendingShops: 0,
            pendingProducts: 0,
            pendingReturns: 0,
            openTickets: 0,
          },
        });
      } finally {
        setLoading(false);
      }
    };

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
      title: "Total Users",
      value: stats?.overview.totalUsers || 0,
      change: stats?.trends.users.value || 0,
      trend: stats?.trends.users.isPositive ? "up" : "down",
      icon: Users,
      color: "blue",
      href: "/admin/users",
    },
    {
      title: "Active Shops",
      value: stats?.overview.totalShops || 0,
      change: stats?.trends.shops.value || 0,
      trend: stats?.trends.shops.isPositive ? "up" : "down",
      icon: Store,
      color: "purple",
      href: "/admin/shops",
    },
    {
      title: "Total Products",
      value: stats?.overview.totalProducts || 0,
      change: stats?.trends.products.value || 0,
      trend: stats?.trends.products.isPositive ? "up" : "down",
      icon: Package,
      color: "green",
      href: "/admin/products",
    },
    {
      title: "Total Orders",
      value: stats?.overview.totalOrders || 0,
      change: stats?.trends.orders.value || 0,
      trend: stats?.trends.orders.isPositive ? "up" : "down",
      icon: ShoppingCart,
      color: "orange",
      href: "/admin/orders",
    },
    {
      title: "Revenue",
      value: `₹${((stats?.overview.totalRevenue || 0) / 100000).toFixed(1)}L`,
      change: stats?.trends.revenue.value || 0,
      trend: stats?.trends.revenue.isPositive ? "up" : "down",
      icon: DollarSign,
      color: "emerald",
      href: "/admin/payments",
    },
    {
      title: "Active Auctions",
      value: stats?.overview.activeAuctions || 0,
      change: 0,
      trend: "up" as const,
      icon: Gavel,
      color: "amber",
      href: "/admin/auctions/live",
    },
    {
      title: "Active Coupons",
      value: stats?.overview.totalCoupons || 0,
      change: 0,
      trend: "up" as const,
      icon: Ticket,
      color: "pink",
      href: "/admin/coupons",
    },
    {
      title: "Sellers",
      value: stats?.overview.totalSellers || 0,
      change: 0,
      trend: "up" as const,
      icon: Store,
      color: "indigo",
      href: "/admin/users?role=seller",
    },
  ];

  const pendingActions = [
    {
      title: "Pending Shops",
      count: stats?.pendingActions.pendingShops || 0,
      href: "/admin/shops?status=pending",
      icon: Store,
      color: "yellow",
    },
    {
      title: "Pending Products",
      count: stats?.pendingActions.pendingProducts || 0,
      href: "/admin/products?status=pending",
      icon: Package,
      color: "blue",
    },
    {
      title: "Pending Returns",
      count: stats?.pendingActions.pendingReturns || 0,
      href: "/admin/returns?status=pending",
      icon: RefreshCw,
      color: "orange",
    },
    {
      title: "Open Tickets",
      count: stats?.pendingActions.openTickets || 0,
      href: "/admin/support-tickets?status=open",
      icon: AlertCircle,
      color: "red",
    },
  ];

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
      default:
        return Activity;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case "success":
        return "green";
      case "warning":
        return "yellow";
      case "error":
        return "red";
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
