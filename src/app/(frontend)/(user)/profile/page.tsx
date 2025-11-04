"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/SessionAuthContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Package,
  Heart,
  Settings,
  LogOut,
  Edit,
  Loader2,
  Calendar,
  Shield,
  Store,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { api } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    orders: 0,
    wishlist: 0,
    addresses: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile");
      return;
    }

    if (user) {
      fetchUserData();
      fetchUserStats();
    }
  }, [user, authLoading]);

  const fetchUserData = async () => {
    try {
      if (!user) return;

      const profile = await api.user.getProfile();
      setUserData(profile || user);
    } catch (error: any) {
      console.error("Error fetching user data:", error);
      // Fallback to auth context user
      setUserData(user);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      if (!user) return;

      // Try to fetch user stats using the API service
      try {
        const userStats = await api.user.getUserStats();
        const addresses = await api.user.getAddresses();
        setStats({
          orders: userStats.totalOrders || 0,
          wishlist: userStats.wishlistCount || 0,
          addresses: addresses.length || 0,
        });
      } catch (error) {
        // Fallback: Try individual calls
        const [orders, wishlist, addresses] = await Promise.allSettled([
          api.orders.getOrders({ limit: 1 }),
          api.wishlist.getWishlist(),
          api.user.getAddresses(),
        ]);

        setStats({
          orders: orders.status === "fulfilled" ? orders.value.total || 0 : 0,
          wishlist:
            wishlist.status === "fulfilled" ? wishlist.value.itemCount || 0 : 0,
          addresses:
            addresses.status === "fulfilled" ? addresses.value.length || 0 : 0,
        });
      }
    } catch (error: any) {
      console.error("Error fetching user stats:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const displayUser = userData || user;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Profile
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Profile Picture */}
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                {displayUser?.photoURL ? (
                  <Image
                    src={displayUser.photoURL}
                    alt={displayUser.name || "User"}
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                  />
                ) : (
                  displayUser?.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>
              <Link
                href="/profile/edit"
                className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors shadow-lg no-underline"
              >
                <Edit className="w-4 h-4" />
              </Link>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {displayUser?.name || "User"}
                </h2>
                {displayUser?.role && displayUser.role !== "customer" && (
                  <span className="px-3 py-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-semibold rounded-full shadow-md">
                    {displayUser.role.toUpperCase()}
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm">{displayUser?.email}</span>
                </div>
                {displayUser?.phone && (
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Phone className="w-4 h-4" />
                    <span className="text-sm">{displayUser.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    Member since{" "}
                    {displayUser?.createdAt
                      ? new Date(displayUser.createdAt).toLocaleDateString(
                          "en-IN",
                          {
                            month: "short",
                            year: "numeric",
                          }
                        )
                      : "Recently"}
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <Link
              href="/profile/edit"
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg no-underline flex items-center gap-2"
            >
              <Edit className="w-4 h-4" />
              Edit Profile
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Link
            href="/profile/orders"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 no-underline group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.orders}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total Orders
            </p>
          </Link>

          <Link
            href="/wishlist"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 no-underline group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-red-600 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.wishlist}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Wishlist Items
            </p>
          </Link>

          <Link
            href="/profile/addresses"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 no-underline group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
              {stats.addresses}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Saved Addresses
            </p>
          </Link>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/profile/orders"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200 no-underline group"
            >
              <Package className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  My Orders
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Track and manage orders
                </p>
              </div>
            </Link>

            <Link
              href="/profile/addresses"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200 no-underline group"
            >
              <MapPin className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Addresses
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage delivery addresses
                </p>
              </div>
            </Link>

            <Link
              href="/profile/track-order"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200 no-underline group"
            >
              <MapPin className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Track Order
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Check order status
                </p>
              </div>
            </Link>

            <Link
              href="/profile/settings"
              className="flex items-center gap-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 no-underline group"
            >
              <Settings className="w-6 h-6 text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  Settings
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Account preferences
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* Role-based Quick Links */}
        {(displayUser?.role === "admin" || displayUser?.role === "seller") && (
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl shadow-lg border border-purple-200 dark:border-purple-800 p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Dashboard Access
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {displayUser?.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-purple-300 dark:border-purple-700 hover:shadow-lg transition-all duration-200 no-underline group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Admin Panel
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage platform
                    </p>
                  </div>
                </Link>
              )}

              {(displayUser?.role === "seller" ||
                displayUser?.role === "admin") && (
                <Link
                  href="/seller/dashboard"
                  className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-gray-800 border border-green-300 dark:border-green-700 hover:shadow-lg transition-all duration-200 no-underline group"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                    <Store className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      Seller Panel
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Manage store
                    </p>
                  </div>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="flex justify-center">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-md hover:shadow-lg font-medium"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
