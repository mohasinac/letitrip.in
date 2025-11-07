import { Metadata } from "next";
import {
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { StatsCard } from "@/components/common/StatsCard";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Seller dashboard overview",
};

export default function SellerDashboardPage() {
  // TODO: Fetch real data from API
  const stats = {
    shops: { total: 1, active: 1 },
    products: { total: 24, active: 20 },
    orders: { pending: 5, total: 150 },
    revenue: { thisMonth: 45000, lastMonth: 38000 },
  };

  const recentOrders = [
    {
      id: "1",
      orderNumber: "ORD-2024-001",
      customer: "John Doe",
      amount: 2500,
      status: "pending",
      date: "2024-11-07",
    },
    {
      id: "2",
      orderNumber: "ORD-2024-002",
      customer: "Jane Smith",
      amount: 1800,
      status: "confirmed",
      date: "2024-11-07",
    },
    {
      id: "3",
      orderNumber: "ORD-2024-003",
      customer: "Bob Johnson",
      amount: 3200,
      status: "shipped",
      date: "2024-11-06",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome back! Here's what's happening with your business today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
          value={`₹${(stats.revenue.thisMonth / 1000).toFixed(1)}K`}
          description={`₹${(stats.revenue.lastMonth / 1000).toFixed(
            1
          )}K last month`}
          icon={<DollarSign className="h-6 w-6 text-blue-600" />}
          trend={{
            value:
              ((stats.revenue.thisMonth - stats.revenue.lastMonth) /
                stats.revenue.lastMonth) *
              100,
            isPositive: stats.revenue.thisMonth > stats.revenue.lastMonth,
          }}
        />
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/seller/my-shops/create"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <Store className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Create Shop</p>
              <p className="text-sm text-gray-600">Set up a new shop</p>
            </div>
          </Link>
          <Link
            href="/seller/my-shops"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">Add Product</p>
              <p className="text-sm text-gray-600">List a new product</p>
            </div>
          </Link>
          <Link
            href="/seller/orders"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <ShoppingCart className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">View Orders</p>
              <p className="text-sm text-gray-600">Manage your orders</p>
            </div>
          </Link>
          <Link
            href="/seller/revenue"
            className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 transition-colors hover:border-blue-500 hover:bg-blue-50"
          >
            <TrendingUp className="h-6 w-6 text-blue-600" />
            <div>
              <p className="font-medium text-gray-900">View Analytics</p>
              <p className="text-sm text-gray-600">Check your performance</p>
            </div>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
              <Link
                href="/seller/orders"
                className="text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                View All
              </Link>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {recentOrders.map((order) => (
              <div key={order.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">
                      {order.orderNumber}
                    </p>
                    <p className="text-sm text-gray-600">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900">
                      ₹{order.amount.toLocaleString()}
                    </p>
                    <span
                      className={`inline-block rounded-full px-2 py-1 text-xs font-medium ${
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
              </div>
            ))}
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Alerts & Notifications
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="px-6 py-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-orange-500" />
                <div>
                  <p className="font-medium text-gray-900">Low Stock Alert</p>
                  <p className="text-sm text-gray-600">
                    3 products are running low on stock
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">Pending Actions</p>
                  <p className="text-sm text-gray-600">
                    5 orders waiting for shipment
                  </p>
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-green-500" />
                <div>
                  <p className="font-medium text-gray-900">New Reviews</p>
                  <p className="text-sm text-gray-600">
                    You have 2 new product reviews
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
