"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import {
  Users,
  FolderTree,
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
  Loader2,
} from "lucide-react";

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
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch("/api/admin/dashboard");

        if (!response.ok) {
          throw new Error("Failed to load dashboard stats");
        }

        const data = await response.json();
        setStats(data.stats);
      } catch (error) {
        console.error("Failed to load stats:", error);

        // Fallback to mock data for development
        setStats({
          totalUsers: 1250,
          totalSellers: 85,
          totalShops: 92,
          totalCategories: 45,
          totalProducts: 3420,
          totalOrders: 8750,
          activeUsers: 420,
          pendingOrders: 23,
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
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.name || "Admin"}!
        </h1>
        <p className="mt-2 text-gray-600">
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
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
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
                <h3 className="text-sm font-medium text-gray-600">
                  {stat.title}
                </h3>
                <p className="mt-1 text-2xl font-bold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.href}
                href={action.href}
                className="group bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg hover:border-purple-200 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className={`p-3 bg-${action.color}-100 rounded-lg`}>
                    <Icon className={`h-6 w-6 text-${action.color}-600`} />
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                    {action.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {action.description}
                  </p>
                  <p className="mt-3 text-sm font-medium text-gray-500">
                    {action.stats}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Recent Activity
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  New user registered
                </p>
                <p className="text-xs text-gray-500">2 minutes ago</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">Just now</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Store className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  New shop pending approval
                </p>
                <p className="text-xs text-gray-500">15 minutes ago</p>
              </div>
            </div>
            <Link
              href="/admin/shops/pending"
              className="text-xs text-purple-600 hover:underline"
            >
              Review
            </Link>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  5 new products listed
                </p>
                <p className="text-xs text-gray-500">1 hour ago</p>
              </div>
            </div>
            <span className="text-xs text-gray-400">1h ago</span>
          </div>
        </div>
      </div>
    </div>
  );
}
