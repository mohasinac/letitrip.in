/**
 * @fileoverview React Component
 * @module src/app/admin/categories/page
 * @description This file contains the page component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { CategoryTree } from "@/components/category/CategoryTree";
import OptimizedImage from "@/components/common/OptimizedImage";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values/DateDisplay";
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

/**
 * ViewMode type
 * 
 * @typedef {Object} ViewMode
 * @description Type definition for ViewMode
 */
type ViewMode = "list" | "tree";

export default /**
 * Performs admin categories page operation
 *
 * @returns {any} The admincategoriespage result
 *
 */
function AdminCategoriesPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  // Load tree data for tree view
  const {
    /** Data */
    data: treeData,
    /** Is Loading */
    isLoading: loadingTree,
    /** Execute */
    execute: loadTree,
  } = useLoadingState<CategoryCardFE[]>({
    /** Initial Data */
    initialData: [],
  });

  /**
 * Performs load tree data operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<any>} The loadtreedata result
 *
 */
const loadTreeData = useCallback(async () => {
    const response = await categoriesService.getTree();
    return response || [];
  }, []);

  useEffect(() => {
    if (viewMode === "tree" && (!treeData || treeData/**
 * Performs columns operation
 *
 * @param {CategoryFE} category - The category
 *
 * @returns {any} The columns result
 *
 */
.length === 0)) {
      loadTree(loadTreeData);
    }
  }, [viewMode, treeData?.length, loadTree, loadTreeData]);
  // Define columns
  const columns = [
    {
      /** Key */
      key: "category",
      /** Label */
      label: "Category",
      /** Render */
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
      /** Key */
      key: "parent",
      /** Label */
      label: "Parent",
      /** Render */
      render: (category: CategoryFE) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {category.parentIds?.length ? "Has Parent" : "Root Category"}
        </div>
      ),
    },
    {
      /** Key */
      key: "level",
      /** Label */
      label: "Level",
      /** Render */
      render: (category: CategoryFE) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Level {category.level || 0}
        </div>
      ),
    },
    {
      /** Key */
      key: "products",
      /** Label */
      label: "Products",
      /** Render */
      render: (category: CategoryFE) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {category.productCount || 0}
        </div>
      ),
    },
    {
      /** Key */
      key: "subcategories",
      /** Label */
      label: "Subcategories",
      /** Render */
      render: (category: CategoryFE) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">0</div>
      ),
    },
    {
      /** Key */
      key: "status",
      /** Label */
      label: "Status",
      /** Render */
      render: (category: CategoryFE) => (
        <StatusBadge
          status={category.status === "published" ? "active" : "inactive"}
        />
      ),
    },
    {
      /** Key */
      key: "leaf",
      /** Label */
      label: "Type",
      /** Render */
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
      /** Key */
      key: "created",
      /** Label */
      label: "Created",
      /** Render */
      render: (category: CategoryFE) => (
        <DateDisplay date={category.createdAt} format="medium" />
      ),
    },
  ];

  // Define filters
  const filters = [
    {
      /** Key */
      key: "isActive",
      /** Label */
      label: "Status",
      /** Type */
      type: "select" as const,
      /** Options */
      options: [
        { value: "all", label: "All Status" },
        { value: "true", label: "Active" },
        { value: "false", label: "Inactive" },
      ],
    },
    {
      /** Key */
      key: "isLeaf",
      /** Label */
      label: "Type",
      /** Type */
      type: "select" as const,
      /** Options */
      options: [
        { value: "all", label: "All Types" },
        { value: "true", label: "Leaf Categories" },
        { value: "false", label: "Parent Categories" },
      ],
    },
    {
      /** Key */
      key: "level",
      /** Label */
      label: "Level",
      /** Type */
      type: "select" as const,
      /** Options */
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
  /**
   * Performs async operation
   *
   * @param {{
    cursor} [options] - Configuration options
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadData = async (options: {
    /** Cursor */
    cursor: string | null;
    /** Search */
    search?: string;
    /** Filters */
    filters?: Record<string, string>;
  }) => {
    const apiFilters: any = {
      /** Page */
      page: options.cursor ? parseInt(options.cursor) : 1,
      /** Limit */
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
      /** Items */
      items: (response.data || []) as CategoryFE[],
      /** Next Cursor */
      nextCursor: currentPage < totalPages ? String(currentPage + 1) : null,
      /** Has Next Page */
      hasNextPage: currentPage < totalPages,
    };
  };

  // Handle save
  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<CategoryFE>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   * @param {Partial<CategoryFE>} data - Data object containing information
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleSave = async (id: string, data: Partial<CategoryFE>) => {
    await categoriesService.update(id, data as any);
  };

  // Handle delete
  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @param {string} id - Unique identifier
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleDelete = async (id: string) => {
    await categoriesService.delete(id);
  };

  // Handle node click in tree view
  /**
   * Handles node click event
   *
   * @param {CategoryCardFE} category - The category
   *
   * @returns {any} The handlenodeclick result
   */

  /**
   * Handles node click event
   *
   * @param {CategoryCardFE} category - The category
   *
   * @returns {any} The handlenodeclick result
   */

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
          categories={treeData || []}
          onNodeClick={handleNodeClick}
          height="70vh"
        />
      )}
    </div>
  );
}
