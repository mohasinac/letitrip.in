"use client";

import { useState, useEffect, use, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation, useMessage } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, UI_LABELS, ROUTES } from "@/constants";
import {
  Card,
  Button,
  SideDrawer,
  DataTable,
  AdminPageHeader,
  DrawerFormFooter,
  getProductTableColumns,
  ProductForm,
} from "@/components";
import type { AdminProduct, ProductDrawerMode } from "@/components";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

const LABELS = UI_LABELS.ADMIN.PRODUCTS;

export default function AdminProductsPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();
  const { showError } = useMessage();

  const { data, isLoading, error, refetch } = useApiQuery<{
    products: AdminProduct[];
    meta: { total: number };
  }>({
    queryKey: ["admin", "products"],
    queryFn: () =>
      apiClient.get(`${API_ENDPOINTS.ADMIN.PRODUCTS}?pageSize=200`),
  });

  const createMutation = useApiMutation<any, any>({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.ADMIN.PRODUCTS, data),
  });

  const updateMutation = useApiMutation<any, { id: string; data: any }>({
    mutationFn: ({ id, data }) =>
      apiClient.patch(API_ENDPOINTS.ADMIN.PRODUCT_BY_ID(id), data),
  });

  const deleteMutation = useApiMutation<any, string>({
    mutationFn: (id) => apiClient.delete(API_ENDPOINTS.ADMIN.PRODUCT_BY_ID(id)),
  });

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

  // Auto-open drawer based on URL action
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
      showError(LABELS.SAVE_FAILED);
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingProduct?.id) return;
    try {
      await deleteMutation.mutate(editingProduct.id);
      await refetch();
      handleCloseDrawer();
    } catch {
      showError(LABELS.DELETE_FAILED);
    }
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? LABELS.CREATE_PRODUCT
      : drawerMode === "delete"
        ? LABELS.DELETE_PRODUCT
        : LABELS.EDIT_PRODUCT;

  const { columns, actions } = getProductTableColumns(
    handleEdit,
    handleDeleteDrawer,
  );

  const drawerFooter =
    drawerMode === "delete" ? (
      <DrawerFormFooter
        onCancel={handleCloseDrawer}
        onSubmit={handleConfirmDelete}
        submitLabel={UI_LABELS.ACTIONS.DELETE}
      />
    ) : (
      <DrawerFormFooter onCancel={handleCloseDrawer} onSubmit={handleSave} />
    );

  return (
    <>
      <div className="space-y-6">
        <AdminPageHeader
          title={LABELS.TITLE}
          subtitle={LABELS.SUBTITLE}
          actionLabel={LABELS.CREATE_PRODUCT}
          onAction={handleCreate}
        />

        {isLoading ? (
          <Card>
            <div className="text-center py-8">{UI_LABELS.LOADING.DEFAULT}</div>
          </Card>
        ) : error ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-red-600 mb-4">{error.message}</p>
              <Button onClick={() => refetch()}>
                {UI_LABELS.ACTIONS.RETRY}
              </Button>
            </div>
          </Card>
        ) : (
          <DataTable
            data={products}
            columns={columns}
            keyExtractor={(product) => product.id}
            onRowClick={handleEdit}
            actions={actions}
          />
        )}
      </div>

      {editingProduct && (
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          title={drawerTitle}
          mode={drawerMode || "view"}
          isDirty={isDirty}
          footer={drawerFooter}
        >
          {drawerMode === "delete" ? (
            <div className="space-y-4">
              <p className="text-gray-700 dark:text-gray-300">
                {LABELS.CONFIRM_DELETE}
              </p>
              <p className="font-medium">{editingProduct.title}</p>
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
