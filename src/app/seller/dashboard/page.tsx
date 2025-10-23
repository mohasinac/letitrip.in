"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Seller Dashboard Components
import SellerStatsCards from "@/components/seller/SellerStatsCards";
import SellerOrders from "@/components/seller/SellerOrders";
import SellerProducts from "@/components/seller/SellerProducts";
import SellerSalesChart from "@/components/seller/SellerSalesChart";
import SellerQuickActions from "@/components/seller/SellerQuickActions";
import SellerNotifications from "@/components/seller/SellerNotifications";

export default function SellerDashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is authenticated and has seller role
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const userData = await response.json();
          if (userData.role !== "seller" && userData.role !== "admin") {
            router.push("/login");
            return;
          }
          setUser(userData);
        } else {
          router.push("/login");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/login");
        return;
      }
      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading seller dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                <Link href="/seller/products/new">Add Product</Link>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

          {/* Orders and Products Row */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <SellerOrders />
            <SellerProducts />
          </div>

          {/* Notifications */}
          <SellerNotifications />
        </div>
      </div>
    </div>
  );
}
