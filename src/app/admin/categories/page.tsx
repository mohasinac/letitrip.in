"use client";

import { useState } from "react";
import { useApiQuery, useApiMutation } from "@/hooks";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { CategoryTreeView, DataTable, ImageUpload } from "@/components/admin";
import { Card, Button } from "@/components";

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

export default function AdminCategoriesPage() {
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
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");

  const categories = data?.categories || [];

  const handleCreate = () => {
    setIsCreating(true);
    setEditingCategory({
      name: "",
      slug: "",
      parentId: null,
      enabled: true,
      showOnHomepage: false,
      order: 0,
    });
  };

  const handleSave = async () => {
    if (!editingCategory) return;

    try {
      if (isCreating) {
        await createMutation.mutate(editingCategory);
      } else {
        await updateMutation.mutate({
          id: editingCategory.id!,
          data: editingCategory,
        });
      }
      await refetch();
      setEditingCategory(null);
      setIsCreating(false);
    } catch (err) {
      alert("Failed to save category");
    }
  };

  const handleDelete = async (category: Category | any) => {
    if (category.children.length > 0) {
      alert(
        "Cannot delete category with subcategories. Delete children first.",
      );
      return;
    }

    if (
      category.metrics?.productCount > 0 ||
      category.metrics?.auctionCount > 0
    ) {
      alert("Cannot delete category with products/auctions. Move them first.");
      return;
    }

    if (!confirm(`Delete "${category.name}"?`)) return;

    try {
      await deleteMutation.mutate(category.id);
      await refetch();
    } catch (err) {
      alert("Failed to delete category");
    }
  };

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
          {cat.enabled ? "Enabled" : "Disabled"}
        </span>
      ),
    },
  ];

  if (editingCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {isCreating ? "Create Category" : "Edit Category"}
          </h1>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setEditingCategory(null);
                setIsCreating(false);
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} variant="primary">
              Save Category
            </Button>
          </div>
        </div>

        <Card>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>

            <ImageUpload
              currentImage={editingCategory.imageUrl}
              onUpload={(url) =>
                setEditingCategory({ ...editingCategory, imageUrl: url })
              }
              folder="categories"
              label="Category Image"
              helperText="Recommended: 400x300px"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
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
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Show on Homepage
                </span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700"
              />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Categories
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage product categories hierarchy
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
            <button
              onClick={() => setViewMode("tree")}
              className={`px-3 py-2 text-sm ${
                viewMode === "tree"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              Tree
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-2 text-sm ${
                viewMode === "table"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
              }`}
            >
              Table
            </button>
          </div>
          <Button onClick={handleCreate} variant="primary">
            + Add Category
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Card>
          <div className="text-center py-8">Loading categories...</div>
        </Card>
      ) : error ? (
        <Card>
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">{error.message}</p>
            <Button onClick={() => refetch()}>Retry</Button>
          </div>
        </Card>
      ) : viewMode === "tree" ? (
        <CategoryTreeView
          categories={categories}
          onSelect={(cat) => {
            setEditingCategory(cat as Partial<Category>);
            setIsCreating(false);
          }}
          onEdit={(cat) => {
            setEditingCategory(cat as Partial<Category>);
            setIsCreating(false);
          }}
          onDelete={handleDelete}
        />
      ) : (
        <DataTable
          data={flattenCategories(categories)}
          columns={tableColumns}
          keyExtractor={(cat) => cat.id}
          onRowClick={(cat) => {
            setEditingCategory(cat);
            setIsCreating(false);
          }}
          actions={(cat) => (
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingCategory(cat);
                  setIsCreating(false);
                }}
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(cat);
                }}
                className="text-red-600 hover:text-red-800 dark:text-red-400"
              >
                Delete
              </button>
            </div>
          )}
        />
      )}
    </div>
  );
}
