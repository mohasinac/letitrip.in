"use client";

import React, { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Copy, Archive, Package } from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";
import { SELLER_ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { SellerProduct } from "@/types";
import { apiGet, apiDelete } from "@/lib/api/seller";
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

function ProductsListContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useBreadcrumbTracker([
    {
      label: "Seller",
      href: SELLER_ROUTES.DASHBOARD,
    },
    {
      label: "Products",
      href: SELLER_ROUTES.PRODUCTS,
      active: true,
    },
  ]);

  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(
    null
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState(false);
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning";
  }>({
    show: false,
    message: "",
    type: "success",
  });

  // Fetch products from API
  const fetchProducts = async () => {
    if (!user || authLoading) return;

    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (searchQuery) {
        params.append("search", searchQuery);
      }

      const response = await apiGet<{
        success: boolean;
        data: SellerProduct[];
      }>(
        `/api/seller/products${
          params.toString() ? `?${params.toString()}` : ""
        }`
      );

      if (response.success && response.data) {
        setProducts(response.data);
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

  useEffect(() => {
    if (user && !authLoading) {
      fetchProducts();
    }
  }, [statusFilter, user, authLoading]);

  const handleDeleteClick = (product: SellerProduct) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedProduct) return;

    try {
      setDeletingProduct(true);
      const response = await apiDelete<{ success: boolean; message?: string }>(
        `/api/seller/products/${selectedProduct.id}`
      );

      if (response.success) {
        // Remove from local state
        setProducts(products.filter((p) => p.id !== selectedProduct.id));

        setAlert({
          show: true,
          message: "Product deleted successfully",
          type: "success",
        });

        setSelectedProduct(null);
      }
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
    if (stock === 0)
      return { label: "Out of Stock", variant: "error" as const };
    if (stock <= lowStockThreshold)
      return { label: "Low Stock", variant: "warning" as const };
    return { label: "In Stock", variant: "success" as const };
  };

  // Calculate stats
  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "active").length,
    outOfStock: products.filter((p) => p.quantity === 0).length,
    lowStock: products.filter(
      (p) => p.quantity > 0 && p.quantity <= p.lowStockThreshold
    ).length,
  };

  // Table columns configuration
  const columns: TableColumn<SellerProduct>[] = [
    {
      key: "name",
      label: "Product",
      sortable: true,
      render: (_, product) => (
        <div className="flex items-center gap-3">
          <img
            src={product.images?.[0]?.url || "/placeholder-product.png"}
            alt={product.name}
            className="w-12 h-12 rounded-lg object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-product.png";
            }}
          />
          <div className="min-w-0">
            <p className="font-medium text-text truncate">{product.name}</p>
            <p className="text-xs text-textSecondary truncate">
              {product.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "sku",
      label: "SKU",
      render: (_, product) => (
        <span className="text-sm text-text">{product.sku || "—"}</span>
      ),
    },
    {
      key: "pricing",
      label: "Price",
      align: "right",
      sortable: true,
      render: (_, product) => (
        <div className="text-right">
          <p className="font-semibold text-text">
            ₹{product.price?.toLocaleString() || "0"}
          </p>
          {product.compareAtPrice && (
            <p className="text-xs text-textSecondary line-through">
              ₹{product.compareAtPrice.toLocaleString()}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "inventory",
      label: "Stock",
      sortable: true,
      render: (_, product) => {
        const stockStatus = getStockStatus(
          product.quantity,
          product.lowStockThreshold
        );
        return (
          <div>
            <p className="font-semibold text-text mb-1">{product.quantity}</p>
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
    {
      label: "Edit",
      icon: <Edit className="w-4 h-4" />,
      onClick: (product: SellerProduct) => {
        router.push(SELLER_ROUTES.PRODUCTS_EDIT(product.id));
      },
    },
    {
      label: "Duplicate",
      icon: <Copy className="w-4 h-4" />,
      onClick: (product: SellerProduct) => {
        // TODO: Implement duplicate functionality
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
        // TODO: Implement archive functionality
        setAlert({
          show: true,
          message: "Archive functionality coming soon",
          type: "warning",
        });
      },
    },
    {
      label: "Delete",
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (product: SellerProduct) => handleDeleteClick(product),
    },
  ];

  // Bulk actions
  const bulkActions = [
    {
      label: "Delete Selected",
      variant: "destructive" as const,
      icon: <Trash2 className="w-4 h-4" />,
      onClick: (ids: string[]) => {
        // TODO: Implement bulk delete
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
        // TODO: Implement bulk archive
        setAlert({
          show: true,
          message: `Bulk archive ${ids.length} products - Coming soon`,
          type: "warning",
        });
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
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
        description="Manage your product catalog"
        breadcrumbs={[
          { label: "Seller", href: SELLER_ROUTES.DASHBOARD },
          { label: "Products" },
        ]}
        badge={{ text: `${stats.total} items`, variant: "primary" }}
        actions={
          <UnifiedButton
            variant="primary"
            icon={<Plus />}
            onClick={() => router.push(SELLER_ROUTES.PRODUCTS_NEW)}
          >
            Add Product
          </UnifiedButton>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slideUp">
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
              <p className="text-2xl font-bold text-success">{stats.active}</p>
            </div>
          </div>
        </UnifiedCard>

        <UnifiedCard className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-error/10 rounded-lg">
              <Package className="w-6 h-6 text-error" />
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
        searchable={false} // We have custom search above
        bulkActions={bulkActions}
        rowActions={rowActions}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyMessage="No products found. Start by adding your first product!"
        getRowId={(product) => product.id}
      />

      {/* Delete Confirmation Modal */}
      <UnifiedModal
        open={deleteDialogOpen}
        onClose={() => !deletingProduct && setDeleteDialogOpen(false)}
        title="Delete Product?"
        footer={
          <div className="flex gap-2 justify-end">
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
              {deletingProduct ? "Deleting..." : "Delete"}
            </UnifiedButton>
          </div>
        }
      >
        <p className="text-textSecondary">
          Are you sure you want to delete "{selectedProduct?.name}"? This action
          cannot be undone.
        </p>
      </UnifiedModal>
    </div>
  );
}

export default function ProductsList() {
  return (
    <RoleGuard requiredRole="seller">
      <ProductsListContent />
    </RoleGuard>
  );
}
