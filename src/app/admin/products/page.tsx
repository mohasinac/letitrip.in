"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { toast } from "sonner";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Package,
  Download,
} from "lucide-react";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { ProductCard } from "@/components/cards/ProductCard";
import { useAuth } from "@/contexts/AuthContext";
import {
  InlineEditRow,
  BulkActionBar,
  TableCheckbox,
  InlineField,
  UnifiedFilterSidebar,
} from "@/components/common/inline-edit";
import { getProductBulkActions } from "@/constants/bulk-actions";
import { productsService } from "@/services/products.service";
import type { ProductCardFE } from "@/types/frontend/product.types";
import type { ProductStatus } from "@/types/shared/common.types";
import { PRODUCT_FILTERS } from "@/constants/filters";
import { useIsMobile } from "@/hooks/useMobile";
import {
  PRODUCT_FIELDS,
  getFieldsForContext,
  toInlineFields,
} from "@/constants/form-fields";
import { validateForm } from "@/lib/form-validation";

export default function AdminProductsPage() {
  const { user, isAdmin } = useAuth();
  const router = useRouter();
  const isMobile = useIsMobile();
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);

  // Infinite loop prevention
  const loadingRef = useRef(false);
  const hasLoadedRef = useRef(false);

  // Filters
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 20;

  // Inline edit states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadProducts = useCallback(async () => {
    // Prevent concurrent calls
    if (loadingRef.current) {
      console.log("[Products] Already loading, skipping...");
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      const filters: any = {
        page: currentPage,
        limit,
        search: debouncedSearchQuery || undefined,
        ...filterValues,
        sortBy: "createdAt",
        sortOrder: "desc",
      };

      console.log("[Products] Loading with filters:", filters);
      const response = await productsService.list(filters);

      setProducts(response.data || []);
      // Note: Cursor pagination doesn't have totalPages, using count for total
      setTotalPages(Math.ceil((response.count || 0) / limit));
      setTotalProducts(response.count || 0);
      hasLoadedRef.current = true;
    } catch (error) {
      console.error("Failed to load products:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load products"
      );
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [currentPage, debouncedSearchQuery, filterValues, limit]);

  useEffect(() => {
    if (user?.uid && isAdmin && !loadingRef.current) {
      loadProducts();
    }
  }, [user?.uid, isAdmin, loadProducts]);

  // Fields configuration for inline edit - using centralized config
  const fields: InlineField[] = toInlineFields(
    getFieldsForContext(PRODUCT_FIELDS, "table")
  );

  // Bulk actions configuration
  const bulkActions = getProductBulkActions(selectedIds.length);

  // Bulk action handler
  const handleBulkAction = async (actionId: string) => {
    try {
      setActionLoading(true);

      // Map actions to status updates
      const actionMap: Record<string, any> = {
        approve: { status: "published" as ProductStatus },
        reject: { status: "archived" as ProductStatus },
      };

      if (actionId === "delete") {
        // Delete products
        await Promise.all(
          selectedIds.map(async (id) => {
            const product = products.find((p) => p.id === id);
            if (product) {
              await productsService.delete(product.slug);
            }
          })
        );
      } else {
        // Update products
        await Promise.all(
          selectedIds.map(async (id) => {
            const product = products.find((p) => p.id === id);
            if (product) {
              await productsService.update(product.slug, actionMap[actionId]);
            }
          })
        );
      }

      await loadProducts();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk action failed:", error);
      toast.error("Failed to perform bulk action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (slug: string) => {
    try {
      await productsService.delete(slug);
      await loadProducts();
      setDeleteSlug(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast.error("Failed to delete product");
    }
  };

  const exportProducts = () => {
    // Create CSV content
    const headers = [
      "Name",
      "SKU",
      "Price",
      "Stock",
      "Status",
      "Shop",
      "Category",
      "Rating",
      "Sales",
    ];
    const rows = products.map((p) => [
      p.name,
      p.sku || "",
      p.price,
      p.stockCount,
      p.status,
      p.shopId,
      p.categoryId,
      p.rating,
      p.salesCount,
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join(
      "\n"
    );

    // Download CSV
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(price);
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

  if (loading && products.length === 0) {
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
            onClick={loadProducts}
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
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all products across the platform ({totalProducts} total)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={exportProducts}
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

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-16 z-10 mb-4">
          <BulkActionBar
            selectedCount={selectedIds.length}
            actions={bulkActions}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedIds([])}
            loading={actionLoading}
            resourceName="product"
          />
        </div>
      )}

      {/* Main Content with Sidebar Layout */}
      <div className="flex gap-6">
        {/* Desktop Filters */}
        {!isMobile && (
          <UnifiedFilterSidebar
            sections={PRODUCT_FILTERS}
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
            resultCount={totalProducts}
            isLoading={loading}
            showInlineSearch={true}
            onInlineSearchChange={(value: string) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            inlineSearchValue={searchQuery}
            inlineSearchPlaceholder="Search by name or SKU..."
          />
        )}

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {/* Grid View - Using Unified ProductCard */}
          {view === "grid" && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  slug={product.slug}
                  price={product.price}
                  originalPrice={product.compareAtPrice ?? undefined}
                  image={product.images[0] || ""}
                  images={product.images}
                  rating={product.rating}
                  reviewCount={product.reviewCount}
                  inStock={product.stockCount > 0}
                  status={product.status}
                  sku={product.sku || undefined}
                  stockCount={product.stockCount}
                  salesCount={product.salesCount}
                  variant="admin"
                  onEdit={(slug) => router.push(`/admin/products/${slug}/edit`)}
                  onDelete={(slug) => setDeleteSlug(slug)}
                  isSelected={selectedIds.includes(product.id)}
                  onSelect={(id, selected) => {
                    setSelectedIds((prev) =>
                      selected ? [...prev, id] : prev.filter((i) => i !== id)
                    );
                  }}
                />
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
                            selectedIds.length === products.length &&
                            products.length > 0
                          }
                          indeterminate={
                            selectedIds.length > 0 &&
                            selectedIds.length < products.length
                          }
                          onChange={(checked) => {
                            setSelectedIds(
                              checked ? products.map((p) => p.id) : []
                            );
                          }}
                          aria-label="Select all products"
                        />
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stock
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {/* Product Rows */}
                    {products.map((product) => {
                      const isEditing = editingId === product.id;

                      if (isEditing) {
                        return (
                          <InlineEditRow
                            key={product.id}
                            fields={fields}
                            initialValues={{
                              name: product.name,
                              price: product.price,
                              stockCount: product.stockCount,
                              status: product.status,
                            }}
                            onSave={async (values) => {
                              try {
                                // Validate form fields
                                const fieldsToValidate = getFieldsForContext(
                                  PRODUCT_FIELDS,
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

                                await productsService.update(
                                  product.slug,
                                  values
                                );
                                await loadProducts();
                                setEditingId(null);
                              } catch (error) {
                                console.error(
                                  "Failed to update product:",
                                  error
                                );
                                throw error;
                              }
                            }}
                            onCancel={() => setEditingId(null)}
                            resourceName="product"
                          />
                        );
                      }

                      return (
                        <tr
                          key={product.id}
                          className="hover:bg-gray-50"
                          onDoubleClick={() => setEditingId(product.id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <TableCheckbox
                              checked={selectedIds.includes(product.id)}
                              onChange={(checked) => {
                                setSelectedIds((prev) =>
                                  checked
                                    ? [...prev, product.id]
                                    : prev.filter((id) => id !== product.id)
                                );
                              }}
                              aria-label={`Select ${product.name}`}
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center overflow-hidden relative">
                                {product.images[0] ? (
                                  <OptimizedImage
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                  />
                                ) : (
                                  <Package className="h-6 w-6 text-gray-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 truncate max-w-xs">
                                  {product.name}
                                </div>
                                <div className="text-sm text-gray-500 truncate">
                                  {product.sku || "No SKU"}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {formatPrice(product.price)}
                            </div>
                            {product.originalPrice &&
                              product.originalPrice > product.price && (
                                <div className="text-xs text-gray-500 line-through">
                                  {formatPrice(product.originalPrice)}
                                </div>
                              )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`text-sm font-medium ${
                                product.stockCount === 0
                                  ? "text-red-600"
                                  : product.stockCount <
                                    (product.lowStockThreshold || 10)
                                  ? "text-yellow-600"
                                  : "text-green-600"
                              }`}
                            >
                              {product.stockCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={product.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            <div>⭐ {product.rating.toFixed(1)}</div>
                            <div className="text-xs text-gray-500">
                              {product.salesCount} sales
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                            <div className="flex items-center justify-end gap-2">
                              <Link
                                href={`/products/${product.slug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                                title="View"
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                              <Link
                                href={`/admin/products/${product.slug}/edit`}
                                className="rounded p-1.5 text-purple-600 hover:bg-purple-50"
                                title="Edit"
                              >
                                <Edit className="h-4 w-4" />
                              </Link>
                              <button
                                onClick={() => setDeleteSlug(product.slug)}
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
                        {Math.min(currentPage * limit, totalProducts)}
                      </span>{" "}
                      of <span className="font-medium">{totalProducts}</span>{" "}
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

              {/* Empty State */}
              {products.length === 0 && !loading && (
                <div className="text-center py-12">
                  <Package className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    {searchQuery || Object.keys(filterValues).length > 0
                      ? "No products found"
                      : "No products yet"}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchQuery || Object.keys(filterValues).length > 0
                      ? "Try adjusting your filters"
                      : "Products from sellers will appear here"}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile Filters */}
        {isMobile && (
          <UnifiedFilterSidebar
            sections={PRODUCT_FILTERS}
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
            resultCount={totalProducts}
            isLoading={loading}
            showInlineSearch={true}
            onInlineSearchChange={(value: string) => {
              setSearchQuery(value);
              setCurrentPage(1);
            }}
            inlineSearchValue={searchQuery}
            inlineSearchPlaceholder="Search by name or SKU..."
          />
        )}
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteSlug !== null}
        title="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
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
