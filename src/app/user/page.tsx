"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  MapPin,
  User,
  ShoppingBag,
  Clock,
  ChevronRight,
} from "lucide-react";
import { StatsCard, StatsCardGrid } from "@/components/common/StatsCard";
import { EmptyState } from "@/components/common/EmptyState";
import { Price, DateDisplay } from "@/components/common/values";
import { ordersService } from "@/services/orders.service";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@/hooks/useLoadingState";
import type { OrderCardFE } from "@/types/frontend/order.types";

interface DashboardData {
  recentOrders: OrderCardFE[];
  stats: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
  };
}

export default function UserDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  const {
    data,
    isLoading: loading,
    execute,
  } = useLoadingState<DashboardData>({
    initialData: {
      recentOrders: [],
      stats: {
        totalOrders: 0,
        pendingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
      },
    },
  });

  const loadDashboardData = useCallback(async () => {
    // Load recent orders
    const ordersData = await ordersService.list({} as any);
    const orders = ordersData.data || [];

    // Calculate stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(
      (o) => o.status === "pending" || o.status === "confirmed"
    ).length;
    const completedOrders = orders.filter(
      (o) => o.status === "delivered"
    ).length;
    const cancelledOrders = orders.filter(
      (o) => o.status === "cancelled"
    ).length;

    return {
      recentOrders: orders,
      stats: {
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
      },
    };
  }, []);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/user");
      return;
    }
    execute(loadDashboardData);
  }, [user, execute, loadDashboardData, router]);

  // Safe access to data
  const recentOrders = data?.recentOrders || [];
  const stats = data?.stats || {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  };

  if (loading) {
    return (
      <div
        role="status"
        className="flex justify-center items-center min-h-screen"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            My Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.fullName || "Guest"}!
          </p>
        </div>

        {/* Stats Cards */}
        <StatsCardGrid columns={4} className="mb-8">
          <StatsCard
            title="Total Orders"
            value={stats.totalOrders}
            icon={<Package className="w-5 h-5 md:w-6 md:h-6 text-primary" />}
          />
          <StatsCard
            title="Pending"
            value={stats.pendingOrders}
            icon={<Clock className="w-5 h-5 md:w-6 md:h-6 text-yellow-600" />}
          />
          <StatsCard
            title="Completed"
            value={stats.completedOrders}
            icon={<Package className="w-5 h-5 md:w-6 md:h-6 text-green-600" />}
          />
          <StatsCard
            title="Cancelled"
            value={stats.cancelledOrders}
            icon={<Package className="w-5 h-5 md:w-6 md:h-6 text-red-600" />}
          />
        </StatsCardGrid>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/user/orders"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-yellow-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  My Orders
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track and manage your orders
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
          </Link>

          <Link
            href="/user/addresses"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-yellow-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  My Addresses
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage shipping addresses
                </p>
              </div>
              <MapPin className="w-8 h-8 text-primary" />
            </div>
          </Link>

          <Link
            href="/user/settings"
            className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-yellow-500 hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  Account Settings
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Update your profile and preferences
                </p>
              </div>
              <User className="w-8 h-8 text-primary" />
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h2>
              <Link
                href="/user/orders"
                className="text-primary hover:text-primary/80 dark:text-yellow-500 dark:hover:text-yellow-400 text-sm font-medium flex items-center gap-1"
              >
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="p-6">
            {recentOrders.length === 0 ? (
              <EmptyState
                title="No orders yet"
                description="Start shopping to see your orders here!"
                action={{
                  label: "Start Shopping",
                  onClick: () => router.push("/"),
                }}
              />
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/user/orders/${order.id}`}
                    data-testid={`recent-order-${order.id}`}
                    className="block p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary dark:hover:border-yellow-500 hover:shadow-sm transition-all bg-white dark:bg-gray-800/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p
                          className="font-semibold text-gray-900 dark:text-white"
                          data-order-number={order.orderNumber}
                        >
                          Order #
                          {order.orderNumber ||
                            order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <DateDisplay date={order.createdAt} format="medium" />
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          <Price amount={order.total} />
                        </p>
                        <span
                          data-testid={`order-status-${order.id}`}
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                              : order.status === "cancelled"
                              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                              : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.items?.length || 0} item
                      {(order.items?.length || 0) !== 1 ? "s" : ""}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
