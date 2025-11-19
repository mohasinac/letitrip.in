"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  ExternalLink,
} from "lucide-react";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  InlineEditRow,
  QuickCreateRow,
  BulkActionBar,
  TableCheckbox,
  InlineField,
  BulkAction,
  UnifiedFilterSidebar,
} from "@/components/common/inline-edit";
import { productsService } from "@/services/products.service";
import { categoriesService } from "@/services/categories.service";
import { PRODUCT_FILTERS } from "@/constants/filters";
import { getProductBulkActions } from "@/constants/bulk-actions";
import {
  PRODUCT_FIELDS,
  getFieldsForContext,
  toInlineFields,
} from "@/constants/form-fields";
import { validateForm } from "@/lib/form-validation";
import { useIsMobile } from "@/hooks/useMobile";
import type { ProductCardFE } from "@/types/frontend/product.types";

export default function ProductsPage() {
  const isMobile = useIsMobile();
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [products, setProducts] = useState<ProductCardFE[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Unified filter state
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [totalProducts, setTotalProducts] = useState(0);

  // Inline edit states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [, setValidationErrors] = useState<Record<string, string>>({});
  const [categories, setCategories] = useState<
    Array<{ id: string; name: string }>
  >([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [searchQuery, filterValues]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await productsService.list({
        limit: 50,
        search: searchQuery || undefined,
        ...filterValues,
      });
      setProducts(response.data || []);
      setTotalProducts(response.count || response.data?.length || 0);
    } catch (error) {
      console.error("Failed to load products:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categories = await categoriesService.list({ isActive: true });
      setCategories(
        categories.data.map((cat) => ({ id: cat.id, name: cat.name }))
      );
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };

  // Fields configuration for inline edit (using centralized config)
  const baseFields = toInlineFields(
    getFieldsForContext(PRODUCT_FIELDS, "table")
  );
  const fields: InlineField[] = baseFields.map((field) => {
    // Change categoryId field to use category-create type
    if (field.key === "categoryId") {
      return {
        ...field,
        type: "category-create" as any, // Use custom category selector with create
      };
    }
    return field;
  });

  // Bulk actions configuration
  const bulkActions = getProductBulkActions(selectedIds.length);

  // Bulk action handler
  const handleBulkAction = async (actionId: string, input?: any) => {
    try {
      setActionLoading(true);
      const response = await productsService.bulkAction(
        actionId,
        selectedIds,
        input
      );

      if (response.success) {
        await loadProducts();
        setSelectedIds([]);
      }
    } catch (error) {
      console.error("Bulk action failed:", error);
      alert("Failed to perform bulk action");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const product = products.find((p) => p.id === id);
      if (!product) return;

      await productsService.delete(product.slug);
      await loadProducts();
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete product:", error);
      alert("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Products</h1>
            <p className="mt-1 text-sm text-gray-600">
              Manage your product listings
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ViewToggle view={view} onViewChange={setView} />
            <Link
              href="/seller/products/create"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          {isMobile && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Filter className="h-4 w-4" />
              Filters
            </button>
          )}
        </div>

        {/* Main Content with Sidebar Layout */}
        <div className="flex gap-6">
          {/* Desktop Filters - Always Visible Sidebar */}
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
              onApply={() => {}}
              onReset={() => {
                setFilterValues({});
              }}
              isOpen={false}
              onClose={() => {}}
              searchable={true}
              mobile={false}
              resultCount={totalProducts}
              isLoading={loading}
            />
          )}

          {/* Content Area */}
          <div className="flex-1 space-y-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-600">Loading products...</div>
              </div>
            )}

            {/* Grid View */}
            {!loading && view === "grid" && (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-square bg-gray-100 relative">
                      <img
                        src={product.images?.[0] || "/placeholder-product.jpg"}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                      {/* Media count badge */}
                      {(product.images?.length > 0 ||
                        (product as any).videos?.length > 0) && (
                        <div className="absolute bottom-2 right-2 flex gap-1">
                          {product.images?.length > 0 && (
                            <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {product.images.length}
                            </span>
                          )}
                          {(product as any).videos?.length > 0 && (
                            <span className="bg-black/60 backdrop-blur-sm text-white text-xs font-medium px-2 py-1 rounded flex items-center gap-1">
                              <svg
                                className="w-3 h-3"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm12.553 1.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                              </svg>
                              {(product as any).videos.length}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-gray-900 line-clamp-2">
                          {product.name}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {product.categoryId}
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="text-lg font-semibold text-gray-900">
                          ₹{product.price.toLocaleString()}
                        </span>
                        <StatusBadge status={product.status} />
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm text-gray-600">
                        <span>Stock: {product.stockCount}</span>
                        <span>Sales: {product.salesCount || 0}</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/seller/products/${product.slug}/edit`}
                          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/products/${product.slug}`}
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

            {/* Table View */}
            {!loading && view === "table" && (
              <div className="rounded-lg border border-gray-200 bg-white">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-gray-200 bg-gray-50">
                      <tr>
                        <th className="w-12 px-6 py-3">
                          <TableCheckbox
                            checked={
                              selectedIds.length === filteredProducts.length &&
                              filteredProducts.length > 0
                            }
                            indeterminate={
                              selectedIds.length > 0 &&
                              selectedIds.length < filteredProducts.length
                            }
                            onChange={(checked) => {
                              setSelectedIds(
                                checked ? filteredProducts.map((p) => p.id) : []
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
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {/* Quick Create Row */}
                      <QuickCreateRow
                        fields={fields}
                        onSave={async (values) => {
                          try {
                            // Validate form fields
                            const fieldsToValidate = getFieldsForContext(
                              PRODUCT_FIELDS,
                              "table"
                            );
                            const { isValid, errors } = validateForm(
                              values,
                              fieldsToValidate
                            );

                            if (!isValid) {
                              setValidationErrors(errors);
                              throw new Error("Please fix validation errors");
                            }

                            setValidationErrors({});

                            // Create product using service
                            await productsService.quickCreate({
                              name: values.name,
                              price: values.price,
                              stockCount: values.stockCount,
                              categoryId: values.categoryId,
                              status: values.status,
                              images: values.images ? [values.images] : [],
                            });
                            await loadProducts();
                          } catch (error) {
                            console.error("Failed to create product:", error);
                            throw error;
                          }
                        }}
                        resourceName="product"
                        defaultValues={{
                          status: "draft",
                          stockCount: 0,
                          price: 0,
                        }}
                      />

                      {/* Product Rows */}
                      {filteredProducts.map((product) => {
                        const isEditing = editingId === product.id;
                        const category = categories.find(
                          (c) => c.id === product.categoryId
                        );

                        if (isEditing) {
                          return (
                            <InlineEditRow
                              key={product.id}
                              fields={fields}
                              initialValues={{
                                images: product.images?.[0] || "",
                                name: product.name,
                                price: product.price,
                                stockCount: product.stockCount,
                                categoryId: product.categoryId || "",
                                status: product.status,
                              }}
                              onSave={async (values) => {
                                try {
                                  // Validate form fields
                                  const fieldsToValidate = getFieldsForContext(
                                    PRODUCT_FIELDS,
                                    "table"
                                  );
                                  const { isValid, errors } = validateForm(
                                    values,
                                    fieldsToValidate
                                  );

                                  if (!isValid) {
                                    setValidationErrors(errors);
                                    throw new Error(
                                      "Please fix validation errors"
                                    );
                                  }

                                  setValidationErrors({});

                                  await productsService.quickUpdate(
                                    product.slug,
                                    {
                                      ...values,
                                      images: values.images
                                        ? [values.images]
                                        : product.images,
                                    }
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

                        const isLowStock =
                          product.stockCount <=
                            (product.lowStockThreshold || 5) &&
                          product.stockCount > 0;
                        const isOutOfStock = product.stockCount === 0;

                        return (
                          <tr
                            key={product.id}
                            className="hover:bg-gray-50"
                            onDoubleClick={() => setEditingId(product.id)}
                          >
                            {/* Checkbox */}
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

                            {/* Product */}
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="h-12 w-12 flex-shrink-0 rounded-lg bg-gray-100 overflow-hidden relative">
                                  {product.images?.[0] ? (
                                    <img
                                      src={product.images[0]}
                                      alt={product.name}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
                                      No image
                                    </div>
                                  )}
                                  {/* Media count badge */}
                                  {(product.images?.length > 1 ||
                                    (product as any).videos?.length > 0) && (
                                    <div className="absolute bottom-0 right-0 bg-black/70 text-white text-[10px] px-1 rounded-tl">
                                      {product.images?.length || 0}
                                      {(product as any).videos?.length > 0 &&
                                        `+${(product as any).videos.length}v`}
                                    </div>
                                  )}
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {product.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {product.slug}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                ₹{product.price?.toLocaleString("en-IN") || "0"}
                              </div>
                              {product.originalPrice &&
                                product.originalPrice > product.price && (
                                  <div className="text-xs text-gray-500 line-through">
                                    ₹
                                    {product.originalPrice.toLocaleString(
                                      "en-IN"
                                    )}
                                  </div>
                                )}
                            </td>

                            {/* Stock */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`font-medium ${
                                  isOutOfStock
                                    ? "text-red-600"
                                    : isLowStock
                                    ? "text-yellow-600"
                                    : "text-gray-900"
                                }`}
                              >
                                {product.stockCount}
                              </span>
                              {isLowStock && (
                                <div className="text-xs text-yellow-600 mt-1">
                                  Low stock
                                </div>
                              )}
                              {isOutOfStock && (
                                <div className="text-xs text-red-600 mt-1">
                                  Out of stock
                                </div>
                              )}
                            </td>

                            {/* Category */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {category?.name || "Uncategorized"}
                            </td>

                            {/* Status */}
                            <td className="px-6 py-4 whitespace-nowrap">
                              <StatusBadge status={product.status} />
                            </td>

                            {/* Actions */}
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
                                  href={`/seller/products/${product.slug}/edit`}
                                  className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                                  title="Full Edit"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Link>
                                <button
                                  onClick={() => setDeleteId(product.id)}
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
              </div>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
              isOpen={deleteId !== null}
              title="Delete Product"
              description="Are you sure you want to delete this product? This action cannot be undone."
              onConfirm={() => {
                if (deleteId) handleDelete(deleteId);
              }}
              onClose={() => setDeleteId(null)}
              variant="danger"
              confirmLabel="Delete"
            />
          </div>
        </div>

        {/* Mobile Filters Drawer */}
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
            }}
            onReset={() => {
              setFilterValues({});
            }}
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            searchable={true}
            mobile={true}
            resultCount={totalProducts}
            isLoading={loading}
          />
        )}
      </div>
    </>
  );
}
