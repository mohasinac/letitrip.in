/**
 * SellerProductsView
 *
 * Feature view for seller product listing with CRUD actions.
 * Extracted from /seller/products page — Rule 16 (page < 150 lines).
 *
 * Uses ListingLayout for a unified listing shell.
 */

"use client";

import { Suspense, useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import { usePendingTable } from "@mohasinac/appkit/react";
import { SellerProductsView as AppkitSellerProductsView } from "@mohasinac/appkit/features/seller";
import {
  Spinner,
  Button,
  DataTable,
  AdminPageHeader,
  TablePagination,
  SideDrawer,
  ConfirmDeleteModal,
  ProductForm,
  useProductTableColumns,
  EmptyState,
  ActiveFilterChips,
  ListingLayout,
  Search,
  SortDropdown,
  ProductFilters,
  getFilterLabel,
} from "@/components";
import type { ActiveFilter, AdminProduct } from "@/components";
import { Store } from "lucide-react";
import { useAuth, useMessage, useUrlTable, useCategories } from "@/hooks";
import { ROUTES, THEME_CONSTANTS, SUCCESS_MESSAGES } from "@/constants";
import { useTranslations } from "next-intl";
import { useSellerProducts } from "../hooks";
import { SellerProductCard } from "./SellerProductCard";

const { flex } = THEME_CONSTANTS;

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

  const STATUS_OPTIONS = useMemo(
    () => [
      { value: "published", label: t("statusPublished") },
      { value: "draft", label: t("statusDraft") },
      { value: "out_of_stock", label: t("statusOutOfStock") },
      { value: "archived", label: t("statusArchived") },
    ],
    [t],
  );

  const SORT_OPTIONS = useMemo(
    () => [
      { value: "-createdAt", label: t("sortNewest") },
      { value: "createdAt", label: t("sortOldest") },
      { value: "title", label: t("sortTitleAZ") },
      { value: "-price", label: t("sortPriceHighLow") },
      { value: "price", label: t("sortPriceLowHigh") },
    ],
    [t],
  );

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
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // ── Filter state (pending until Apply) ─────────────────────────────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, [
      "status",
      "category",
      "condition",
      "minPrice",
      "maxPrice",
    ]);
  const { categories } = useCategories();
  const categoryOptions = categories.map((c) => ({
    value: c.id,
    label: c.name,
  }));

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
        await createMutation.mutateAsync(formProduct);
      } else {
        await updateMutation.mutateAsync(
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
      await deleteMutation.mutateAsync(deleteTarget.id);
      showSuccess(SUCCESS_MESSAGES.PRODUCT.DELETED);
      setDeleteTarget(null);
      refetch();
    } catch {
      showError(t("deleteFailed"));
    }
  };

  // ── Bulk action handlers ─────────────────────────────────────────
  const handleBulkDelete = useCallback(async () => {
    const results = await Promise.allSettled(
      selectedIds.map((id) => deleteMutation.mutateAsync(id)),
    );
    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    if (succeeded === selectedIds.length) {
      showSuccess(tActions("bulkSuccess", { count: succeeded }));
    } else if (succeeded > 0) {
      showError(
        tActions("bulkPartialSuccess", {
          success: succeeded,
          total: selectedIds.length,
        }),
      );
    } else {
      showError(tActions("bulkFailed"));
    }
    setSelectedIds([]);
    refetch();
  }, [selectedIds, deleteMutation, refetch, showSuccess, showError, tActions]);

  const handleBulkStatusChange = useCallback(
    async (status: string) => {
      const results = await Promise.allSettled(
        selectedIds.map((id) =>
          updateMutation.mutateAsync({ id, status } as Partial<AdminProduct> & {
            id: string;
          }),
        ),
      );
      const succeeded = results.filter((r) => r.status === "fulfilled").length;
      if (succeeded === selectedIds.length) {
        showSuccess(tActions("bulkSuccess", { count: succeeded }));
      } else if (succeeded > 0) {
        showError(
          tActions("bulkPartialSuccess", {
            success: succeeded,
            total: selectedIds.length,
          }),
        );
      } else {
        showError(tActions("bulkFailed"));
      }
      setSelectedIds([]);
      refetch();
    },
    [selectedIds, updateMutation, refetch, showSuccess, showError, tActions],
  );

  const { columns, actions } = useProductTableColumns(openEdit, (p) =>
    setDeleteTarget(p),
  );

  if (authLoading)
    return (
      <div className={`${flex.center} py-16`}>
        <Spinner size="xl" variant="primary" />
      </div>
    );
  if (!user) return null;

  const products = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;
  const totalItems = data?.total ?? 0;
  const isSaving = createMutation.isPending || updateMutation.isPending;

  // ── Active filter chips ──────────────────────────────────────────────
  const activeFiltersSlot = statusParam ? (
    <ActiveFilterChips
      filters={
        [
          {
            key: "status",
            label: "Status",
            value: getFilterLabel(STATUS_OPTIONS, statusParam) ?? statusParam,
          },
        ] satisfies ActiveFilter[]
      }
      onRemove={() => table.set("status", "")}
      onClearAll={() => table.set("status", "")}
    />
  ) : undefined;

  return (
    <AppkitSellerProductsView
      labels={{
        title: t("title"),
        addButton: t("addProduct"),
        emptyText: t("noProducts"),
      }}
      total={totalItems}
      isLoading={isLoading}
      renderTable={(_selected, _onSelectionChange, loading) => (
        <ListingLayout
          headerSlot={
            <AdminPageHeader
              title={t("title")}
              subtitle={t("subtitle")}
              actionLabel={t("addProduct")}
              onAction={openCreate}
            />
          }
          searchSlot={
            <Search
              value={table.get("q")}
              onChange={(v) => table.set("q", v)}
              placeholder={t("searchPlaceholder")}
            />
          }
          sortSlot={
            <SortDropdown
              value={table.get("sort") || "-createdAt"}
              onChange={(v) => table.setSort(v)}
              options={SORT_OPTIONS}
            />
          }
          filterContent={
            <ProductFilters
              table={pendingTable}
              showStatus
              categoryOptions={categoryOptions}
            />
          }
          filterActiveCount={filterActiveCount}
          onFilterApply={onFilterApply}
          onFilterClear={onFilterClear}
          activeFiltersSlot={activeFiltersSlot}
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActionItems={[
            {
              id: "bulk-publish",
              label: tActions("bulkPublish", { count: selectedIds.length }),
              variant: "primary",
              onClick: () => handleBulkStatusChange("published"),
            },
            {
              id: "bulk-archive",
              label: tActions("bulkArchive", { count: selectedIds.length }),
              variant: "outline",
              onClick: () => handleBulkStatusChange("archived"),
            },
            {
              id: "bulk-delete",
              label: tActions("bulkDelete", { count: selectedIds.length }),
              variant: "danger",
              onClick: handleBulkDelete,
            },
          ]}
        >
          {!loading && products.length === 0 ? (
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
              loading={loading}
              actions={actions}
              selectable
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              emptyTitle={t("noProducts")}
              emptyMessage={t("noProductsSubtitle")}
              externalPagination
              showViewToggle
              viewMode={
                (table.get("view") || "table") as "table" | "grid" | "list"
              }
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
        </ListingLayout>
      )}
      renderPagination={() => (
        <TablePagination
          currentPage={page}
          pageSize={table.getNumber("pageSize", 25)}
          total={totalItems}
          totalPages={totalPages}
          onPageChange={(nextPage) => table.setPage(nextPage)}
          onPageSizeChange={(size) => table.set("pageSize", String(size))}
        />
      )}
      renderModal={() => (
        <>
          <SideDrawer
            isOpen={drawerMode !== null}
            onClose={closeDrawer}
            title={
              drawerMode === "create" ? t("createProduct") : t("editProduct")
            }
            mode={drawerMode ?? "view"}
            isDirty={isFormDirty}
            footer={
              <div className="flex gap-3 justify-start">
                <Button variant="outline" onClick={closeDrawer}>
                  {tActions("cancel")}
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSave}
                  isLoading={isSaving}
                >
                  {tActions("save")}
                </Button>
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
              isDeleting={deleteMutation.isPending}
            />
          )}
        </>
      )}
    />
  );
}

export function SellerProductsView() {
  return (
    <Suspense>
      <SellerProductsContent />
    </Suspense>
  );
}
