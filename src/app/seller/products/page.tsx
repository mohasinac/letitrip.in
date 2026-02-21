/**
 * Seller Products Page
 *
 * Route: /seller/products
 * Lists all products belonging to the current seller with CRUD actions.
 */

"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Spinner,
  DataTable,
  AdminPageHeader,
  AdminFilterBar,
  TablePagination,
  SideDrawer,
  ConfirmDeleteModal,
  ProductForm,
  getProductTableColumns,
  EmptyState,
  Badge,
} from "@/components";
import { Store } from "lucide-react";
import type { AdminProduct } from "@/components";
import {
  useAuth,
  useApiQuery,
  useApiMutation,
  useMessage,
  useUrlTable,
} from "@/hooks";
import {
  UI_LABELS,
  ROUTES,
  API_ENDPOINTS,
  THEME_CONSTANTS,
  SUCCESS_MESSAGES,
} from "@/constants";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/utils";

const { input, themed } = THEME_CONSTANTS;
const LABELS = UI_LABELS.ADMIN.PRODUCTS;
const SELLER_LABELS = UI_LABELS.SELLER_PAGE;

const PAGE_SIZE = 25;

const DEFAULT_PRODUCT: Partial<AdminProduct> = {
  title: "",
  description: "",
  category: "",
  subcategory: "",
  brand: "",
  price: 0,
  stockQuantity: 0,
  currency: "INR",
  status: "draft",
  featured: false,
  isAuction: false,
  isPromoted: false,
  tags: [],
  images: [],
  mainImage: "",
  shippingInfo: "",
  returnPolicy: "",
};

