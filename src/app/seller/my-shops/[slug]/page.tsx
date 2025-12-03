"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import {
  ArrowLeft,
  Eye,
  Edit,
  Package,
  ShoppingBag,
  TrendingUp,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";
import { Price } from "@/components/common/values";
import { shopsService } from "@/services/shops.service";
import { useLoadingState } from "@/hooks/useLoadingState";
import type { ShopFE } from "@/types/frontend/shop.types";

interface ShopWithStats {
  shop: ShopFE;
  stats: any;
}

export default function ShopDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const { data, isLoading, execute } = useLoadingState<ShopWithStats | null>({
    initialData: null,
  });

  const loadShopData = useCallback(async () => {
    try {
      // Load shop details
      const shopData = await shopsService.getBySlug(slug);

      // Load shop stats
      let statsData = null;
      try {
        statsData = await shopsService.getStats(slug);
      } catch (error) {
        console.error("Failed to load stats:", error);
        // Continue even if stats fail
      }

      return { shop: shopData, stats: statsData };
    } catch (error) {
      console.error("Failed to load shop:", error);
      toast.error("Shop not found");
      router.push("/seller/my-shops");
      return null;
    }
  }, [slug, router]);

  useEffect(() => {
    if (slug) {
      execute(loadShopData);
    }
  }, [slug, execute, loadShopData]);

  const shop = data?.shop || null;
  const stats = data?.stats || null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Loading shop...
          </p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/seller/my-shops"
                className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to My Shops
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Edit Button */}
              <Link
                href={`/seller/my-shops/${shop.slug}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <Edit className="h-4 w-4" />
                Edit Shop
              </Link>

              {/* View Public Shop Button */}
              <Link
                href={`/shops/${shop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50"
              >
                <Eye className="h-4 w-4" />
                View Public Shop
              </Link>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-3">
              {shop.logo && (
                <div className="relative h-12 w-12">
                  <OptimizedImage
                    src={shop.logo}
                    alt={shop.name}
                    fill
                    className="rounded-lg object-cover"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {shop.name}
                  </h1>
                  {shop.isVerified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                      ✓ Verified
                    </span>
                  )}
                  {shop.featured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  {shop.address || "Location not set"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Products
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {shop.productCount || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <Link
              href="/seller/products"
              className="mt-4 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium inline-flex items-center"
            >
              Manage Products →
            </Link>
          </div>

          {/* Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Orders
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {stats?.totalOrders || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <Link
              href="/seller/orders"
              className="mt-4 text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium inline-flex items-center"
            >
              View Orders →
            </Link>
          </div>

          {/* Rating */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Shop Rating
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  {shop.rating ? `${shop.rating.toFixed(1)} ⭐` : "—"}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
              {shop.reviewCount || 0} reviews
            </p>
          </div>

          {/* Revenue */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Revenue
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
                  <Price amount={stats?.totalRevenue || 0} />
                </p>
              </div>
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <Link
              href="/seller/analytics"
              className="mt-4 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium inline-flex items-center"
            >
              View Analytics →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Products Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Products
              </h2>
              <Link
                href="/seller/products"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                View All →
              </Link>
            </div>

            {shop.productCount === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  No products yet
                </p>
                <Link
                  href="/seller/products/create"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                >
                  <Package className="h-4 w-4" />
                  Add Your First Product
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You have {shop.productCount} product
                  {shop.productCount !== 1 ? "s" : ""}
                </p>
                <Link
                  href="/seller/products"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                >
                  Manage Products
                </Link>
              </div>
            )}
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
          {/* Recent Orders Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Orders
              </h2>
              <Link
                href="/seller/orders"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                View All →
              </Link>
            </div>

            {stats?.totalOrders === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-sm text-gray-600 dark:text-gray-400">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  You have {stats?.totalOrders || 0} total order
                  {stats?.totalOrders !== 1 ? "s" : ""}
                </p>
                <Link
                  href="/seller/orders"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium"
                >
                  View Orders
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Help Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Getting Started */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-3">
              🚀 Getting Started
            </h3>
            <ul className="space-y-2 text-sm text-blue-800 dark:text-blue-300">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Upload a professional logo and banner</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Add your first product with clear images</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Complete business verification (GST/PAN)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400">•</span>
                <span>Set up shipping and return policies</span>
              </li>
            </ul>
          </div>

          {/* Shop Status */}
          <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
              📊 Shop Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Verification</span>
                <span
                  className={`text-sm font-medium ${
                    shop.isVerified ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                  }`}
                >
                  {shop.isVerified ? "✓ Verified" : "⏳ Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Featured</span>
                <span
                  className={`text-sm font-medium ${
                    shop.featured ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"
                  }`}
                >
                  {shop.featured ? "⭐ Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Featured Status</span>
                <span
                  className={`text-sm font-medium ${
                    shop.featured ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"
                  }`}
                >
                  {shop.featured ? "⭐ Featured" : "Not Featured"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
