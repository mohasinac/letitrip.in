"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Package,
  Heart,
  MapPin,
  User,
  ShoppingBag,
  Clock,
  ChevronRight,
} from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import { EmptyState } from "@/components/common/EmptyState";
import { ordersService } from "@/services/orders.service";
import { useAuth } from "@/contexts/AuthContext";
import type { OrderCardFE } from "@/types/frontend/order.types";

export default function UserDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [recentOrders, setRecentOrders] = useState<OrderCardFE[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push("/login?redirect=/user");
      return;
    }
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load recent orders
      const ordersData = await ordersService.list({} as any);
      const orders = ordersData.data || [];
      setRecentOrders(orders);

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

      setStats({
        totalOrders,
        pendingOrders,
        completedOrders,
        cancelledOrders,
      });
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Account</h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.fullName || "Guest"}!
          </p>
        </div>

        {/* Stats Cards - Single row on mobile, 2 columns on tablet, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-8">
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
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link
            href="/user/orders"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  My Orders
                </h3>
                <p className="text-sm text-gray-600">
                  Track and manage your orders
                </p>
              </div>
              <ShoppingBag className="w-8 h-8 text-primary" />
            </div>
          </Link>

          <Link
            href="/user/addresses"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  My Addresses
                </h3>
                <p className="text-sm text-gray-600">
                  Manage shipping addresses
                </p>
              </div>
              <MapPin className="w-8 h-8 text-primary" />
            </div>
          </Link>

          <Link
            href="/user/settings"
            className="bg-white p-6 rounded-lg border border-gray-200 hover:border-primary hover:shadow-md transition-all"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  Account Settings
                </h3>
                <p className="text-sm text-gray-600">
                  Update your profile and preferences
                </p>
              </div>
              <User className="w-8 h-8 text-primary" />
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">
                Recent Orders
              </h2>
              <Link
                href="/user/orders"
                className="text-primary hover:text-primary/80 text-sm font-medium flex items-center gap-1"
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
                    className="block p-4 border border-gray-200 rounded-lg hover:border-primary hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p
                          className="font-semibold text-gray-900"
                          data-order-number={order.orderNumber}
                        >
                          Order #
                          {order.orderNumber ||
                            order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(order.createdAt || 0).toLocaleDateString(
                            "en-IN",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">
                          ₹{order.total.toLocaleString("en-IN")}
                        </p>
                        <span
                          data-testid={`order-status-${order.id}`}
                          className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : order.status === "cancelled"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
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
