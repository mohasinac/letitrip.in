"use client";

import Link from "next/link";

// Dashboard Components
import StatsCards from "@/components/admin/StatsCards";
import RecentOrders from "@/components/admin/RecentOrders";
import TopProducts from "@/components/admin/TopProducts";
import SalesChart from "@/components/admin/SalesChart";
import UserActivityChart from "@/components/admin/UserActivityChart";
import QuickActions from "@/components/admin/QuickActions";
import RecentReviews from "@/components/admin/RecentReviews";
import UnifiedLayout from "@/components/layout/UnifiedLayout";

export default function AdminDashboard() {
  return (
    <UnifiedLayout>
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Admin Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Welcome back! Here's what's happening with your store today.
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/seller/dashboard"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Seller Dashboard
              </Link>
              <Link
                href="/admin/orders"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                View All Orders
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <StatsCards />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <SalesChart />
            <UserActivityChart />
          </div>

          {/* Quick Actions */}
          <QuickActions />

          {/* Tables Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <RecentOrders />
            <TopProducts />
          </div>

          {/* Recent Reviews */}
          <RecentReviews />
        </div>
      </div>
    </UnifiedLayout>
  );
}
