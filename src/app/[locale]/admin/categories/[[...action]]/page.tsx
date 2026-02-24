"use client";

import { useState, useEffect, use, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, THEME_CONSTANTS, UI_LABELS, ROUTES } from "@/constants";
import {
  CategoryTreeView,
  DataTable,
  Card,
  Button,
  SideDrawer,
  AdminPageHeader,
  DrawerFormFooter,
  getCategoryTableColumns,
  CategoryForm,
  flattenCategories,
} from "@/components";
import { useToast } from "@/components";
import type { Category, CategoryDrawerMode } from "@/components";

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

const LABELS = UI_LABELS.ADMIN.CATEGORIES;

export default function AdminCategoriesPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();
  const { showToast } = useToast();

  const { data, isLoading, error, refetch } = useApiQuery<{
    categories: Category[];
  }>({
    queryKey: ["categories", "tree"],
    queryFn: () => apiClient.get(`${API_ENDPOINTS.CATEGORIES.LIST}?view=tree`),
  });

  const createMutation = useApiMutation<any, any>({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.CATEGORIES.LIST, data),
  });

  const updateMutation = useApiMutation<any, { id: string; data: any }>({
    mutationFn: ({ id, data }) =>
      apiClient.patch(`${API_ENDPOINTS.CATEGORIES.LIST}/${id}`, data),
  });

  const deleteMutation = useApiMutation<any, string>({
    mutationFn: (id) =>
      apiClient.delete(`${API_ENDPOINTS.CATEGORIES.LIST}/${id}`),
  });

  const [editingCategory, setEditingCategory] =
    useState<Partial<Category> | null>(null);
  const [drawerMode, setDrawerMode] = useState<CategoryDrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const initialFormRef = useRef<string>("");

  const categories = data?.categories || [];

  const isDirty = useMemo(() => {
    if (!editingCategory || drawerMode === "delete") return false;
    return JSON.stringify(editingCategory) !== initialFormRef.current;
  }, [editingCategory, drawerMode]);

  const findCategoryById = useCallback(
    (id: string): Category | undefined => {
      const search = (cats: Category[]): Category | undefined => {
        for (const cat of cats) {
          if (cat.id === id) return cat;
          if (cat.children.length > 0) {
            const found = search(cat.children);
            if (found) return found;
          }
        }
        return undefined;
      };
      return search(categories);
    },
    [categories],
  );

  const handleCreate = useCallback(() => {
    const newCat: Partial<Category> = {
      name: "",
      slug: "",
      parentId: null,
      enabled: true,
      showOnHomepage: false,
      order: 0,
    };
    setEditingCategory(newCat);
    initialFormRef.current = JSON.stringify(newCat);
    setDrawerMode("create");
    setIsDrawerOpen(true);
    if (action?.[0] !== "add") {
      router.push(`${ROUTES.ADMIN.CATEGORIES}/add`);
    }
  }, [action, router]);

  const handleEdit = useCallback(
    (cat: Category | Partial<Category>) => {
      setEditingCategory(cat);
      initialFormRef.current = JSON.stringify(cat);
      setDrawerMode("edit");
      setIsDrawerOpen(true);
      if (cat.id && action?.[0] !== "edit") {
        router.push(`${ROUTES.ADMIN.CATEGORIES}/edit/${cat.id}`);
      }
    },
    [action, router],
  );

  const handleDeleteDrawer = useCallback(
    (cat: Category | Partial<Category>) => {
      if ((cat as Category).children?.length > 0) {
        showToast(LABELS.CANNOT_DELETE_WITH_CHILDREN, "warning");
        return;
      }
      if (
        (cat as Category).metrics?.productCount > 0 ||
        (cat as Category).metrics?.auctionCount > 0
      ) {
        showToast(LABELS.CANNOT_DELETE_WITH_PRODUCTS, "warning");
        return;
      }
      setEditingCategory(cat);
      initialFormRef.current = JSON.stringify(cat);
      setDrawerMode("delete");
      setIsDrawerOpen(true);
      if (cat.id && action?.[0] !== "delete") {
        router.push(`${ROUTES.ADMIN.CATEGORIES}/delete/${cat.id}`);
      }
    },
    [action, router],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setEditingCategory(null);
      setDrawerMode(null);
    }, 300);
    // Clear action from URL
    if (action?.[0]) {
      router.replace(ROUTES.ADMIN.CATEGORIES);
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
      categories.length > 0
    ) {
      const cat = findCategoryById(id);
      if (cat) {
        mode === "edit" ? handleEdit(cat) : handleDeleteDrawer(cat);
      } else {
        router.replace(ROUTES.ADMIN.CATEGORIES);
      }
    }
  }, [
    action,
    categories,
    findCategoryById,
    isDrawerOpen,
    handleCreate,
    handleEdit,
    handleDeleteDrawer,
    router,
  ]);

  const handleSave = async () => {
    if (!editingCategory) return;
    try {
      if (drawerMode === "create") {
        await createMutation.mutate(editingCategory);
      } else {
        await updateMutation.mutate({
          id: editingCategory.id!,
          data: editingCategory,
        });
      }
      await refetch();
      handleCloseDrawer();
    } catch {
      showToast(LABELS.SAVE_FAILED, "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingCategory?.id) return;
    try {
      await deleteMutation.mutate(editingCategory.id);
      await refetch();
      handleCloseDrawer();
    } catch {
      showToast(LABELS.DELETE_FAILED, "error");
    }
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? LABELS.CREATE_CATEGORY
      : drawerMode === "delete"
        ? LABELS.DELETE_CATEGORY
        : LABELS.EDIT_CATEGORY;

  const { columns, actions } = getCategoryTableColumns(
    handleEdit as (cat: Category) => void,
    handleDeleteDrawer as (cat: Category) => void,
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

  const { themed } = THEME_CONSTANTS;

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <AdminPageHeader title={LABELS.TITLE} subtitle={LABELS.SUBTITLE} />
          <div className="flex gap-2">
            <div className={`flex border ${themed.border} rounded-md`}>
              <button
                onClick={() => setViewMode("tree")}
                className={`px-3 py-2 text-sm ${
                  viewMode === "tree"
                    ? "bg-blue-600 text-white"
                    : `${themed.bgTertiary} ${themed.textSecondary}`
                }`}
              >
                {LABELS.TREE_VIEW}
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 text-sm ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : `${themed.bgTertiary} ${themed.textSecondary}`
                }`}
              >
                {LABELS.TABLE_VIEW}
              </button>
            </div>
            <Button onClick={handleCreate} variant="primary">
              + {UI_LABELS.ACTIONS.CREATE}
            </Button>
          </div>
        </div>

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
        ) : viewMode === "tree" ? (
          <CategoryTreeView
            categories={categories}
            onSelect={(cat) => handleEdit(cat as Partial<Category>)}
            onEdit={(cat) => handleEdit(cat as Partial<Category>)}
            onDelete={(cat) => handleDeleteDrawer(cat as Partial<Category>)}
          />
        ) : (
          <DataTable
            data={flattenCategories(categories)}
            columns={columns}
            keyExtractor={(cat) => cat.id}
            onRowClick={(cat) => handleEdit(cat)}
            actions={actions}
          />
        )}
      </div>

      {editingCategory && (
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          title={drawerTitle}
          mode={drawerMode || "view"}
          isDirty={isDirty}
          footer={drawerFooter}
          side="right"
        >
          <CategoryForm
            category={editingCategory}
            allCategories={categories}
            onChange={setEditingCategory}
            isReadonly={isReadonly}
          />
        </SideDrawer>
      )}
    </>
  );
}
