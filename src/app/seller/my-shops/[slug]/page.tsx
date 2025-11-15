"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { shopsService } from "@/services/shops.service";
import type { ShopFE } from "@/types/frontend/shop.types";

export default function ShopDashboardPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;

  const [shop, setShop] = useState<ShopFE | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadShopData();
    }
  }, [slug]);

  const loadShopData = async () => {
    try {
      setLoading(true);

      // Load shop details
      const shopData = await shopsService.getBySlug(slug);
      setShop(shopData);

      // Load shop stats
      try {
        const statsData = await shopsService.getStats(slug);
        setStats(statsData);
      } catch (error) {
        console.error("Failed to load stats:", error);
        // Continue even if stats fail
      }
    } catch (error) {
      console.error("Failed to load shop:", error);
      alert("Shop not found");
      router.push("/seller/my-shops");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading shop...</p>
        </div>
      </div>
    );
  }

  if (!shop) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/seller/my-shops"
                className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to My Shops
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Edit Button */}
              <Link
                href={`/seller/my-shops/${shop.slug}/edit`}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Edit className="h-4 w-4" />
                Edit Shop
              </Link>

              {/* View Public Shop Button */}
              <Link
                href={`/shops/${shop.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                <Eye className="h-4 w-4" />
                View Public Shop
              </Link>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center gap-3">
              {shop.logo && (
                <img
                  src={shop.logo}
                  alt={shop.name}
                  className="h-12 w-12 rounded-lg object-cover"
                />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {shop.name}
                  </h1>
                  {shop.isVerified && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✓ Verified
                    </span>
                  )}
                  {shop.isFeatured && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-gray-600">
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
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {shop.productCount || 0}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <Link
              href="/seller/products"
              className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
            >
              Manage Products →
            </Link>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Orders
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {stats?.totalOrders || 0}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <ShoppingBag className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <Link
              href="/seller/orders"
              className="mt-4 text-sm text-green-600 hover:text-green-700 font-medium inline-flex items-center"
            >
              View Orders →
            </Link>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Shop Rating</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {shop.rating ? `${shop.rating.toFixed(1)} ⭐` : "—"}
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              {shop.reviewCount || 0} reviews
            </p>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Revenue
                </p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  ₹{stats?.totalRevenue?.toLocaleString("en-IN") || "0"}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <Link
              href="/seller/analytics"
              className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-medium inline-flex items-center"
            >
              View Analytics →
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Products Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Products
              </h2>
              <Link
                href="/seller/products"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </Link>
            </div>

            {shop.productCount === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600 mb-4">No products yet</p>
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
                <p className="text-sm text-gray-600">
                  You have {shop.productCount} product
                  {shop.productCount !== 1 ? "s" : ""}
                </p>
                <Link
                  href="/seller/products"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
                >
                  Manage Products
                </Link>
              </div>
            )}
          </div>

          {/* Recent Orders Section */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Orders
              </h2>
              <Link
                href="/seller/orders"
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All →
              </Link>
            </div>

            {stats?.totalOrders === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <p className="text-sm text-gray-600">No orders yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  You have {stats?.totalOrders || 0} total order
                  {stats?.totalOrders !== 1 ? "s" : ""}
                </p>
                <Link
                  href="/seller/orders"
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
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
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-blue-900 mb-3">
              🚀 Getting Started
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Upload a professional logo and banner</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Add your first product with clear images</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Complete business verification (GST/PAN)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Set up shipping and return policies</span>
              </li>
            </ul>
          </div>

          {/* Shop Status */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              📊 Shop Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Verification</span>
                <span
                  className={`text-sm font-medium ${
                    shop.isVerified ? "text-green-600" : "text-yellow-600"
                  }`}
                >
                  {shop.isVerified ? "✓ Verified" : "⏳ Pending"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Featured</span>
                <span
                  className={`text-sm font-medium ${
                    shop.isFeatured ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {shop.isFeatured ? "⭐ Yes" : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Homepage Display</span>
                <span
                  className={`text-sm font-medium ${
                    shop.showOnHomepage ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {shop.showOnHomepage ? "✓ Active" : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
