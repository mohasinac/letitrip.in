/**
 * AdminProductsView
 *
 * Contains all product management state, mutations, drawer logic, and JSX.
 * Consumed by /admin/products/[[...action]]/page.tsx.
 *
 * Uses ListingLayout for a unified listing shell matching the standard wireframe.
 */

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { useMessage, useUrlTable } from "@/hooks";
import { useAdminProducts } from "@/features/admin/hooks";
import { ROUTES } from "@/constants";
import { useTranslations } from "next-intl";
import {
  AdminPageHeader,
  Button,
  Caption,
  Card,
  DataTable,
  DrawerFormFooter,
  FilterFacetSection,
  ListingLayout,
  MediaImage,
  ProductForm,
  Search,
  SideDrawer,
  StatusBadge,
  TablePagination,
  Text,
  useProductTableColumns,
} from "@/components";
import { formatCurrency } from "@/utils";
import type { AdminProduct, ProductDrawerMode } from "@/components";

interface AdminProductsViewProps {
  action?: string[];
}

export function AdminProductsView({ action }: AdminProductsViewProps) {
  const router = useRouter();
  const t = useTranslations("adminProducts");
  const tActions = useTranslations("actions");
  const tStatus = useTranslations("status");
  const { showError } = useMessage();
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt" },
  });
  const searchTerm = table.get("q");
  const statusFilter = table.get("status");

  // ── Staged filter state (applied on button click, not live) ─────────
  const [stagedStatus, setStagedStatus] = useState<string[]>(
    statusFilter ? [statusFilter] : [],
  );

  // Sync staged state when URL changes externally (back/forward nav)
  useEffect(() => {
    setStagedStatus(statusFilter ? [statusFilter] : []);
  }, [statusFilter]);

  const handleFilterApply = useCallback(() => {
    table.setMany({
      status: stagedStatus[0] ?? "",
      page: "1",
    });
  }, [stagedStatus, table]);

  const handleFilterClear = useCallback(() => {
    setStagedStatus([]);
    table.setMany({ status: "", page: "1" });
  }, [table]);

  const filterActiveCount = statusFilter ? 1 : 0;

  // ── Data fetching ───────────────────────────────────────────────────
  const filtersArr: string[] = [];
  if (searchTerm) filtersArr.push(`title@=*${searchTerm}`);
  if (statusFilter) filtersArr.push(`status==${statusFilter}`);

  const {
    data,
    isLoading,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAdminProducts(table.buildSieveParams(filtersArr.join(",")));

  const [editingProduct, setEditingProduct] =
    useState<Partial<AdminProduct> | null>(null);
  const [drawerMode, setDrawerMode] = useState<ProductDrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const initialFormRef = useRef<string>("");

  const products = data?.products || [];

  const isDirty = useMemo(() => {
    if (!editingProduct || drawerMode === "delete") return false;
    return JSON.stringify(editingProduct) !== initialFormRef.current;
  }, [editingProduct, drawerMode]);

  const findProductById = useCallback(
    (id: string): AdminProduct | undefined => products.find((p) => p.id === id),
    [products],
  );

  const handleCreate = useCallback(() => {
    const newProduct: Partial<AdminProduct> = {
      title: "",
      description: "",
      category: "",
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
      sellerId: "",
      sellerName: "",
      sellerEmail: "",
    };
    setEditingProduct(newProduct);
    initialFormRef.current = JSON.stringify(newProduct);
    setDrawerMode("create");
    setIsDrawerOpen(true);
    if (action?.[0] !== "add") {
      router.push(`${ROUTES.ADMIN.PRODUCTS}/add`);
    }
  }, [action, router]);

  const handleEdit = useCallback(
    (product: AdminProduct) => {
      setEditingProduct(product);
      initialFormRef.current = JSON.stringify(product);
      setDrawerMode("edit");
      setIsDrawerOpen(true);
      if (product.id && action?.[0] !== "edit") {
        router.push(`${ROUTES.ADMIN.PRODUCTS}/edit/${product.id}`);
      }
    },
    [action, router],
  );

  const handleDeleteDrawer = useCallback(
    (product: AdminProduct) => {
      setEditingProduct(product);
      initialFormRef.current = JSON.stringify(product);
      setDrawerMode("delete");
      setIsDrawerOpen(true);
      if (product.id && action?.[0] !== "delete") {
        router.push(`${ROUTES.ADMIN.PRODUCTS}/delete/${product.id}`);
      }
    },
    [action, router],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setEditingProduct(null);
      setDrawerMode(null);
    }, 300);
    if (action?.[0]) {
      router.replace(ROUTES.ADMIN.PRODUCTS);
    }
  }, [action, router]);

  useEffect(() => {
    if (!action?.[0] || isDrawerOpen) return;
    const mode = action[0];
    const id = action[1];
    if (mode === "add") {
      handleCreate();
    } else if (
      (mode === "edit" || mode === "delete") &&
      id &&
      products.length > 0
    ) {
      const product = findProductById(id);
      if (product) {
        mode === "edit" ? handleEdit(product) : handleDeleteDrawer(product);
      } else {
        router.replace(ROUTES.ADMIN.PRODUCTS);
      }
    }
  }, [
    action,
    products,
    findProductById,
    isDrawerOpen,
    handleCreate,
    handleEdit,
    handleDeleteDrawer,
    router,
  ]);

  const handleSave = async () => {
    if (!editingProduct) return;
    try {
      if (drawerMode === "create") {
        await createMutation.mutate(editingProduct);
      } else {
        await updateMutation.mutate({
          id: editingProduct.id!,
          data: editingProduct,
        });
      }
      await refetch();
      handleCloseDrawer();
    } catch {
      showError(t("saveFailed"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingProduct?.id) return;
    try {
      await deleteMutation.mutate(editingProduct.id);
      await refetch();
      handleCloseDrawer();
    } catch {
      showError(t("deleteFailed"));
    }
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? t("createProduct")
      : drawerMode === "delete"
        ? t("deleteProduct")
        : t("editProduct");

  const { columns, actions } = useProductTableColumns(
    handleEdit,
    handleDeleteDrawer,
  );

  const drawerFooter =
    drawerMode === "delete" ? (
      <DrawerFormFooter
        onCancel={handleCloseDrawer}
        onSubmit={handleConfirmDelete}
        submitLabel={tActions("delete")}
      />
    ) : (
      <DrawerFormFooter onCancel={handleCloseDrawer} onSubmit={handleSave} />
    );

  // ── Status filter options for FilterFacetSection ─────────────────────
  const statusOptions = useMemo(
    () => [
      { value: "draft", label: tStatus("draft") },
      { value: "published", label: tStatus("published") },
      { value: "archived", label: tStatus("archived") },
    ],
    [tStatus],
  );

  return (
    <>
      <ListingLayout
        headerSlot={
          <AdminPageHeader
            title={t("title")}
            subtitle={t("subtitle")}
            actionLabel={t("createProduct")}
            onAction={handleCreate}
          />
        }
        searchSlot={
          <Search
            value={searchTerm}
            onChange={(v) => table.set("q", v)}
            placeholder={t("searchPlaceholder")}
          />
        }
        filterContent={
          <FilterFacetSection
            title={t("formStatus")}
            options={statusOptions}
            selected={stagedStatus}
            onChange={setStagedStatus}
            searchable={false}
          />
        }
        filterActiveCount={filterActiveCount}
        onFilterApply={handleFilterApply}
        onFilterClear={handleFilterClear}
        loading={isLoading}
        errorSlot={
          error ? (
            <Card>
              <div className="text-center py-8">
                <Text variant="error" className="mb-4">
                  {error.message}
                </Text>
                <Button onClick={() => refetch()}>{tActions("retry")}</Button>
              </div>
            </Card>
          ) : undefined
        }
        paginationSlot={
          <TablePagination
            currentPage={data?.meta?.page ?? 1}
            totalPages={data?.meta?.totalPages ?? 1}
            pageSize={table.getNumber("pageSize", 25)}
            total={data?.meta?.total ?? 0}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
          />
        }
      >
        <DataTable
          data={products}
          columns={columns}
          keyExtractor={(product) => product.id}
          onRowClick={handleEdit}
          actions={actions}
          externalPagination
          showViewToggle
          viewMode={
            (table.get("view") || "table") as "table" | "grid" | "list"
          }
          onViewModeChange={(mode) => table.set("view", mode)}
          mobileCardRender={(product) => (
            <Card
              className="overflow-hidden cursor-pointer"
              onClick={() => handleEdit(product)}
            >
              <div className="relative aspect-square overflow-hidden bg-gray-100 dark:bg-gray-800">
                <MediaImage
                  src={product.mainImage}
                  alt={product.title}
                  size="card"
                />
              </div>
              <div className="p-3 space-y-1">
                <Text weight="medium" size="sm" className="line-clamp-2">
                  {product.title}
                </Text>
                <div className="flex items-center justify-between gap-1">
                  <StatusBadge status={product.status as any} />
                  <Caption className="font-semibold">
                    {formatCurrency(product.price)}
                  </Caption>
                </div>
              </div>
            </Card>
          )}
        />
      </ListingLayout>

      {editingProduct && (
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          title={drawerTitle}
          mode={drawerMode || "view"}
          isDirty={isDirty}
          footer={drawerFooter}
          side="right"
        >
          {drawerMode === "delete" ? (
            <div className="space-y-4">
              <Text className="text-gray-700 dark:text-gray-300">
                {t("confirmDelete")}
              </Text>
              <Text className="font-medium">{editingProduct.title}</Text>
            </div>
          ) : (
            <ProductForm
              product={editingProduct}
              onChange={setEditingProduct}
              isReadonly={isReadonly}
            />
          )}
        </SideDrawer>
      )}
    </>
  );
}
