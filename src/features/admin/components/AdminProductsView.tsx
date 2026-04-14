/**
 * AdminProductsView
 *
 * Contains all product management state, mutations, drawer logic, and JSX.
 * Consumed by /admin/products/[[...action]]/page.tsx.
 *
 * Uses ListingLayout for a unified listing shell matching the standard wireframe.
 */

"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  Suspense,
} from "react";
import { useRouter } from "@/i18n/navigation";
import { usePendingTable } from "@mohasinac/appkit/react";
import { useMessage, useUrlTable } from "@/hooks";
import { buildSieveFilters } from "@mohasinac/appkit/utils";
import { useAdminProducts, useAdminCategories } from "@/features/admin/hooks";
import { ROUTES, SUCCESS_MESSAGES, THEME_CONSTANTS } from "@/constants";

const { flex, spacing } = THEME_CONSTANTS;
import { formatCurrency } from "@/utils";
import { useTranslations } from "next-intl";
import {
  Caption,
  Text,
  TablePagination,
  Button,
  StatusBadge,
  DataTable,
} from "@mohasinac/appkit/ui";
import {
  AdminPageHeader,
  Card,
  DrawerFormFooter,
  MediaImage,
  Search,
  SideDrawer,
} from "@/components";
import {
  ProductFilters,
  ProductForm,
  getProductTableColumns,
} from "@mohasinac/appkit/features/products";
import { AdminProductsView as AdminProductsShell } from "@mohasinac/appkit/features/admin";
import type { AdminProduct, ProductDrawerMode } from "@/components";

interface AdminProductsViewProps {
  action?: string[];
}

function AdminProductsContent({ action }: AdminProductsViewProps) {
  const router = useRouter();
  const t = useTranslations("adminProducts");
  const tActions = useTranslations("actions");
  const { showSuccess, showError } = useMessage();
  const table = useUrlTable({
    defaults: { pageSize: "25", sort: "-createdAt" },
  });
  const searchTerm = table.get("q");
  const statusFilter = table.get("status");
  const categoryFilter = table.get("category");
  const conditionFilter = table.get("condition");
  const brandFilter = table.get("brand");
  const minPrice = table.get("minPrice");
  const maxPrice = table.get("maxPrice");

  // ── Pending filter state (values staged until Apply is clicked) ──────
  const { pendingTable, filterActiveCount, onFilterApply, onFilterClear } =
    usePendingTable(table, [
      "status",
      "category",
      "condition",
      "brand",
      "minPrice",
      "maxPrice",
    ]);

  // ── Category options from API ────────────────────────────────────────
  const { data: categoriesData } = useAdminCategories();
  const categoryOptions = (categoriesData?.categories ?? []).map((c) => ({
    value: c.id,
    label: c.name,
  }));

  // ── Data fetching ───────────────────────────────────────────────────
  const {
    data,
    isLoading,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAdminProducts(
    table.buildSieveParams(
      buildSieveFilters(
        ["title@=*", searchTerm],
        ["status==", statusFilter],
        ["category==", categoryFilter],
        ["condition==", conditionFilter],
        ["brand@=*", brandFilter],
        ["price>=", minPrice],
        ["price<=", maxPrice],
      ),
    ),
  );

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
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
        await createMutation.mutateAsync(editingProduct);
      } else {
        await updateMutation.mutateAsync({
          id: editingProduct.id!,
          data: editingProduct,
        });
      }
      await refetch();
      showSuccess(
        drawerMode === "create"
          ? SUCCESS_MESSAGES.PRODUCT.CREATED
          : SUCCESS_MESSAGES.PRODUCT.UPDATED,
      );
      handleCloseDrawer();
    } catch {
      showError(t("saveFailed"));
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingProduct?.id) return;
    try {
      await deleteMutation.mutateAsync(editingProduct.id);
      await refetch();
      showSuccess(SUCCESS_MESSAGES.PRODUCT.DELETED);
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

  const { columns, actions } = getProductTableColumns<AdminProduct>({
    labels: {
      title: t("formTitle"),
      category: t("formCategory"),
      price: t("formPrice"),
      stock: t("formStock"),
      status: t("formStatus"),
      seller: t("formSeller"),
      featured: t("formFeatured"),
      edit: tActions("edit"),
      delete: tActions("delete"),
      yes: tActions("yes"),
      no: tActions("no"),
    },
    onEdit: handleEdit,
    onDelete: handleDeleteDrawer,
    currencyCode: "INR",
    locale: "en-IN",
  });

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

  return (
    <>
      <AdminProductsShell
        isDashboard
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
          <ProductFilters
            table={pendingTable}
            showStatus
            categoryOptions={categoryOptions}
          />
        }
        filterActiveCount={filterActiveCount}
        onFilterApply={onFilterApply}
        onFilterClear={onFilterClear}
        loading={isLoading}
        errorSlot={
          error ? (
            <Card>
              <div className="text-center py-8">
                <Text variant="error" className="mb-4">
                  {error.message}
                </Text>
                <Button variant="outline" onClick={() => refetch()}>
                  {tActions("retry")}
                </Button>
              </div>
            </Card>
          ) : undefined
        }
        toolbarPaginationSlot={
          <TablePagination
            currentPage={data?.meta?.page ?? 1}
            totalPages={data?.meta?.totalPages ?? 1}
            pageSize={table.getNumber("pageSize", 25)}
            total={data?.meta?.total ?? 0}
            onPageChange={table.setPage}
            compact
          />
        }
        renderDrawer={() =>
          editingProduct ? (
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
                <div className={spacing.stack}>
                  <Text className="text-zinc-700 dark:text-zinc-300">
                    {t("confirmDelete")}
                  </Text>
                  <Text className="font-medium">{editingProduct.title}</Text>
                </div>
              ) : (
                <ProductForm
                  product={editingProduct}
                  onChange={(updated) => setEditingProduct(updated as Partial<AdminProduct>)}
                  isReadonly={isReadonly}
                  currencyPrefix="₹"
                />
              )}
            </SideDrawer>
          ) : null
        }
      >
        <DataTable
          data={products}
          columns={columns}
          keyExtractor={(product) => product.id}
          onRowClick={handleEdit}
          actions={actions}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          externalPagination
          showViewToggle
          viewMode={(table.get("view") || "table") as "table" | "grid" | "list"}
          onViewModeChange={(mode) => table.set("view", mode)}
          mobileCardRender={(product) => (
            <Card
              className="overflow-hidden cursor-pointer"
              onClick={() => handleEdit(product)}
            >
              <div className="relative aspect-square overflow-hidden bg-zinc-100 dark:bg-slate-800">
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
                <div className={`${flex.between} gap-1`}>
                  <StatusBadge status={product.status as any} />
                  <Caption className="font-semibold">
                    {formatCurrency(product.price)}
                  </Caption>
                </div>
              </div>
            </Card>
          )}
        />
      </AdminProductsShell>
    </>
  );
}

export function AdminProductsView(props: AdminProductsViewProps) {
  return (
    <Suspense>
      <AdminProductsContent {...props} />
    </Suspense>
  );
}
