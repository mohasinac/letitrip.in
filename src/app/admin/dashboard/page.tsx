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
import DashboardNavigation from "@/components/layout/DashboardNavigation";
import RoleGuard from "@/components/auth/RoleGuard";

export default function AdminDashboard() {
  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <DashboardNavigation />

        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Link href="/admin/products/new">Add Product</Link>
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">
                  <Link href="/admin/orders">View Orders</Link>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    </RoleGuard>
  );
}
