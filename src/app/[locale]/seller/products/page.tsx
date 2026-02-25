/**
 * Seller Products Page
 *
 * Route: /seller/products
 * Lists all products belonging to the current seller with CRUD actions.
 */

"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
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
  FilterDrawer,
  FilterFacetSection,
  ActiveFilterChips,
} from "@/components";
import type { ActiveFilter } from "@/components";
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
  ROUTES,
  API_ENDPOINTS,
  THEME_CONSTANTS,
  SUCCESS_MESSAGES,
} from "@/constants";
import { useTranslations } from "next-intl";
import { apiClient } from "@/lib/api-client";
import { formatCurrency } from "@/utils";

const { input, themed } = THEME_CONSTANTS;

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

function SellerProductsPageContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showSuccess, showError } = useMessage();
  const t = useTranslations("sellerProducts");
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");
  const STATUS_OPTIONS = [
    { value: "published", label: t("statusPublished") },
    { value: "draft", label: t("statusDraft") },
    { value: "out_of_stock", label: t("statusOutOfStock") },
    { value: "archived", label: t("statusArchived") },
  ];

  const table = useUrlTable({
    defaults: { pageSize: String(PAGE_SIZE), sort: "-createdAt" },
  });
  const searchParam = table.get("q");
  const sortParam = table.get("sort") || "-createdAt";
  const statusParam = table.get("status");
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
    if (statusParam) filtersArr.push(`status==${statusParam}`);
    const params = new URLSearchParams({
      filters: filtersArr.join(","),
      pageSize: String(PAGE_SIZE),
      page: String(page),
      sorts: sortParam,
    });
    return `${API_ENDPOINTS.PRODUCTS.LIST}?${params.toString()}`;
  }, [user?.uid, searchParam, page, sortParam, statusParam]);

  const { data, isLoading, refetch } = useApiQuery<{
    items: AdminProduct[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  }>({
    queryKey: [
      "seller-products-list",
      table.params.toString(),
      user?.uid ?? "",
    ],
    queryFn: () => apiClient.get(productsUrl!),
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
      showError(t("saveFailed"));
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
      showError(t("deleteFailed"));
    }
  };

  const { columns, actions } = useMemo(
    () => getProductTableColumns(openEdit, (p) => setDeleteTarget(p)),

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

  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.total ?? 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actionLabel={t("addProduct")}
        onAction={openCreate}
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <AdminFilterBar withCard={false} columns={2}>
          <input
            type="search"
            value={searchParam}
            onChange={(e) => table.set("q", e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={input.base}
          />
          <select
            value={sortParam}
            onChange={(e) => table.setSort(e.target.value)}
            className={input.base}
          >
            <option value="-createdAt">{t("sortNewest")}</option>
            <option value="createdAt">{t("sortOldest")}</option>
            <option value="title">{t("sortTitleAZ")}</option>
            <option value="-price">{t("sortPriceHighLow")}</option>
            <option value="price">{t("sortPriceLowHigh")}</option>
          </select>
        </AdminFilterBar>
        <FilterDrawer
          activeCount={statusParam ? 1 : 0}
          onClearAll={() => table.set("status", "")}
        >
          <FilterFacetSection
            title={t("filterStatusTitle")}
            options={STATUS_OPTIONS}
            selected={statusParam ? [statusParam] : []}
            onChange={(vals) => table.set("status", vals[0] ?? "")}
            searchable={false}
          />
        </FilterDrawer>
      </div>

      {statusParam && (
        <ActiveFilterChips
          filters={
            [
              {
                key: "status",
                label: "Status",
                value:
                  STATUS_OPTIONS.find((o) => o.value === statusParam)?.label ??
                  statusParam,
              },
            ] satisfies ActiveFilter[]
          }
          onRemove={() => table.set("status", "")}
          onClearAll={() => table.set("status", "")}
        />
      )}

      {!isLoading && products.length === 0 ? (
        <EmptyState
          icon={<Store className="w-16 h-16" />}
          title={t("noProducts")}
          description={t("noProductsSubtitle")}
          actionLabel={t("addProduct")}
          onAction={openCreate}
        />
      ) : (
        <DataTable<AdminProduct>
          data={products}
          columns={columns}
          keyExtractor={(p) => p.id}
          loading={isLoading}
          actions={actions}
          emptyTitle={t("noProducts")}
          emptyMessage={t("noProductsSubtitle")}
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
                    ??
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
                    {tActions("edit")}
                  </button>
                  <button
                    onClick={() => setDeleteTarget(product)}
                    className="flex-1 text-xs py-1.5 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    {tActions("delete")}
                  </button>
                </div>
              </div>
            </div>
          )}
        />
      )}

      {(totalPages ?? 1) > 1 && (
        <TablePagination
          currentPage={page}
          totalPages={totalPages ?? 1}
          pageSize={PAGE_SIZE}
          total={totalItems ?? 0}
          onPageChange={table.setPage}
          isLoading={isLoading}
        />
      )}

      {/* Create / Edit Drawer */}
      <SideDrawer
        isOpen={drawerMode !== null}
        onClose={closeDrawer}
        title={drawerMode === "create" ? t("createProduct") : t("editProduct")}
        mode={drawerMode ?? "view"}
        isDirty={isFormDirty}
        footer={
          <div className={`flex gap-3 justify-end`}>
            <button
              onClick={closeDrawer}
              className={`px-4 py-2 rounded-lg text-sm border ${themed.border} ${themed.textPrimary} ${themed.bgPrimary}`}
            >
              {tActions("cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={saveMutation.isLoading}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {saveMutation.isLoading ? tLoading("default") : tActions("save")}
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
          title={t("deleteProduct")}
          message={t("deleteListingConfirm")}
          isDeleting={deleteMutation.isLoading}
        />
      )}
    </div>
  );
}

export default function SellerProductsPage() {
  return (
    <Suspense>
      <SellerProductsPageContent />
    </Suspense>
  );
}
