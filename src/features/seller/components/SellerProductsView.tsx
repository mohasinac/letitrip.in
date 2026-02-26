/**
 * SellerProductsView
 *
 * Feature view for seller product listing with CRUD actions.
 * Extracted from /seller/products page — Rule 16 (page < 150 lines).
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
  FilterDrawer,
  FilterFacetSection,
  ActiveFilterChips,
} from "@/components";
import type { ActiveFilter, AdminProduct } from "@/components";
import { Store } from "lucide-react";
import { useAuth, useMessage, useUrlTable } from "@/hooks";
import { ROUTES, THEME_CONSTANTS, SUCCESS_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useSellerProducts } from "../hooks";
import { SellerProductCard } from "./SellerProductCard";

const { input } = THEME_CONSTANTS;

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

function SellerProductsContent() {
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
    defaults: { pageSize: "25", sort: "-createdAt" },
  });
  const statusParam = table.get("status");
  const page = table.getNumber("page", 1);

  const [drawerMode, setDrawerMode] = useState<"create" | "edit" | null>(null);
  const [formProduct, setFormProduct] =
    useState<Partial<AdminProduct>>(DEFAULT_PRODUCT);
  const [deleteTarget, setDeleteTarget] = useState<AdminProduct | null>(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  const {
    data,
    isLoading,
    refetch,
    deleteMutation,
    createMutation,
    updateMutation,
  } = useSellerProducts(user?.uid, table);

  useEffect(() => {
    if (!authLoading && !user) router.push(ROUTES.AUTH.LOGIN);
  }, [user, authLoading, router]);

  const openCreate = () => {
    setFormProduct(DEFAULT_PRODUCT);
    setIsFormDirty(false);
    setDrawerMode("create");
  };
  const openEdit = (p: AdminProduct) => {
    setFormProduct({ ...p });
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
      showError(t("titleRequired"));
      return;
    }
    try {
      if (drawerMode === "create") {
        await createMutation.mutate(formProduct);
      } else {
        await updateMutation.mutate(
          formProduct as Partial<AdminProduct> & { id: string },
        );
      }
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (authLoading)
    return (
      <div className="flex items-center justify-center py-16">
        <Spinner size="xl" variant="primary" />
      </div>
    );
  if (!user) return null;

  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.total ?? 0;
  const isSaving = createMutation.isLoading || updateMutation.isLoading;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        subtitle={t("subtitle")}
        actionLabel={t("addProduct")}
        onAction={openCreate}
      />

      <div className="flex flex-wrap items-center gap-2">
        <AdminFilterBar withCard={false} columns={2}>
          <input
            type="search"
            value={table.get("q")}
            onChange={(e) => table.set("q", e.target.value)}
            placeholder={t("searchPlaceholder")}
            className={input.base}
          />
          <select
            value={table.get("sort") || "-createdAt"}
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
            <SellerProductCard
              product={product}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          )}
        />
      )}

      {totalPages > 1 && (
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          pageSize={25}
          total={totalItems}
          onPageChange={table.setPage}
          isLoading={isLoading}
        />
      )}

      <SideDrawer
        isOpen={drawerMode !== null}
        onClose={closeDrawer}
        title={drawerMode === "create" ? t("createProduct") : t("editProduct")}
        mode={drawerMode ?? "view"}
        isDirty={isFormDirty}
        footer={
          <div className="flex gap-3 justify-end">
            <button
              onClick={closeDrawer}
              className={`px-4 py-2 rounded-lg text-sm border ${THEME_CONSTANTS.themed.border} ${THEME_CONSTANTS.themed.textPrimary} ${THEME_CONSTANTS.themed.bgPrimary}`}
            >
              {tActions("cancel")}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSaving ? tLoading("default") : tActions("save")}
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

export function SellerProductsView() {
  return (
    <Suspense>
      <SellerProductsContent />
    </Suspense>
  );
}
