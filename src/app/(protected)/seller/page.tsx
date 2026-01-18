"use client";

import { useAuth } from "@/contexts/AuthContext";
import { analyticsService } from "@/services/analytics.service";
import {
  CompactPrice,
  PageState,
  Price,
  StatsCard,
  StatsCardGrid,
  useLoadingState,
} from "@letitrip/react-library";
import {
  AlertCircle,
  ArrowRight,
  Clock,
  DollarSign,
  Eye,
  Package,
  ShoppingCart,
  Star,
  Store,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect } from "react";

interface DashboardData {
  stats: {
    shops: { total: number; active: number };
    products: { total: number; active: number };
    orders: { pending: number; total: number };
    revenue: { thisMonth: number; lastMonth: number };
  };
  recentOrders: Array<{
    id: string;
    orderNumber: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
  }>;
  topProducts: Array<{
    id: string;
    name: string;
    sales: number;
    revenue: number;
    views: number;
  }>;
  shopPerformance: {
    averageRating: number;
    totalRatings: number;
    orderFulfillment: number;
    responseTime: string;
  };
  alerts: {
    lowStock: number;
    pendingShipment: number;
    newReviews: number;
  };
}

export default function SellerDashboardPage() {
  const { user } = useAuth();

  const {
    data,
    isLoading: loading,
    error,
    execute,
  } = useLoadingState<DashboardData | null>({ initialData: null });

  const loadDashboardData = useCallback(async () => {
    // API will automatically use the user's primary shop from session
    const analyticsData = await analyticsService.getOverview();

    // Map analytics data to seller dashboard format
    return {
      stats: {
        shops: {
          total: (analyticsData as any).totalShops || 1,
          active: (analyticsData as any).activeShops || 1,
        },
        products: {
          total: analyticsData.totalProducts || 0,
          active: (analyticsData as any).activeProducts || 0,
        },
        orders: {
          pending: (analyticsData as any).pendingOrders || 0,
          total: analyticsData.totalOrders || 0,
        },
        revenue: {
          thisMonth: analyticsData.totalRevenue || 0,
          lastMonth: (analyticsData as any).lastMonthRevenue || 0,
        },
      },
      recentOrders: (analyticsData as any).recentOrders || [],
      topProducts: (analyticsData as any).topProducts || [],
      shopPerformance: (analyticsData as any).shopPerformance || {
        averageRating: 0,
        totalRatings: 0,
        orderFulfillment: 0,
        responseTime: "N/A",
      },
      alerts: (analyticsData as any).alerts || {
        lowStock: 0,
        pendingShipment: 0,
        newReviews: 0,
      },
    };
  }, []);

  useEffect(() => {
    if (user) {
      execute(loadDashboardData);
    }
  }, [user, execute, loadDashboardData]);

  if (loading) {
    return (
      <PageState.Loading message="Loading dashboard..." fullPage={false} />
    );
  }

  if (error || !data) {
    return (
      <PageState.Error
        message={error?.message || "Failed to load dashboard"}
        onRetry={() => execute(loadDashboardData)}
        fullPage={false}
      />
    );
  }

  const { stats, recentOrders, topProducts, shopPerformance, alerts } = data;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <StatsCardGrid columns={4}>
        <StatsCard
          title="Active Shops"
          value={stats.shops.active.toString()}
          description={`${stats.shops.total} total`}
          icon={<Store className="h-6 w-6 text-blue-600" />}
          trend={{ value: 0, isPositive: true }}
        />
        <StatsCard
          title="Products"
          value={stats.products.active.toString()}
          description={`${stats.products.total} total`}
          icon={<Package className="h-6 w-6 text-blue-600" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Pending Orders"
          value={stats.orders.pending.toString()}
          description={`${stats.orders.total} total orders`}
          icon={<ShoppingCart className="h-6 w-6 text-blue-600" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatsCard
          title="Revenue (This Month)"
          value={<Price amount={stats.revenue.thisMonth} />}
          description={`\u20b9${stats.revenue.lastMonth.toFixed(2)} last month`}
          icon={<DollarSign className="h-6 w-6 text-blue-600" />}
          trend={{
            value:
              stats.revenue.lastMonth > 0
                ? ((stats.revenue.thisMonth - stats.revenue.lastMonth) /
                    stats.revenue.lastMonth) *
                  100
                : stats.revenue.thisMonth > 0
                ? 100
                : 0,
            isPositive: stats.revenue.thisMonth > stats.revenue.lastMonth,
          }}
        />
      </StatsCardGrid>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Quick Actions
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/seller/my-shops/create"
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Store className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Create Shop
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Set up a new shop
              </p>
            </div>
          </Link>
          <Link
            href="/seller/my-shops"
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Add Product
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                List a new product
              </p>
            </div>
          </Link>
          <Link
            href="/seller/orders"
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                View Orders
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your orders
              </p>
            </div>
          </Link>
          <Link
            href="/seller/revenue"
            className="flex items-center gap-3 rounded-lg border border-gray-200 dark:border-gray-700 p-4 transition-colors hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <TrendingUp className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                View Analytics
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Check your performance
              </p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h2>
              <Link
                href="/seller/orders"
                className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/seller/orders/${order.id}`}
                className="block px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {order.customer}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {order.date}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      <Price amount={order.amount} />
                    </p>
                    <span
                      className={`inline-block mt-1 rounded-full px-2 py-1 text-xs font-medium ${
                        order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : order.status === "confirmed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Top Products
              </h2>
              <Link
                href="/seller/products"
                className="flex items-center gap-1 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {topProducts.map((product) => (
              <div key={product.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {product.name}
                    </p>
                    <div className="mt-1 flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <ShoppingCart className="h-3 w-3" />
                        {product.sales} sales
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {product.views} views
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      <CompactPrice amount={product.revenue} />
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      revenue
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts & Performance */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Alerts & Notifications */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Alerts & Notifications
            </h2>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {alerts.lowStock > 0 && (
              <Link
                href="/seller/products?filter=lowStock"
                className="flex gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Low Stock Alert
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {alerts.lowStock} products are running low on stock
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </Link>
            )}
            {alerts.pendingShipment > 0 && (
              <Link
                href="/seller/orders?status=confirmed"
                className="flex gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    Pending Actions
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {alerts.pendingShipment} orders waiting for shipment
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </Link>
            )}
            {alerts.newReviews > 0 && (
              // NOTE: /seller/reviews does not exist - link to admin reviews page for now
              <Link
                href="/reviews"
                className="flex gap-3 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <Star className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    New Reviews
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    You have {alerts.newReviews} new product reviews
                  </p>
                </div>
                <ArrowRight className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </Link>
            )}
            {alerts.lowStock === 0 &&
              alerts.pendingShipment === 0 &&
              alerts.newReviews === 0 && (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 dark:text-gray-400">
                    No alerts at this time
                  </p>
                </div>
              )}
          </div>
        </div>

        {/* Shop Performance */}
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Shop Performance
            </h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Average Rating
                </span>
                <span className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  {shopPerformance.averageRating.toFixed(1)} / 5.0
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-yellow-500 h-2 rounded-full"
                  style={{
                    width: `${(shopPerformance.averageRating / 5) * 100}%`,
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Based on {shopPerformance.totalRatings} ratings
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Order Fulfillment
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {shopPerformance.orderFulfillment}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${shopPerformance.orderFulfillment}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Response Time
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {shopPerformance.responseTime}
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "85%" }}
                ></div>
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Link
                href="/seller/analytics"
                className="flex items-center justify-center gap-2 w-full py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
              >
                View Detailed Analytics
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// TODO: Replace hardcoded strings with constants from site constants
// Texts to consider: "Dashboard", "Welcome back! Here's what's happening with your business today.", "Active Shops", "Products", "Pending Orders", "Revenue (This Month)", "Quick Actions", "Create Shop", "Set up a new shop", "Add Product", "List a new product", "View Orders", "Manage your orders", "View Analytics", "Check your performance", "Recent Orders", "View All", "Top Products", "Alerts & Notifications", "Low Stock Alert", "products are running low on stock", "Pending Actions", "orders waiting for shipment", "New Reviews", "You have new product reviews", "No alerts at this time", "Shop Performance", "Average Rating", "Based on ratings", "Order Fulfillment", "Response Time", "View Detailed Analytics", "Failed to load dashboard", "Retry"
