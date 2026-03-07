/**
 * AdminCategoriesView
 *
 * Contains all category management state, mutations, handlers, and JSX.
 * Consumed by /admin/categories/[[...action]]/page.tsx.
 */

"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "@/i18n/navigation";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { useAdminCategories } from "@/features/admin/hooks";
import { useTranslations } from "next-intl";
import {
  AdminPageHeader,
  Button,
  Card,
  CategoryTreeView,
  DataTable,
  DrawerFormFooter,
  ListingLayout,
  SideDrawer,
  Text,
} from "@/components";
import { useToast } from "@/components";
import { CategoryForm, flattenCategories, getCategoryTableColumns } from ".";
import type { Category, CategoryDrawerMode } from ".";

interface AdminCategoriesViewProps {
  action?: string[];
}

export function AdminCategoriesView({ action }: AdminCategoriesViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const t = useTranslations("adminCategories");
  const tActions = useTranslations("actions");

  const {
    data,
    isLoading,
    error,
    refetch,
    createMutation,
    updateMutation,
    deleteMutation,
  } = useAdminCategories();

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
      display: { showInMenu: true, showInFooter: false },
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
        showToast(t("cannotDeleteWithChildren"), "warning");
        return;
      }
      if (
        (cat as Category).metrics?.productCount > 0 ||
        (cat as Category).metrics?.auctionCount > 0
      ) {
        showToast(t("cannotDeleteWithProducts"), "warning");
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
    [action, router, showToast, t],
  );

  const handleCloseDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setEditingCategory(null);
      setDrawerMode(null);
    }, 300);
    if (action?.[0]) {
      router.replace(ROUTES.ADMIN.CATEGORIES);
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
      showToast(t("saveFailed"), "error");
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingCategory?.id) return;
    try {
      await deleteMutation.mutate(editingCategory.id);
      await refetch();
      handleCloseDrawer();
    } catch {
      showToast(t("deleteFailed"), "error");
    }
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? t("createCategory")
      : drawerMode === "delete"
        ? t("deleteCategory")
        : t("editCategory");

  const { columns, actions } = getCategoryTableColumns(
    handleEdit as (cat: Category) => void,
    handleDeleteDrawer as (cat: Category) => void,
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

  const { themed } = THEME_CONSTANTS;

  return (
    <>
      <ListingLayout
        headerSlot={
          <AdminPageHeader title={t("title")} subtitle={t("subtitle")} />
        }
        viewToggleSlot={
          <div className={`flex border ${themed.border} rounded-md`}>
            <Button
              onClick={() => setViewMode("tree")}
              className={`px-3 py-2 text-sm ${
                viewMode === "tree"
                  ? "bg-blue-600 text-white"
                  : `${themed.bgTertiary} ${themed.textSecondary}`
              }`}
            >
              {t("treeView")}
            </Button>
            <Button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : `${themed.bgTertiary} ${themed.textSecondary}`
              }`}
            >
              {t("tableView")}
            </Button>
          </div>
        }
        actionsSlot={
          <Button onClick={handleCreate} variant="primary">
            + {tActions("create")}
          </Button>
        }
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
      >
        {viewMode === "tree" ? (
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
      </ListingLayout>

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
