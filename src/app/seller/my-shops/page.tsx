"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Store, Plus, Settings, BarChart3, Package, Eye } from "lucide-react";
import { ShopFilters } from "@/components/filters/ShopFilters";
import { useFilters } from "@/hooks/useFilters";
import { buildQueryFromFilters } from "@/lib/filter-helpers";
import { useAuth } from "@/contexts/AuthContext";
import type { Shop } from "@/types";

interface ShopFiltersType {
  search?: string;
  verified?: boolean;
  rating?: number;
  featured?: boolean;
  onHomepage?: boolean;
  banned?: boolean;
}

export default function MyShopsPage() {
  const { user } = useAuth();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canCreateMore, setCanCreateMore] = useState(false);

  const {
    filters,
    appliedFilters,
    updateFilters,
    applyFilters,
    resetFilters,
    hasActiveFilters,
    activeFilterCount,
  } = useFilters<ShopFiltersType>(
    {},
    {
      syncWithUrl: true,
      storageKey: "seller-shops-filters",
    }
  );

  // Fetch shops
  useEffect(() => {
    const fetchShops = async () => {
      try {
        setLoading(true);
        setError(null);

        const query = buildQueryFromFilters(appliedFilters);
        const queryString = new URLSearchParams(
          query as Record<string, string>
        ).toString();
        const url = `/api/shops${queryString ? `?${queryString}` : ""}`;

        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Failed to fetch shops");
        }

        const data = await response.json();
        setShops(data.shops || []);
        setCanCreateMore(data.canCreateMore || false);
      } catch (err) {
        console.error("Error fetching shops:", err);
        setError(err instanceof Error ? err.message : "Failed to load shops");
      } finally {
        setLoading(false);
      }
    };

    fetchShops();
  }, [appliedFilters]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Store className="w-7 h-7" />
              My Shops
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {user?.role === "admin"
                ? "Manage all shops across the platform"
                : "Manage your shop (limit: 1 shop per user)"}
            </p>
          </div>

          {canCreateMore && (
            <Link
              href="/seller/my-shops/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Shop
            </Link>
          )}
        </div>

        {/* Info Banner - Show if user has no shops */}
        {!loading && shops.length === 0 && !hasActiveFilters && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Store className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-blue-900">
                  Create Your First Shop
                </h3>
                <p className="text-sm text-blue-700 mt-1">
                  Set up your shop to start selling products. You can create one
                  shop to showcase your products to thousands of customers.
                </p>
                <Link
                  href="/seller/my-shops/create"
                  className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Create Your Shop
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-6">
          {/* Filters Sidebar */}
          <aside className="w-64 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-4">
              <ShopFilters
                filters={filters}
                onChange={updateFilters}
                onApply={applyFilters}
                onReset={resetFilters}
              />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Active Filters & Results Count */}
            {hasActiveFilters && (
              <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">
                      {activeFilterCount}{" "}
                      {activeFilterCount === 1 ? "filter" : "filters"} active
                    </span>
                    {!loading && <span className="text-gray-400">•</span>}
                    {!loading && (
                      <span className="font-medium text-gray-900">
                        {shops.length} {shops.length === 1 ? "shop" : "shops"}{" "}
                        found
                      </span>
                    )}
                  </div>
                  <button
                    onClick={resetFilters}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Clear all
                  </button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {loading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="bg-white rounded-lg shadow-sm p-6 animate-pulse"
                  >
                    <div className="flex gap-4">
                      <div className="w-20 h-20 bg-gray-200 rounded-lg" />
                      <div className="flex-1 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-2/3" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && shops.length === 0 && (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {hasActiveFilters ? "No shops found" : "No shops yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {hasActiveFilters
                    ? "Try adjusting your filters to see more results"
                    : "Create your first shop to start selling"}
                </p>
                {hasActiveFilters ? (
                  <button
                    onClick={resetFilters}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                ) : canCreateMore ? (
                  <Link
                    href="/seller/my-shops/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    Create Shop
                  </Link>
                ) : null}
              </div>
            )}

            {/* Shops Grid */}
            {!loading && !error && shops.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {shops.map((shop) => (
                  <ShopCard key={shop.id} shop={shop} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

// Shop Card Component
function ShopCard({ shop }: { shop: Shop }) {
  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-6">
      <div className="flex gap-4">
        {/* Shop Logo */}
        <div className="flex-shrink-0">
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.name}
              className="w-20 h-20 rounded-lg object-cover"
            />
          ) : (
            <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center">
              <Store className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>

        {/* Shop Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate">
                {shop.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">@{shop.slug}</p>
            </div>

            {/* Status Badges */}
            <div className="flex flex-col gap-1">
              {shop.isVerified && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  Verified
                </span>
              )}
              {shop.isFeatured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                  Featured
                </span>
              )}
              {shop.isBanned && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                  Banned
                </span>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Package className="w-4 h-4" />
              <span>{shop.productCount || 0} products</span>
            </div>
            {shop.rating && (
              <div className="flex items-center gap-1">
                <span className="text-yellow-500">★</span>
                <span>{shop.rating.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-4">
            <Link
              href={`/seller/my-shops/${shop.id}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <Eye className="w-4 h-4" />
              View
            </Link>
            <Link
              href={`/seller/my-shops/${shop.id}/edit`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Edit
            </Link>
            <Link
              href={`/seller/my-shops/${shop.id}/analytics`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