export default function SellerProductsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useMessage();

  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: "-createdAt" },
  });
  const searchParam = table.get("q");
  const sortParam = table.get("sort") || "-createdAt";
  const page = table.getNumber("page", 1);

  // Drawer state
  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(null);
  const [formProduct, setFormProduct] =
    useState<Partial<AdminProduct>>(DEFAULT_PRODUCT);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(ROUTES.AUTH.LOGIN);
    }
  }, [user, authLoading, router]);

  const productsUrl = useMemo(() => {
    if (!user?.uid) return null;
    const filtersArr = [`sellerId==${user.uid}`];
    if (searchParam) filtersArr.push(`title@=*${searchParam}`);
    const params = new URLSearchParams({
      filters: filtersArr.join(","),
      pageSize: String(PAGE_SIZE),
      page: String(page),
      sorts: sortParam,
    });
    return `${API_ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`;
  }, [user?.uid, searchParam, page, sortParam]);

  const { data, isLoading, refetch } = useApiQuery<{
    data: AdminProduct[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }>({
    queryKey: [
      "seller-products-list",
      table.params.toString(),
      user?.uid ?? "",
    ],
    queryFn: () => fetch(productsUrl!).then((r) => r.json()),
    enabled: !!productsUrl,
  });

  const deleteMutation = useApiMutation<void, string>({
    mutationFn: (id) => apiClient.delete(API_ENDPOINTS.PRODUCTS.DELETE(id)),
  });

  const saveMutation = useApiMutation<void, Partial<AdminProduct>>({
    mutationFn: (product) =>
      drawerMode === "create"
        ? apiClient.post(API_ENDPOINTS.PRODUCTS.CREATE, product)
        : apiClient.patch(API_ENDPOINTS.PRODUCTS.UPDATE(product.id!), product),
  });

  const openCreate = () => {
    setFormProduct(DEFAULT_PRODUCT);
    setIsFormDirty(false);
    setDrawerMode("create");
  };

  const openEdit = (product: AdminProduct) => {
    setFormProduct({ ...product });
    setIsFormDirty(false);
    setDrawerMode("edit");
  };

  const closeDrawer = () => {
    setDrawerMode(null);
    setFormProduct(DEFAULT_PRODUCT);
    setIsFormDirty(false);
  };

  const handleSave = async () => {
    if (!formProduct.title?.trim()) {
      showError("Title is required");
      return;
    }
    try {
      await saveMutation.mutate(formProduct);
      showSuccess(
        drawerMode === "create"
          ? SUCCESS_MESSAGES.PRODUCT.CREATED
          : SUCCESS_MESSAGES.PRODUCT.UPDATED,
      );
      closeDrawer();
      refetch();
    } catch {
      showError(LABELS.SAVE_FAILED);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutate(deleteTarget.id);
      showSuccess(SUCCESS_MESSAGES.PRODUCT.DELETED);
      setDeleteTarget(null);
      refetch();
    } catch {
      showError(LABELS.DELETE_FAILED);
    }
  };

  const { columns, actions } = useMemo(
    () => getProductTableColumns(openEdit, (p) => setDeleteTarget(p)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
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
  const meta = data?.meta;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={SELLER_LABELS.PRODUCTS_TITLE}
        subtitle={SELLER_LABELS.PRODUCTS_SUBTITLE}
        actionLabel={SELLER_LABELS.ADD_PRODUCT}
        onAction={openCreate}
      />

      {/* Filter bar */}
      <AdminFilterBar withCard={false} columns={2}>
        <input
          type="search"
          value={searchParam}
          onChange={(e) => table.set("q", e.target.value)}
          placeholder={LABELS.SEARCH_PLACEHOLDER}
          className={input.base}
        />
        <select
          value={sortParam}
          onChange={(e) => table.setSort(e.target.value)}
          className={input.base}
        >
          <option value="-createdAt">Newest First</option>
          <option value="createdAt">Oldest First</option>
          <option value="title">Title A–Z</option>
          <option value="-price">Price High–Low</option>
          <option value="price">Price Low–High</option>
        </select>
      </AdminFilterBar>

      {!isLoading && products.length === 0 ? (
        <EmptyState
          icon={<Store className="w-16 h-16" />}
          title={searchParam ? LABELS.NO_PRODUCTS : SELLER_LABELS.NO_PRODUCTS}
          description={
            searchParam
              ? SELLER_LABELS.NO_PRODUCTS_SUBTITLE
              : SELLER_LABELS.NO_PRODUCTS_SUBTITLE
          }
          actionLabel={SELLER_LABELS.ADD_PRODUCT}
          onAction={openCreate}
        />
      ) : (
        <DataTable<AdminProduct>
          data={products}
          columns={columns}
          keyExtractor={(p) => p.id}
          loading={isLoading}
          actions={actions}
          emptyTitle={LABELS.NO_PRODUCTS}
          emptyMessage={SELLER_LABELS.NO_PRODUCTS_SUBTITLE}
          externalPagination
          showViewToggle
          viewMode={(table.get("view") || "table") as "table" | "grid" | "list"}
          onViewModeChange={(mode) => table.set("view", mode)}
          mobileCardRender={(product) => (
            <div
              className={`rounded-xl overflow-hidden border ${themed.border} ${themed.bgPrimary} h-full`}
            >
              {product.mainImage ? (
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <img
                    src={product.mainImage}
                    alt={product.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <span className={`text-3xl ${THEME_CONSTANTS.icon.muted}`}>
                    📦
                  </span>
                </div>
              )}
              <div className="p-3 space-y-2">
                <p
                  className={`text-sm font-semibold truncate ${themed.textPrimary}`}
                >
                  {product.title}
                </p>
                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm font-bold ${themed.textPrimary}`}>
                    {formatCurrency(product.price)}
                  </p>
                  <Badge
                    variant={
                      product.status === "published"
                        ? "success"
                        : product.status === "out_of_stock"
                          ? "warning"
                          : "default"
                    }
                    className="text-xs capitalize"
                  >
                    {product.status.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => openEdit(product)}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-indigo-500 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                  >
                    {UI_LABELS.ACTIONS.EDIT}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(product)}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    {UI_LABELS.ACTIONS.DELETE}
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      )}

      {(meta?.totalPages ?? 1) > 1 && (
        <TablePagination
          currentPage={page}
          totalPages={meta?.totalPages ?? 1}
          pageSize={PAGE_SIZE}
          total={meta?.total ?? 0}
          onPageChange={table.setPage}
          isLoading={isLoading}
        />
      )}

      {/* Create / Edit Drawer */}
      <SideDrawer
        isOpen={drawerMode !== null}
        onClose={closeDrawer}
        title={
          drawerMode === "create" ? LABELS.CREATE_PRODUCT : LABELS.EDIT_PRODUCT
        }
        mode={drawerMode ?? "view"}
        isDirty={isFormDirty}
        footer={
          <div className={`flex gap-3 justify-end`}>
            <button
              onClick={closeDrawer}
              className={`px-4 py-2 rounded-lg text-sm border ${themed.border} ${themed.textPrimary} ${themed.bgPrimary}`}
            >
              {UI_LABELS.ACTIONS.CANCEL}
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saveMutation.isLoading
                ? UI_LABELS.LOADING.DEFAULT
                : UI_LABELS.ACTIONS.SAVE}
            </button>
          </div>
        }
      >
        <ProductForm
          product={formProduct}
          onChange={(updated) => {
            setFormProduct(updated);
            setIsFormDirty(true);
          }}
        />
      </SideDrawer>

      {/* Delete confirmation */}
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
