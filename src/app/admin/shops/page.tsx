"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useDebounce } from "@/hooks/useDebounce";
import {
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
} from "lucide-react";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  InlineEditRow,
  BulkActionBar,
  TableCheckbox,
  InlineField,
  UnifiedFilterSidebar,
} from "@/components/common/inline-edit";
import { shopsService } from "@/services/shops.service";
import type { ShopCardFE } from "@/types/frontend/shop.types";
import type { ShopFiltersBE } from "@/types/backend/shop.types";
import { SHOP_FILTERS } from "@/constants/filters";
import { getShopBulkActions } from "@/constants/bulk-actions";
import { useIsMobile } from "@/hooks/useMobile";
import {
  SHOP_FIELDS,
  getFieldsForContext,
  toInlineFields,
} from "@/constants/form-fields";
import { validateForm } from "@/lib/form-validation";

export default function AdminShopsPage() {
  const { user, isAdmin } = useAuth();
  const isMobile = useIsMobile();
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [shops, setShops] = useState<ShopCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  // Infinite loop prevention
  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Filters
  const [filterValues, setFilterValues] = useState<Partial<ShopFiltersBE>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalShops, setTotalShops] = useState(0);
  const limit = 20;

  // Inline edit states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadShops = useCallback(async () => {
    // Prevent concurrent calls
    if (loadingRef.current) {
      console.log("[Shops] Already loading, skipping...");
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const filters: Partial<ShopFiltersBE> & {
        page?: number;
        limit?: number;
      } = {
        page: currentPage,
        limit,
        search: debouncedSearchQuery || undefined,
        ...filterValues,
      };

      console.log("[Shops] Loading with filters:", filters);
      const response = await shopsService.list(filters);

      // Deduplicate shops by ID to prevent React key warnings
      const uniqueShops = Array.from(
        new Map((response.data || []).map((shop) => [shop.id, shop])).values()
      );
      setShops(uniqueShops);
      // Calculate total pages from count
      setTotalPages(Math.ceil((response.count || 0) / limit));
      setTotalShops(response.count || 0);
      hasLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to load shops:", error);
      setError(error instanceof Error ? error.message : "Failed to load shops");
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [currentPage, debouncedSearchQuery, filterValues, limit]);

  useEffect(() => {
    if (user?.uid && isAdmin && !loadingRef.current) {
      loadShops();
    }
  }, [user?.uid, isAdmin, loadShops]);

  // Fields configuration for inline edit - using centralized config
  const fields: InlineField[] = toInlineFields(
    getFieldsForContext(SHOP_FIELDS, "table")
  );

  // Bulk actions configuration
  const bulkActions = getShopBulkActions(selectedIds.length);

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
                featured: true,
              });
              break;
            case "unfeature":
              await shopsService.setFeatureFlags(shop.slug, {
                featured: false,
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
      s.featured ? "Yes" : "No",
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

      {/* Mobile Filter Toggle */}
      {isMobile && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>
      )}

      {/* Main Content with Sidebar Layout */}
      <div className="flex gap-6">
        {/* Desktop Filters */}
        {!isMobile && (
          <UnifiedFilterSidebar
            sections={SHOP_FILTERS}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({
                ...prev,
                [key]: value,
              }));
            }}
            onApply={() => setCurrentPage(1)}
            onReset={() => {
              setFilterValues({});
              setSearchQuery("");
              setCurrentPage(1);
            }}
            isOpen={false}
            onClose={() => {}}
            searchable={true}
            mobile={false}
            resultCount={totalShops}
            isLoading={loading}
            showInlineSearch={true}
            onInlineSearchChange={(value: string) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            inlineSearchValue={searchQuery}
            inlineSearchPlaceholder="Search shops..."
          />
        )}

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {/* Grid View */}
          {view === "grid" && (
            <div
              data-testid="grid-view"
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
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
                      {shop.featured && (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                          Featured
                        </span>
                      )}
                      {shop.featured && (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                          Homepage
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        ⭐{" "}
                        <span data-testid="shop-rating">
                          {shop.rating.toFixed(1)}
                        </span>
                      </span>
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

          {/* Bulk Action Bar */}
          {selectedIds.length > 0 && (
            <div className="sticky top-16 z-10 mb-4">
              <BulkActionBar
                selectedCount={selectedIds.length}
                actions={bulkActions}
                onAction={handleBulkAction}
                onClearSelection={() => setSelectedIds([])}
                loading={actionLoading}
                resourceName="shop"
              />
            </div>
          )}

          {/* Table View */}
          {view === "table" && (
            <div className="rounded-lg border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-gray-200 bg-gray-50">
                    <tr>
                      <th
                        className="w-12 px-6 py-3"
                        data-testid="select-all-header"
                      >
                        <TableCheckbox
                          checked={
                            selectedIds.length === shops.length &&
                            shops.length > 0
                          }
                          indeterminate={
                            selectedIds.length > 0 &&
                            selectedIds.length < shops.length
                          }
                          onChange={(checked) => {
                            if (checked) {
                              setSelectedIds(shops.map((s) => s.id));
                            } else {
                              setSelectedIds([]);
                            }
                          }}
                          label="Select all shops"
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
                              featured: shop.featured,
                            }}
                            onSave={async (values) => {
                              try {
                                // Validate form fields
                                const fieldsToValidate = getFieldsForContext(
                                  SHOP_FIELDS,
                                  "table"
                                );
                                const { isValid } = validateForm(
                                  values,
                                  fieldsToValidate
                                );

                                if (!isValid) {
                                  throw new Error(
                                    "Please fix validation errors"
                                  );
                                }

                                if (values.isVerified !== shop.isVerified) {
                                  await shopsService.verify(shop.slug, {
                                    isVerified: values.isVerified,
                                  });
                                }
                                if (values.featured !== shop.featured) {
                                  await shopsService.setFeatureFlags(
                                    shop.slug,
                                    {
                                      featured: values.featured,
                                    }
                                  );
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
                              label={`Select ${shop.name}`}
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
                              {shop.featured && (
                                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-700">
                                  Featured
                                </span>
                              )}
                              {shop.featured && (
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
                      of <span className="font-medium">{totalShops}</span>{" "}
                      results
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
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

          {/* Empty State */}
          {shops.length === 0 && !loading && (
            <div className="text-center py-12">
              <Store className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchQuery || Object.keys(filterValues).length > 0
                  ? "No shops found"
                  : "No shops yet"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery || Object.keys(filterValues).length > 0
                  ? "Try adjusting your filters"
                  : "Shops from sellers will appear here"}
              </p>
            </div>
          )}
        </div>

        {/* Mobile Filters */}
        {isMobile && (
          <UnifiedFilterSidebar
            sections={SHOP_FILTERS}
            values={filterValues}
            onChange={(key, value) => {
              setFilterValues((prev) => ({
                ...prev,
                [key]: value,
              }));
            }}
            onApply={() => {
              setShowFilters(false);
              setCurrentPage(1);
            }}
            onReset={() => {
              setFilterValues({});
              setSearchQuery("");
              setCurrentPage(1);
            }}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            searchable={true}
            mobile={true}
            resultCount={totalShops}
            isLoading={loading}
            showInlineSearch={true}
            onInlineSearchChange={(value: string) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            inlineSearchValue={searchQuery}
            inlineSearchPlaceholder="Search shops..."
          />
        )}
      </div>

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
