"use client";

import Link from "next/link";

// Seller Dashboard Components
import SellerStatsCards from "@/components/seller/SellerStatsCards";
import SellerOrders from "@/components/seller/SellerOrders";
import SellerProducts from "@/components/seller/SellerProducts";
import SellerAuctions from "@/components/seller/SellerAuctions";
import SellerSalesChart from "@/components/seller/SellerSalesChart";
import SellerQuickActions from "@/components/seller/SellerQuickActions";
import SellerNotifications from "@/components/seller/SellerNotifications";

export default function SellerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Seller Dashboard
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your products, orders, and grow your business
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-blue-700">
                  Store Active
                </span>
              </div>
              <Link
                href="/seller/products/new"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors mr-2"
              >
                Add Product
              </Link>
              <Link
                href="/seller/auctions/new"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Create Auction
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Stats Cards */}
          <SellerStatsCards />

          {/* Charts and Quick Actions Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <SellerSalesChart />
            </div>
            <div>
              <SellerQuickActions />
            </div>
          </div>

          {/* Orders, Products, and Auctions Row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <SellerOrders />
            <SellerProducts />
            <SellerAuctions />
          </div>

          {/* Notifications */}
          <SellerNotifications />
        </div>
      </div>
    </div>
  );
}
