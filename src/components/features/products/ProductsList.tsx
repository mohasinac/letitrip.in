/**
 * Reusable Products List Component
 * Can be used by both Admin and Seller pages with different contexts
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Copy,
  Archive,
  Package,
  Eye,
  AlertTriangle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { useAuth } from '@/contexts/SessionAuthContext';
import { apiClient } from "@/lib/api/client";
import { apiGet, apiDelete } from "@/lib/api/seller";
import { useRouter } from "next/navigation";
import {
  ModernDataTable,
  PageHeader,
  type TableColumn,
} from "@/components/ui/admin-seller";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { UnifiedBadge } from "@/components/ui/unified/Badge";
import { UnifiedCard } from "@/components/ui/unified/Card";
import { UnifiedModal } from "@/components/ui/unified/Modal";
import { UnifiedAlert } from "@/components/ui/unified/Alert";
import type { SellerProduct } from "@/types/shared";
import { getProductImageUrl } from "@/utils/product";

// Placeholder image
const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%239ca3af'%3ENo Image%3C/text%3E%3C/svg%3E";

interface ProductStats {
  total: number;
  active: number;
  draft?: number;
  archived?: number;
  outOfStock: number;
  lowStock: number;
  inStock?: number;
  totalValue?: number;
  totalRevenue?: number;
  totalSales?: number;
  totalSellers?: number;
}

interface ProductsListProps {
  /**
   * Context: 'admin' or 'seller'
   * Determines API endpoints and permissions
   */
  context: "admin" | "seller";

  /**
   * Base path for navigation
   */
  basePath: string;

  /**
   * Breadcrumbs for navigation
   */
  breadcrumbs: Array<{ label: string; href?: string; active?: boolean }>;

  /**
   * Show seller information in table (admin only)
   */
  showSellerInfo?: boolean;

  /**
   * Route to create new product
   */
  createRoute?: string;

  /**
   * Function to get edit route for a product
   */
  getEditRoute?: (productId: string) => string;
}

