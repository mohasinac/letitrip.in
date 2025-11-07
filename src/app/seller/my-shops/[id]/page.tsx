"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Star,
  Users,
  Edit,
  Eye,
  BarChart3,
  Plus,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface Shop {
  id: string;
  name: string;
  slug: string;
  description: string;
  logo: string | null;
  banner: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  website: string | null;
  isVerified: boolean;
  isFeatured: boolean;
  isBanned: boolean;
  ownerId: string;
  ownerName: string;
  productCount?: number;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt: string;
}

interface ShopStats {
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalCustomers: number;
  averageRating: number;
}

interface RecentActivity {
  id: string;
  type: "order" | "product" | "review";
  message: string;
  timestamp: string;
}

export default function ShopDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params?.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [stats, setStats] = useState<ShopStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch shop data and stats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch shop details
        const shopResponse = await fetch(`/api/shops/${shopId}`);
        const shopData = await shopResponse.json();

        if (!shopData.success) {
          throw new Error(shopData.error || "Failed to fetch shop");
        }

        setShop(shopData.shop);

        // TODO: Fetch shop stats from API
        // For now, using mock data
        setStats({
          totalProducts: shopData.shop.productCount || 0,
          activeProducts: shopData.shop.productCount || 0,
          totalOrders: 156,
          pendingOrders: 12,
          totalRevenue: 245680,
          monthlyRevenue: 45230,
          totalCustomers: 89,
          averageRating: shopData.shop.rating || 0,
        });

        // TODO: Fetch recent activity from API
        setRecentActivity([
          {
            id: "1",
            type: "order",
            message: "New order #1234 received",
            timestamp: new Date().toISOString(),
          },
          {
            id: "2",
            type: "product",
            message: 'Product "Gaming Mouse" added',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "3",
            type: "review",
            message: "New 5-star review received",
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
        ]);
      } catch (err) {
        console.error("Error fetching shop data:", err);
        setError(err instanceof Error ? err.message : "Failed to load shop");
      } finally {
        setLoading(false);
      }
    };

    if (shopId) {
      fetchData();
    }
  }, [shopId]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format time ago
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date().getTime();
    const time = new Date(timestamp).getTime();
    const diff = now - time;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2" />
          <div className="h-4 w-96 bg-gray-200 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-32 bg-gray-200 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error && !shop) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => router.push("/seller/my-shops")}
            className="mt-4 text-sm text-red-600 hover:text-red-700 underline"
          >
            ← Back to My Shops
          </button>
        </div>
      </div>
    );
  }

  if (!shop) return null;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/seller/my-shops")}
          className="text-sm text-gray-600 hover:text-gray-900 mb-2 inline-flex items-center"
        >
          ← Back to My Shops
        </button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {shop.logo ? (
              <img
                src={shop.logo}
                alt={shop.name}
                className="w-16 h-16 rounded-lg object-cover border-2 border-gray-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Store className="w-8 h-8 text-white" />
              </div>
            )}

            <div>
              <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-600">@{shop.slug}</span>
                {shop.isVerified && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    <CheckCircle className="w-3 h-3" />
                    Verified
                  </span>
                )}
                {shop.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                    <Star className="w-3 h-3" />
                    Featured
                  </span>
                )}
                {shop.isBanned && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                    <XCircle className="w-3 h-3" />
                    Banned
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/seller/my-shops/${shopId}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Edit className="w-4 h-4" />
              Edit Shop
            </Link>
            <Link
              href={`/shops/${shop.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Eye className="w-4 h-4" />
              View Public Page
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Products */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">
                Products
              </span>
              <Package className="w-5 h-5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalProducts}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.activeProducts} active
            </p>
          </div>

          {/* Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Orders</span>
              <ShoppingCart className="w-5 h-5 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalOrders}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.pendingOrders} pending
            </p>
          </div>

          {/* Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Revenue</span>
              <DollarSign className="w-5 h-5 text-purple-500" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(stats.totalRevenue)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(stats.monthlyRevenue)} this month
            </p>
          </div>

          {/* Rating */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Rating</span>
              <Star className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-2xl font-bold text-gray-900">
                {stats.averageRating.toFixed(1)}
              </span>
              <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {stats.totalCustomers} customers
            </p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link
          href={`/seller/my-shops/${shopId}/products/create`}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
              <Plus className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Add Product</h3>
              <p className="text-sm text-gray-600">List a new product</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/seller/my-shops/${shopId}/analytics`}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">View Analytics</h3>
              <p className="text-sm text-gray-600">Sales & performance</p>
            </div>
          </div>
        </Link>

        <Link
          href={`/seller/orders?shop=${shopId}`}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Manage Orders</h3>
              <p className="text-sm text-gray-600">Process orders</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h2>

        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  {activity.type === "order" && (
                    <ShoppingCart className="w-4 h-4 text-green-600" />
                  )}
                  {activity.type === "product" && (
                    <Package className="w-4 h-4 text-blue-600" />
                  )}
                  {activity.type === "review" && (
                    <Star className="w-4 h-4 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTimeAgo(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No recent activity</p>
          </div>
        )}
      </div>
    </div>
  );
}
