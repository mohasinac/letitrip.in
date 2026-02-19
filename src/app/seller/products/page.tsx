/**
 * Seller Products Page
 *
 * Route: /seller/products
 * Lists all products belonging to the current seller with CRUD actions.
 */

"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Spinner,
  DataTable,
  AdminPageHeader,
  ConfirmDeleteModal,
  getProductTableColumns,
} from "@/components";
import type { AdminProduct } from "@/components";
import { useAuth, useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { UI_LABELS, ROUTES, API_ENDPOINTS } from "@/constants";
import { apiClient } from "@/lib/api-client";

interface ProductsResponse {
  data: AdminProduct[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

const LABELS = UI_LABELS.ADMIN.PRODUCTS;
const SELLER_LABELS = UI_LABELS.SELLER_PAGE;

export default function SellerProductsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useMessage();

  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router]);

  // Fetch seller's own products
  const productsUrl = useMemo(() => {
    if (!user?.uid) return null;
    const filters = encodeURIComponent(`sellerId==${user.uid}`);
    return `${API_ENDPOINTS.PRODUCTS.LIST}?filters=${filters}&pageSize=100&sorts=-createdAt`;
  }, [user?.uid]);

  const { data, isLoading, refetch } = useApiQuery<ProductsResponse>({
    queryKey: ["seller-products-list", user?.uid ?? ""],
    queryFn: () => fetch(productsUrl!).then((r) => r.json()),
    enabled: !!productsUrl,
  });

  const deleteMutation = useApiMutation<void, string>({
    mutationFn: (id) => apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id)),
  });

  const handleEdit = useCallback(
    (product: AdminProduct) => {
      router.push(ROUTES.SELLER.PRODUCTS_EDIT(product.id));
    },
    [router],
  );

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutate(deleteTarget.id);
      showSuccess(UI_LABELS.ACTIONS.DELETE + " successful");
      setDeleteTarget(null);
      refetch();
    } catch {
      showError(LABELS.DELETE_FAILED);
    }
  }, [deleteTarget, deleteMutation, showSuccess, showError, refetch]);

  const { columns, actions } = useMemo(
    () => getProductTableColumns(handleEdit, (p) => setDeleteTarget(p)),
    [handleEdit],
  );

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  }

  if (!user) return null;

  const products = data?.data ?? [];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={SELLER_LABELS.PRODUCTS_TITLE}
        subtitle={SELLER_LABELS.PRODUCTS_SUBTITLE}
        actionLabel={SELLER_LABELS.ADD_PRODUCT}
        onAction={() => router.push(ROUTES.SELLER.PRODUCTS_NEW)}
      />

      <DataTable<AdminProduct>
        data={products}
        columns={columns}
        keyExtractor={(p) => p.id}
        loading={isLoading}
        actions={actions}
        emptyTitle={LABELS.NO_PRODUCTS}
        emptyMessage={SELLER_LABELS.NO_PRODUCTS_SUBTITLE}
      />

      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onConfirm={handleDeleteConfirm}
          title={LABELS.DELETE_PRODUCT}
          message={SELLER_LABELS.DELETE_LISTING_CONFIRM}
          isDeleting={deleteMutation.isLoading}
        />
      )}
    </div>
  );
}