export function ProductsList({
  context,
  basePath,
  breadcrumbs,
  showSellerInfo = false,
  createRoute,
  getEditRoute,
}: ProductsListProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(context === "admin" ? 50 : 20);
  const [stats, setStats] = useState<ProductStats>({
    total: 0,
    active: 0,
    outOfStock: 0,
    lowStock: 0,
  });
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  // Determine API endpoint based on context
  const apiEndpoint =
    context === "admin" ? "/api/admin/products" : "/api/seller/products";
  const statsEndpoint =
    context === "admin"
      ? "/api/admin/products/stats"
      : "/api/seller/products/stats";

  // Fetch products from API
  const fetchProducts = async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (context === "admin") {
        params.append("page", page.toString());
        params.append("limit", pageSize.toString());
      }

      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (stockFilter !== "all" && context === "admin") {
        params.append("stockStatus", stockFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      if (context === "admin") {
        const response = await apiClient.get<SellerProduct[]>(
          `${apiEndpoint}?${params.toString()}`
        );
        setProducts(response || []);
      } else {
        const response = await apiGet<{
          success: boolean;
          data: SellerProduct[];
        }>(`${apiEndpoint}${params.toString() ? `?${params.toString()}` : ""}`);

        if (response.success && response.data) {
          setProducts(response.data);
        }
      }
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to load products",
        type: "error",
      });
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    if (!user || authLoading) return;

    try {
      if (context === "admin") {
        const response = await apiClient.get<ProductStats>(statsEndpoint);
        setStats(response || stats);
      } else {
        // Calculate stats from products for seller
        const calculatedStats = {
          total: products.length,
          active: products.filter((p) => p.status === "active").length,
          outOfStock: products.filter((p) => getProductQuantity(p) === 0)
            .length,
          lowStock: products.filter((p) => {
            const quantity = getProductQuantity(p);
            const threshold = getProductLowStockThreshold(p);
            return quantity > 0 && quantity < threshold;
          }).length,
        };
        setStats(calculatedStats);
      }
    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
    }
  };

  useEffect(() => {
    if (user && !authLoading) {
      fetchProducts();
    }
  }, [user, authLoading, statusFilter, stockFilter, page, pageSize]);

  useEffect(() => {
    if (context === "admin" && user && !authLoading) {
      fetchStats();
    } else if (context === "seller" && products.length >= 0) {
      fetchStats();
    }
  }, [user, authLoading, products]);

  // Handle delete
  const handleDeleteClick = (product: SellerProduct) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      setDeletingProduct(true);

      if (context === "admin") {
        await apiClient.delete("/api/admin/products", {
          data: { ids: [selectedProduct.id] },
        });
      } else {
        const response = await apiDelete<{
          success: boolean;
          message?: string;
        }>(`/api/seller/products/${selectedProduct.id}`);
        if (!response.success) throw new Error("Failed to delete");
      }

      setProducts(products.filter((p) => p.id !== selectedProduct.id));
      setAlert({
        show: true,
        message: "Product deleted successfully",
        type: "success",
      });
      setSelectedProduct(null);
      fetchStats();
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to delete product",
        type: "error",
      });
    } finally {
      setDeletingProduct(false);
      setDeleteDialogOpen(false);
    }
  };

  // Handle bulk delete (admin only)
  const handleBulkDelete = async (ids: string[]) => {
    if (context !== "admin" || ids.length === 0) return;

    try {
      await apiClient.delete("/api/admin/products", {
        data: { ids },
      });

      setAlert({
        show: true,
        message: `${ids.length} product(s) deleted successfully`,
        type: "success",
      });

      setSelectedProducts([]);
      fetchProducts();
      fetchStats();
    } catch (error: any) {
      setAlert({
        show: true,
        message: error.message || "Failed to delete products",
        type: "error",
      });
    }
  };

  // Utility functions
  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "draft":
        return "default";
      case "out_of_stock":
        return "error";
      case "archived":
        return "warning";
      default:
        return "default";
    }
  };

  const getStockStatus = (stock: number, lowStockThreshold: number) => {
    if (stock === 0 || stock === undefined || stock === null)
      return { label: "Out of Stock", variant: "error" as const };
    if (stock < lowStockThreshold)
      return { label: "Low Stock", variant: "warning" as const };
    return { label: "In Stock", variant: "success" as const };
  };

  // Helper to get quantity from product (handles both nested and flattened structures)
  const getProductQuantity = (product: any): number => {
    return product.inventory?.quantity ?? product.quantity ?? 0;
  };

  // Helper to get lowStockThreshold from product (handles both nested and flattened structures)
  const getProductLowStockThreshold = (product: any): number => {
    return (
      product.inventory?.lowStockThreshold ?? product.lowStockThreshold ?? 1
    );
  };

  // Table columns
  const columns: TableColumn<SellerProduct>[] = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (_, product) => {
        const imageUrl = getProductImageUrl(product, 0, PLACEHOLDER_IMAGE);

        return (
          <div className="flex items-center gap-3">
            <img
              src={imageUrl}
              alt={product.name}
              className="w-12 h-12 rounded-lg object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
              }}
            />
            <div className="min-w-0">
              <p className="font-medium text-text truncate">{product.name}</p>
              <p className="text-xs text-textSecondary truncate">
                {product.slug}
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "sku",
      label: "SKU",
      render: (_, product) => {
        const sku = (product as any).inventory?.sku || product.sku || "—";
        return <span className="text-sm text-text">{sku}</span>;
      },
    },
    ...(showSellerInfo
      ? [
          {
            key: "seller",
            label: "Seller",
            sortable: false,
            render: (_: any, product: SellerProduct) => (
              <div>
                <p className="text-sm text-text">
                  {(product as any).sellerName || "Unknown"}
                </p>
                <p className="text-xs text-textSecondary truncate">
                  {product.sellerId}
                </p>
              </div>
            ),
          },
        ]
      : []),
    {
      key: "pricing",
      label: "Price",
      align: "right" as const,
      sortable: true,
      render: (_, product) => {
        const price = (product as any).pricing?.price ?? product.price ?? 0;
        const compareAtPrice =
          (product as any).pricing?.compareAtPrice ?? product.compareAtPrice;
        return (
          <div className="text-right">
            <p className="font-semibold text-text">₹{price.toLocaleString()}</p>
            {compareAtPrice && (
              <p className="text-xs text-textSecondary line-through">
                ₹{compareAtPrice.toLocaleString()}
              </p>
            )}
          </div>
        );
      },
    },
    {
      key: "inventory",
      label: "Stock",
      sortable: true,
      render: (_, product) => {
        const quantity = getProductQuantity(product);
        const threshold = getProductLowStockThreshold(product);
        const stockStatus = getStockStatus(quantity, threshold);
        return (
          <div>
            <p className="font-semibold text-text mb-1">{quantity}</p>
            <UnifiedBadge size="sm" variant={stockStatus.variant}>
              {stockStatus.label}
            </UnifiedBadge>
          </div>
        );
      },
    },
    {
      key: "category",
      label: "Category",
      render: (_, product) => (
        <span className="text-sm text-text">{product.categorySlug || "—"}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (_, product) => (
        <UnifiedBadge variant={getStatusVariant(product.status) as any}>
          {product.status.replace("_", " ")}
        </UnifiedBadge>
      ),
    },
  ];

  // Row actions
  const rowActions = [
    ...(context === "admin"
      ? [
          {
            label: "View",
            icon: <Eye className="w-4 h-4" />,
            onClick: (product: SellerProduct) => {
              // TODO: Implement view product details for admin
              setAlert({
                show: true,
                message: "View product details coming soon",
                type: "warning",
              });
            },
          },
        ]
      : []),
    {
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: (product: SellerProduct) => {
        if (getEditRoute) {
          router.push(getEditRoute(product.id));
        }
      },
    },
    ...(context === "seller"
      ? [
          {
            label: "Duplicate",
            icon: <Copy className="w-4 h-4" />,
            onClick: (product: SellerProduct) => {
              setAlert({
                show: true,
                message: "Duplicate functionality coming soon",
                type: "warning",
              });
            },
          },
          {
            label: "Archive",
            icon: <Archive className="w-4 h-4" />,
            onClick: (product: SellerProduct) => {
              setAlert({
                show: true,
                message: "Archive functionality coming soon",
                type: "warning",
              });
            },
          },
        ]
      : []),
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (product: SellerProduct) => handleDeleteClick(product),
    },
  ];

  // Bulk actions
  const bulkActions =
    context === "admin"
      ? [
          {
            label: "Delete Selected",
            variant: "destructive" as const,
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (ids: string[]) => handleBulkDelete(ids),
          },
        ]
      : [
          {
            label: "Delete Selected",
            variant: "destructive" as const,
            icon: <Trash2 className="w-4 h-4" />,
            onClick: (ids: string[]) => {
              setAlert({
                show: true,
                message: `Bulk delete ${ids.length} products - Coming soon`,
                type: "warning",
              });
            },
          },
          {
            label: "Archive Selected",
            variant: "secondary" as const,
            icon: <Archive className="w-4 h-4" />,
            onClick: (ids: string[]) => {
              setAlert({
                show: true,
                message: `Bulk archive ${ids.length} products - Coming soon`,
                type: "warning",
              });
            },
          },
        ];

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl space-y-6">
        {/* Alert */}
        {alert.show && (
          <UnifiedAlert
            variant={alert.type}
            onClose={() => setAlert({ ...alert, show: false })}
          >
            {alert.message}
          </UnifiedAlert>
        )}

        {/* Page Header */}
        <PageHeader
          title="Products"
          description={`Manage ${
            context === "admin" ? "all" : "your"
          } products`}
          breadcrumbs={breadcrumbs}
          badge={{ text: `${stats.total} items`, variant: "primary" }}
          actions={
            createRoute ? (
              <UnifiedButton
                variant="primary"
                icon={<Plus />}
                onClick={() => router.push(createRoute)}
              >
                Add Product
              </UnifiedButton>
            ) : undefined
          }
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <UnifiedCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Package className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-textSecondary">Total Products</p>
                <p className="text-2xl font-bold text-text">{stats.total}</p>
              </div>
            </div>
          </UnifiedCard>

          <UnifiedCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-success/10 rounded-lg">
                <Package className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-textSecondary">Active</p>
                <p className="text-2xl font-bold text-success">
                  {stats.active}
                </p>
              </div>
            </div>
          </UnifiedCard>

          <UnifiedCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-error/10 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-error" />
              </div>
              <div>
                <p className="text-sm text-textSecondary">Out of Stock</p>
                <p className="text-2xl font-bold text-error">
                  {stats.outOfStock}
                </p>
              </div>
            </div>
          </UnifiedCard>

          <UnifiedCard className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-warning/10 rounded-lg">
                <Package className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-textSecondary">Low Stock</p>
                <p className="text-2xl font-bold text-warning">
                  {stats.lowStock}
                </p>
              </div>
            </div>
          </UnifiedCard>
        </div>

        {/* Filters */}
        <UnifiedCard className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    fetchProducts();
                  }
                }}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text placeholder:text-textSecondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="out_of_stock">Out of Stock</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            {context === "admin" && (
              <div className="w-full md:w-48">
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                  className="w-full px-4 py-2.5 bg-surface border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                >
                  <option value="all">All Stock</option>
                  <option value="inStock">In Stock</option>
                  <option value="lowStock">Low Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                </select>
              </div>
            )}
            <UnifiedButton variant="outline" onClick={fetchProducts}>
              Search
            </UnifiedButton>
          </div>
        </UnifiedCard>

        {/* Products Table */}
        <ModernDataTable
          data={products}
          columns={columns}
          loading={loading}
          selectable
          searchable={false}
          bulkActions={bulkActions}
          rowActions={rowActions}
          currentPage={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          emptyMessage="No products found. Try adjusting your filters."
          getRowId={(product) => product.id}
        />

        {/* Delete Confirmation Modal */}
        <UnifiedModal
          open={deleteDialogOpen}
          onClose={() => !deletingProduct && setDeleteDialogOpen(false)}
          title="Delete Product?"
          size="sm"
        >
          <div className="space-y-4">
            <p className="text-textSecondary">
              Are you sure you want to delete "{selectedProduct?.name}"? This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <UnifiedButton
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deletingProduct}
              >
                Cancel
              </UnifiedButton>
              <UnifiedButton
                variant="destructive"
                onClick={handleDeleteConfirm}
                loading={deletingProduct}
              >
                Delete
              </UnifiedButton>
            </div>
          </div>
        </UnifiedModal>
      </div>
    </div>
  );
}

