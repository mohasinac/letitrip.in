"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { CategoryTree } from "@/components/category/CategoryTree";
import OptimizedImage from "@/components/common/OptimizedImage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values";
import { getCategoryBulkActions } from "@/constants/bulk-actions";
import { CATEGORY_FIELDS, toInlineFields } from "@/constants/form-fields";
import { useLoadingState } from "@/hooks/useLoadingState";
import { categoriesService } from "@/services/categories.service";
import type {
  CategoryCardFE,
  CategoryFE,
} from "@/types/frontend/category.types";
import { CheckCircle, FolderTree, GitBranch, List } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

type ViewMode = "list" | "tree";

export default function AdminCategoriesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Load tree data for tree view
  const {
    data: treeData,
    isLoading: loadingTree,
    execute: loadTree,
  } = useLoadingState<CategoryCardFE[]>({
    initialData: [],
  });

  const loadTreeData = useCallback(async () => {
    const response = await categoriesService.getTree();
    return response.data || [];
  }, []);

  useEffect(() => {
    if (viewMode === "tree" && treeData.length === 0) {
      loadTree(loadTreeData);
    }
  }, [viewMode, treeData.length, loadTree, loadTreeData]);
  // Define columns
  const columns = [
    {
      key: "category",
      label: "Category",
      render: (category: CategoryFE) => (
        <div className="flex items-center gap-3">
          {category.image ? (
            <OptimizedImage
              src={category.image}
              alt={category.name}
              width={40}
              height={40}
              className="rounded-lg object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              <FolderTree className="w-5 h-5 text-indigo-600 dark:text-indigo-300" />
            </div>
          )}
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {category.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {category.slug}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "parent",
      label: "Parent",
      render: (category: CategoryFE) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {category.parentIds?.length ? "Has Parent" : "Root Category"}
        </div>
      ),
    },
    {
      key: "level",
      label: "Level",
      render: (category: CategoryFE) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Level {category.level || 0}
        </div>
      ),
    },
    {
      key: "products",
      label: "Products",
      render: (category: CategoryFE) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {category.productCount || 0}
        </div>
      ),
    },
    {
      key: "subcategories",
      label: "Subcategories",
      render: (category: CategoryFE) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">0</div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (category: CategoryFE) => (
        <StatusBadge
          status={category.status === "published" ? "active" : "inactive"}
        />
      ),
    },
    {
      key: "leaf",
      label: "Type",
      render: (category: CategoryFE) =>
        category.isLeaf ? (
          <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Leaf</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <FolderTree className="w-4 h-4" />
            <span className="text-sm">Parent</span>
          </div>
        ),
    },
    {
      key: "created",
      label: "Created",
      render: (category: CategoryFE) => (
        <DateDisplay date={category.createdAt} format="medium" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      key: "isActive",
      label: "Status",
      type: "select" as const,
      options: [
        { value: "all", label: "All Status" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
    {
      key: "isLeaf",
      label: "Type",
      type: "select" as const,
      options: [
        { value: "all", label: "All Types" },
        { value: "true", label: "Leaf Categories" },
        { value: "false", label: "Parent Categories" },
      ],
    },
    {
      key: "level",
      label: "Level",
      type: "select" as const,
      options: [
        { value: "all", label: "All Levels" },
        { value: "0", label: "Level 0" },
        { value: "1", label: "Level 1" },
        { value: "2", label: "Level 2" },
        { value: "3", label: "Level 3" },
      ],
    },
  ];

  // Load data function
  const loadData = async (options: {
    cursor: string | null;
    search?: string;
    filters?: Record<string, string>;
  }) => {
    const apiFilters: any = {
      page: options.cursor ? parseInt(options.cursor) : 1,
      limit: 20,
    };

    if (options.filters?.isActive && options.filters.isActive !== "all") {
      apiFilters.isActive = options.filters.isActive === "true";
    }
    if (options.filters?.isLeaf && options.filters.isLeaf !== "all") {
      apiFilters.isLeaf = options.filters.isLeaf === "true";
    }
    if (options.filters?.level && options.filters.level !== "all") {
      apiFilters.level = parseInt(options.filters.level);
    }
    if (options.search) {
      apiFilters.search = options.search;
    }

    const response = await categoriesService.list(apiFilters);
    const currentPage = apiFilters.page;
    const totalPages = Math.ceil((response.count || 0) / 20);

    return {
      items: (response.data || []) as CategoryFE[],
      nextCursor: currentPage < totalPages ? String(currentPage + 1) : null,
      hasNextPage: currentPage < totalPages,
    };
  };

  // Handle save
  const handleSave = async (id: string, data: Partial<CategoryFE>) => {
    await categoriesService.update(id, data as any);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    await categoriesService.delete(id);
  };

  // Handle node click in tree view
  const handleNodeClick = (category: CategoryCardFE) => {
    router.push(`/admin/categories/${category.slug}/edit`);
  };

  return (
    <div className="space-y-6">
      {/* View mode toggle */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Categories
        </h1>

        <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "list"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <List className="h-4 w-4" />
            List View
          </button>
          <button
            onClick={() => setViewMode("tree")}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === "tree"
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <GitBranch className="h-4 w-4" />
            Tree View
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "list" ? (
        <AdminResourcePage<CategoryFE>
          resourceName="Category"
          resourceNamePlural="Categories"
          loadData={loadData}
          columns={columns}
          fields={toInlineFields(CATEGORY_FIELDS)}
          bulkActions={getCategoryBulkActions(0)}
          onSave={handleSave}
          onDelete={handleDelete}
          filters={filters}
        />
      ) : loadingTree ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Loading category tree...
            </p>
          </div>
        </div>
      ) : (
        <CategoryTree
          categories={treeData}
          onNodeClick={handleNodeClick}
          height="70vh"
        />
      )}
    </div>
  );
}
