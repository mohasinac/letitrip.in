"use client";

import { useState, useEffect, use, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS, THEME_CONSTANTS, UI_LABELS, ROUTES } from "@/constants";
import {
  CategoryTreeView,
  DataTable,
  ImageUpload,
  Card,
  Button,
  SideDrawer,
} from "@/components";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId: string | null;
  tier: number;
  order: number;
  enabled: boolean;
  showOnHomepage: boolean;
  metrics: {
    productCount: number;
    totalProductCount: number;
    auctionCount: number;
    totalAuctionCount: number;
  };
  children: Category[];
}

type DrawerMode = "create" | "edit" | "delete" | null;

interface PageProps {
  params: Promise<{ action?: string[] }>;
}

export default function AdminCategoriesPage({ params }: PageProps) {
  const { action } = use(params);
  const router = useRouter();

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
  const [drawerMode, setDrawerMode] = useState<DrawerMode>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const initialFormRef = useRef<string>("");

  const categories = data?.categories || [];

  const isDirty = useMemo(() => {
    if (!editingCategory || drawerMode === "delete") return false;
    return JSON.stringify(editingCategory) !== initialFormRef.current;
  }, [editingCategory, drawerMode]);

  const flattenCategories = (cats: Category[]): Category[] => {
    const result: Category[] = [];
    const flatten = (items: Category[]) => {
      items.forEach((item) => {
        result.push(item);
        if (item.children.length > 0) {
          flatten(item.children);
        }
      });
    };
    flatten(cats);
    return result;
  };

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
        alert(
          "Cannot delete category with subcategories. Delete children first.",
        );
        return;
      }
      if (
        (cat as Category).metrics?.productCount > 0 ||
        (cat as Category).metrics?.auctionCount > 0
      ) {
        alert(
          "Cannot delete category with products/auctions. Move them first.",
        );
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

  // Auto-open drawer based on URL action: /add, /edit/:id, /delete/:id
  useEffect(() => {
    if (!action?.[0] || isDrawerOpen) return;

    const mode = action[0];
    const id = action[1];

    if (mode === "add") {
      handleCreate();
    } else if (mode === "edit" && id && categories.length > 0) {
      const cat = findCategoryById(id);
      if (cat) {
        handleEdit(cat);
      } else {
        router.replace(ROUTES.ADMIN.CATEGORIES);
      }
    } else if (mode === "delete" && id && categories.length > 0) {
      const cat = findCategoryById(id);
      if (cat) {
        handleDeleteDrawer(cat);
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
    } catch (err) {
      alert("Failed to save category");
    }
  };

  const handleConfirmDelete = async () => {
    if (!editingCategory?.id) return;

    try {
      await deleteMutation.mutate(editingCategory.id);
      await refetch();
      handleCloseDrawer();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

  const isReadonly = drawerMode === "delete";

  const drawerTitle =
    drawerMode === "create"
      ? "Create Category"
      : drawerMode === "delete"
        ? `${UI_LABELS.ACTIONS.DELETE} Category`
        : "Edit Category";

  const drawerFooter = (
    <div className="flex gap-3 justify-end">
      {drawerMode === "delete" ? (
        <>
          <Button onClick={handleCloseDrawer} variant="secondary">
            {UI_LABELS.ACTIONS.CANCEL}
          </Button>
          <Button onClick={handleConfirmDelete} variant="danger">
            {UI_LABELS.ACTIONS.DELETE}
          </Button>
        </>
      ) : (
        <>
          <Button onClick={handleCloseDrawer} variant="secondary">
            {UI_LABELS.ACTIONS.CANCEL}
          </Button>
          <Button onClick={handleSave} variant="primary">
            {UI_LABELS.ACTIONS.SAVE}
          </Button>
        </>
      )}
    </div>
  );

  const tableColumns = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      render: (cat: Category) => (
        <div style={{ paddingLeft: `${cat.tier * 20}px` }}>
          {cat.name}
          {cat.tier > 0 && (
            <span className="text-gray-400 text-xs ml-2">
              (Tier {cat.tier})
            </span>
          )}
        </div>
      ),
    },
    {
      key: "slug",
      header: "Slug",
      sortable: true,
    },
    {
      key: "metrics",
      header: "Products",
      render: (cat: Category) => (
        <span className="text-sm">
          {cat.metrics.productCount} ({cat.metrics.totalProductCount})
        </span>
      ),
    },
    {
      key: "enabled",
      header: "Status",
      sortable: true,
      render: (cat: Category) => (
        <span
          className={`px-2 py-1 text-xs font-medium rounded ${
            cat.enabled
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
          }`}
        >
          {cat.enabled ? UI_LABELS.STATUS.ACTIVE : UI_LABELS.STATUS.INACTIVE}
        </span>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1
              className={`text-2xl font-bold ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Categories
            </h1>
            <p
              className={`text-sm ${THEME_CONSTANTS.themed.textSecondary} mt-1`}
            >
              Manage product categories hierarchy
            </p>
          </div>
          <div className="flex gap-2">
            <div
              className={`flex border ${THEME_CONSTANTS.themed.border} rounded-md`}
            >
              <button
                onClick={() => setViewMode("tree")}
                className={`px-3 py-2 text-sm ${
                  viewMode === "tree"
                    ? "bg-blue-600 text-white"
                    : `${THEME_CONSTANTS.themed.bgTertiary} ${THEME_CONSTANTS.themed.textSecondary}`
                }`}
              >
                Tree
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-2 text-sm ${
                  viewMode === "table"
                    ? "bg-blue-600 text-white"
                    : `${THEME_CONSTANTS.themed.bgTertiary} ${THEME_CONSTANTS.themed.textSecondary}`
                }`}
              >
                Table
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
            columns={tableColumns}
            keyExtractor={(cat) => cat.id}
            onRowClick={(cat) => handleEdit(cat)}
            actions={(cat) => (
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(cat);
                  }}
                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
                >
                  {UI_LABELS.ACTIONS.EDIT}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDrawer(cat);
                  }}
                  className="text-red-600 hover:text-red-800 dark:text-red-400"
                >
                  {UI_LABELS.ACTIONS.DELETE}
                </button>
              </div>
            )}
          />
        )}
      </div>

      {/* Side Drawer for Create/Edit/Delete */}
      {editingCategory && (
        <SideDrawer
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          title={drawerTitle}
          mode={drawerMode || "view"}
          isDirty={isDirty}
          footer={drawerFooter}
        >
          <div className={THEME_CONSTANTS.spacing.stack}>
            <div>
              <label
                className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
              >
                Name
              </label>
              <input
                type="text"
                value={editingCategory.name || ""}
                onChange={(e) => {
                  const name = e.target.value;
                  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
                  setEditingCategory({ ...editingCategory, name, slug });
                }}
                readOnly={isReadonly}
                className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
              >
                Slug
              </label>
              <input
                type="text"
                value={editingCategory.slug || ""}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    slug: e.target.value,
                  })
                }
                readOnly={isReadonly}
                className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
              >
                Description
              </label>
              <textarea
                value={editingCategory.description || ""}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    description: e.target.value,
                  })
                }
                readOnly={isReadonly}
                rows={3}
                className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>

            {!isReadonly && (
              <ImageUpload
                currentImage={editingCategory.imageUrl}
                onUpload={(url) =>
                  setEditingCategory({ ...editingCategory, imageUrl: url })
                }
                folder="categories"
                label="Category Image"
                helperText="Recommended: 400x300px"
              />
            )}

            {editingCategory.imageUrl && isReadonly && (
              <div>
                <label
                  className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
                >
                  Category Image
                </label>
                <img
                  src={editingCategory.imageUrl}
                  alt={editingCategory.name || "Category"}
                  className="h-32 w-auto object-cover rounded"
                />
              </div>
            )}

            <div>
              <label
                className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
              >
                Parent Category
              </label>
              <select
                value={editingCategory.parentId || ""}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    parentId: e.target.value || null,
                  })
                }
                disabled={isReadonly}
                className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
              >
                <option value="">None (Root Category)</option>
                {flattenCategories(categories).map((cat) => (
                  <option
                    key={cat.id}
                    value={cat.id}
                    disabled={cat.id === editingCategory.id}
                  >
                    {"  ".repeat(cat.tier)}
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingCategory.enabled || false}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      enabled: e.target.checked,
                    })
                  }
                  disabled={isReadonly}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Enabled
                </span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={editingCategory.showOnHomepage || false}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      showOnHomepage: e.target.checked,
                    })
                  }
                  disabled={isReadonly}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show on Homepage
                </span>
              </label>
            </div>

            <div>
              <label
                className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
              >
                Order
              </label>
              <input
                type="number"
                value={editingCategory.order || 0}
                onChange={(e) =>
                  setEditingCategory({
                    ...editingCategory,
                    order: parseInt(e.target.value),
                  })
                }
                readOnly={isReadonly}
                className={`${THEME_CONSTANTS.patterns.adminInput} ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
              />
            </div>
          </div>
        </SideDrawer>
      )}
    </>
  );
}
