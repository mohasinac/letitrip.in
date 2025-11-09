"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Store,
  CheckCircle,
  XCircle,
  Download,
  Ban,
  Shield,
} from "lucide-react";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  InlineEditRow,
  BulkActionBar,
  TableCheckbox,
  InlineField,
  BulkAction,
} from "@/components/common/inline-edit";
import { shopsService, type ShopFilters } from "@/services/shops.service";
import type { Shop } from "@/types";

export default function AdminShopsPage() {
  const { user, isAdmin } = useAuth();
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  // Filters
  const [verifiedFilter, setVerifiedFilter] = useState<
    "all" | "verified" | "unverified"
  >("all");
  const [bannedFilter, setBannedFilter] = useState<"all" | "active" | "banned">(
    "all"
  );

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShops, setTotalShops] = useState(0);
  const limit = 20;

  // Inline edit states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      loadShops();
    }
  }, [user, isAdmin, searchQuery, verifiedFilter, bannedFilter, currentPage]);

  const loadShops = async () => {
    try {
      setLoading(true);
      setError(null);

      const filters: ShopFilters = {
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        verified:
          verifiedFilter === "verified"
            ? true
            : verifiedFilter === "unverified"
            ? false
            : undefined,
        banned:
          bannedFilter === "banned"
            ? true
            : bannedFilter === "active"
            ? false
            : undefined,
      };

      const response = await shopsService.list(filters);

      setShops(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotalShops(response.pagination?.total || 0);
    } catch (error) {
      console.error("Failed to load shops:", error);
      setError(error instanceof Error ? error.message : "Failed to load shops");
    } finally {
      setLoading(false);
    }
  };

  // Fields configuration for inline edit
  const fields: InlineField[] = [
    { key: "name", label: "Name", type: "text", required: true },
    {
      key: "isVerified",
      label: "Verified",
      type: "checkbox",
    },
    {
      key: "isFeatured",
      label: "Featured",
      type: "checkbox",
    },
    {
      key: "showOnHomepage",
      label: "Show on Homepage",
      type: "checkbox",
    },
  ];

  // Bulk actions configuration
  const bulkActions: BulkAction[] = [
    {
      id: "verify",
      label: "Verify Shops",
      variant: "success",
      confirm: false,
    },
    {
      id: "unverify",
      label: "Remove Verification",
      variant: "default",
      confirm: false,
    },
    {
      id: "feature",
      label: "Set Featured",
      variant: "success",
      confirm: false,
    },
    {
      id: "unfeature",
      label: "Remove Featured",
      variant: "default",
      confirm: false,
    },
    {
      id: "ban",
      label: "Suspend/Ban",
      variant: "danger",
      confirm: true,
      confirmTitle: "Ban Shops",
      confirmMessage: `Are you sure you want to ban ${selectedIds.length} shop${
        selectedIds.length === 1 ? "" : "s"
      }? They will not be able to sell products.`,
    },
    {
      id: "unban",
      label: "Activate/Unban",
      variant: "success",
      confirm: false,
    },
    {
      id: "delete",
      label: "Delete",
      variant: "danger",
      confirm: true,
      confirmTitle: "Delete Shops",
      confirmMessage: `Are you sure you want to delete ${
        selectedIds.length
      } shop${
        selectedIds.length === 1 ? "" : "s"
      }? This cannot be undone and will affect all their products.`,
    },
  ];

  // Bulk action handler
  const handleBulkAction = async (actionId: string) => {
    try {
      setActionLoading(true);

      await Promise.all(
        selectedIds.map(async (id) => {
          const shop = shops.find((s) => s.id === id);
          if (!shop) return;

          switch (actionId) {
            case "verify":
              await shopsService.verify(shop.slug, { isVerified: true });
              break;
            case "unverify":
              await shopsService.verify(shop.slug, { isVerified: false });
              break;
            case "feature":
              await shopsService.setFeatureFlags(shop.slug, {
                isFeatured: true,
                showOnHomepage: shop.showOnHomepage,
              });
              break;
            case "unfeature":
              await shopsService.setFeatureFlags(shop.slug, {
                isFeatured: false,
                showOnHomepage: false,
              });
              break;
            case "ban":
              await shopsService.ban(shop.slug, {
                isBanned: true,
                banReason: "Bulk action by admin",
              });
              break;
            case "unban":
              await shopsService.ban(shop.slug, { isBanned: false });
              break;
            case "delete":
              await shopsService.delete(shop.slug);
              break;
          }
        })
      );

      await loadShops();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk action failed:", error);
      alert("Failed to perform bulk action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await shopsService.delete(slug);
      await loadShops();
      setDeleteSlug(null);
    } catch (error) {
      console.error("Failed to delete shop:", error);
      alert("Failed to delete shop. It may have active products or orders.");
    }
  };

  const exportShops = () => {
    const headers = [
      "Name",
      "Owner Email",
      "Location",
      "Verified",
      "Featured",
      "Banned",
      "Products",
      "Rating",
      "Reviews",
    ];
    const rows = shops.map((s) => [
      s.name,
      s.email || "",
      s.location || "",
      s.isVerified ? "Yes" : "No",
      s.isFeatured ? "Yes" : "No",
      s.isBanned ? "Yes" : "No",
      s.productCount,
      s.rating,
      s.reviewCount,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shops-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading && shops.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={loadShops}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shops</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all shops on the platform ({totalShops} total)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportShops}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <ViewToggle view={view} onViewChange={setView} />
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
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          Filters {showFilters ? "▲" : "▼"}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Verification Status
              </label>
              <select
                value={verifiedFilter}
                onChange={(e) => {
                  setVerifiedFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="all">All Shops</option>
                <option value="verified">Verified Only</option>
                <option value="unverified">Unverified Only</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Shop Status
              </label>
              <select
                value={bannedFilter}
                onChange={(e) => {
                  setBannedFilter(e.target.value as any);
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="banned">Suspended Only</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setVerifiedFilter("all");
                  setBannedFilter("all");
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gradient-to-br from-purple-50 to-blue-50 relative">
                {shop.logo ? (
                  <img
                    src={shop.logo}
                    alt={shop.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <Store size={48} />
                  </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                  {shop.isVerified && (
                    <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verified
                    </span>
                  )}
                  {shop.isBanned && (
                    <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 flex items-center gap-1">
                      <Ban className="h-3 w-3" />
                      Banned
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {shop.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {shop.location || "No location"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  {shop.isFeatured && (
                    <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                      Featured
                    </span>
                  )}
                  {shop.showOnHomepage && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Homepage
                    </span>
                  )}
                </div>
                <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                  <span>⭐ {shop.rating.toFixed(1)}</span>
                  <span>{shop.productCount} products</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/admin/shops/${shop.slug}/edit`}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/shops/${shop.slug}`}
                    target="_blank"
                    className="flex-1 rounded-lg bg-purple-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-purple-700"
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
      {view === "table" && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-3">
                    <TableCheckbox
                      checked={
                        selectedIds.length === shops.length && shops.length > 0
                      }
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < shops.length
                      }
                      onChange={(checked) => {
                        setSelectedIds(checked ? shops.map((s) => s.id) : []);
                      }}
                      aria-label="Select all shops"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Shop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Owner
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stats
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flags
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {shops.map((shop) => {
                  const isEditing = editingId === shop.id;

                  if (isEditing) {
                    return (
                      <InlineEditRow
                        key={shop.id}
                        fields={fields}
                        initialValues={{
                          name: shop.name,
                          isVerified: shop.isVerified,
                          isFeatured: shop.isFeatured,
                          showOnHomepage: shop.showOnHomepage,
                        }}
                        onSave={async (values) => {
                          try {
                            if (values.isVerified !== shop.isVerified) {
                              await shopsService.verify(shop.slug, {
                                isVerified: values.isVerified,
                              });
                            }
                            if (
                              values.isFeatured !== shop.isFeatured ||
                              values.showOnHomepage !== shop.showOnHomepage
                            ) {
                              await shopsService.setFeatureFlags(shop.slug, {
                                isFeatured: values.isFeatured,
                                showOnHomepage: values.showOnHomepage,
                              });
                            }
                            if (values.name !== shop.name) {
                              await shopsService.update(shop.slug, {
                                name: values.name,
                              });
                            }
                            await loadShops();
                            setEditingId(null);
                          } catch (error) {
                            console.error("Failed to update shop:", error);
                            throw error;
                          }
                        }}
                        onCancel={() => setEditingId(null)}
                        resourceName="shop"
                      />
                    );
                  }

                  return (
                    <tr
                      key={shop.id}
                      className="hover:bg-gray-50"
                      onDoubleClick={() => setEditingId(shop.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TableCheckbox
                          checked={selectedIds.includes(shop.id)}
                          onChange={(checked) => {
                            setSelectedIds((prev) =>
                              checked
                                ? [...prev, shop.id]
                                : prev.filter((id) => id !== shop.id)
                            );
                          }}
                          aria-label={`Select ${shop.name}`}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 flex-shrink-0 rounded bg-gradient-to-br from-purple-100 to-blue-100 flex items-center justify-center overflow-hidden">
                            {shop.logo ? (
                              <img
                                src={shop.logo}
                                alt={shop.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Store className="h-6 w-6 text-purple-600" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 truncate max-w-xs">
                              {shop.name}
                            </div>
                            <div className="text-sm text-gray-500 truncate">
                              {shop.location || "No location"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {shop.email || shop.ownerId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {shop.isVerified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                              <CheckCircle className="h-3 w-3" />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
                              <XCircle className="h-3 w-3" />
                              Unverified
                            </span>
                          )}
                          {shop.isBanned && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                              <Ban className="h-3 w-3" />
                              Banned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>⭐ {shop.rating.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">
                          {shop.productCount} products
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1">
                          {shop.isFeatured && (
                            <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                              Featured
                            </span>
                          )}
                          {shop.showOnHomepage && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Homepage
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/shops/${shop.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/shops/${shop.slug}/edit`}
                            className="rounded p-1.5 text-purple-600 hover:bg-purple-50"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteSlug(shop.slug)}
                            className="rounded p-1.5 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * limit + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(currentPage * limit, totalShops)}
                  </span>{" "}
                  of <span className="font-medium">{totalShops}</span> results
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <span className="inline-flex items-center px-4 py-1.5 text-sm font-medium text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          actions={bulkActions}
          onAction={handleBulkAction}
          onClearSelection={() => setSelectedIds([])}
          loading={actionLoading}
          resourceName="shop"
        />
      )}

      {/* Empty State */}
      {shops.length === 0 && !loading && (
        <div className="text-center py-12">
          <Store className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchQuery || verifiedFilter !== "all" || bannedFilter !== "all"
              ? "No shops found"
              : "No shops yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery || verifiedFilter !== "all" || bannedFilter !== "all"
              ? "Try adjusting your filters"
              : "Shops from sellers will appear here"}
          </p>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteSlug !== null}
        title="Delete Shop"
        description="Are you sure you want to delete this shop? This action cannot be undone and will affect all their products and orders."
        onConfirm={() => {
          if (deleteSlug) handleDelete(deleteSlug);
        }}
        onClose={() => setDeleteSlug(null)}
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  );
}
