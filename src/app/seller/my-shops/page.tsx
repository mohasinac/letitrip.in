"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Star,
  Loader2,
} from "lucide-react";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { shopsService } from "@/services/shops.service";
import type { ShopFE } from "@/types/frontend/shop.types";

export default function MyShopsPage() {
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [shops, setShops] = useState<ShopFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteShopId, setDeleteShopId] = useState<string | null>(null);

  useEffect(() => {
    loadShops();
  }, []);

  const loadShops = async () => {
    try {
      setLoading(true);
      const data: any = await shopsService.list();
      setShops(data.data || data.shops || data || []);
    } catch (error) {
      console.error("Failed to load shops:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shopId: string) => {
    try {
      const shopToDelete = shops.find((shop) => shop.id === shopId);
      if (!shopToDelete) return;

      await shopsService.delete(shopToDelete.slug);
      setShops(shops.filter((shop) => shop.id !== shopId));
      setDeleteShopId(null);
    } catch (error) {
      console.error("Failed to delete shop:", error);
      toast.error("Failed to delete shop. Please try again.");
    }
  };

  const filteredShops = shops.filter(
    (shop) =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-2 text-sm text-gray-600">Loading shops...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Shops</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your shop listings
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          <Link
            href="/seller/my-shops/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Create Shop
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search shops..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Empty State */}
      {filteredShops.length === 0 && !loading && (
        <EmptyState
          title={searchQuery ? "No shops found" : "No shops yet"}
          description={
            searchQuery
              ? "Try adjusting your search query"
              : "Create your first shop to start selling"
          }
          action={
            !searchQuery
              ? {
                  label: "Create Shop",
                  onClick: () => {
                    if (globalThis.location)
                      globalThis.location.href = "/seller/my-shops/create";
                  },
                }
              : undefined
          }
        />
      )}

      {/* Grid View */}
      {view === "grid" && filteredShops.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredShops.map((shop) => (
            <div
              key={shop.id}
              className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="h-32 bg-gray-100">
                <img
                  src={shop.banner || undefined}
                  alt={shop.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="p-4">
                <div className="flex items-start gap-3">
                  <div className="h-16 w-16 flex-shrink-0 rounded-lg border-2 border-white bg-white shadow-md -mt-10">
                    {shop.logo ? (
                      <img
                        src={shop.logo}
                        alt={shop.name}
                        className="h-full w-full rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-full w-full rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-2xl font-bold">
                        {shop.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {shop.name}
                      </h3>
                      {shop.isVerified && (
                        <svg
                          className="h-4 w-4 text-blue-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {shop.rating?.toFixed(1) || "0.0"}
                      </span>
                      <span className="text-sm text-gray-500">
                        ({shop.reviewCount || 0})
                      </span>
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                  {shop.description || "No description"}
                </p>
                <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg bg-gray-50 p-3">
                  <div>
                    <p className="text-sm text-gray-500">Products</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {shop.productCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Rating</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {shop.rating?.toFixed(1) || "—"}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/seller/my-shops/${shop.slug}/edit`}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/shops/${shop.slug}`}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {view === "table" && filteredShops.length > 0 && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {filteredShops.map((shop) => (
                  <tr key={shop.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100">
                          {shop.logo ? (
                            <img
                              src={shop.logo}
                              alt={shop.name}
                              className="h-full w-full rounded object-cover"
                            />
                          ) : (
                            <div className="h-full w-full rounded bg-gray-200 flex items-center justify-center text-gray-400 font-bold">
                              {shop.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900">
                              {shop.name}
                            </div>
                            {shop.isVerified && (
                              <svg
                                className="h-4 w-4 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {shop.description || "No description"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={shop.isBanned ? "banned" : "active"}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {shop.productCount || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      —
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {shop.rating?.toFixed(1) || "0.0"}
                        </span>
                        <span className="text-sm text-gray-500">
                          ({shop.reviewCount || 0})
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/shops/${shop.slug}`}
                          className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                          title="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Link
                          href={`/seller/my-shops/${shop.slug}/edit`}
                          className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteShopId(shop.id)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Inline Create Row */}
          <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
            <Link
              href="/seller/my-shops/create"
              className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Create New Shop
            </Link>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteShopId !== null}
        onClose={() => setDeleteShopId(null)}
        onConfirm={async () => {
          if (deleteShopId) {
            await handleDelete(deleteShopId);
          }
        }}
        title="Delete Shop"
        description="Are you sure you want to delete this shop? This action cannot be undone and will delete all associated products."
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}
