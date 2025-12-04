"use client";

import { AdminResourcePage } from "@/components/admin/AdminResourcePage";
import { categoriesService } from "@/services/categories.service";
import { StatusBadge } from "@/components/common/StatusBadge";
import { DateDisplay } from "@/components/common/values";
import OptimizedImage from "@/components/common/OptimizedImage";
import { FolderTree, CheckCircle, XCircle } from "lucide-react";
import { getCategoryBulkActions } from "@/constants/bulk-actions";
import { CATEGORY_FIELDS, toInlineFields } from "@/constants/form-fields";
import type { CategoryWithStats } from "@/types/frontend/category.types";

export default function AdminCategoriesPage() {
  // Define columns
  const columns = [
    {
      key: "category",
      label: "Category",
      render: (category: CategoryWithStats) => (
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
      render: (category: CategoryWithStats) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {category.parentName || "Root Category"}
        </div>
      ),
    },
    {
      key: "level",
      label: "Level",
      render: (category: CategoryWithStats) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          Level {category.level || 0}
        </div>
      ),
    },
    {
      key: "products",
      label: "Products",
      render: (category: CategoryWithStats) => (
        <div className="text-sm text-gray-900 dark:text-white">
          {category.productCount || 0}
        </div>
      ),
    },
    {
      key: "subcategories",
      label: "Subcategories",
      render: (category: CategoryWithStats) => (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {category.children?.length || 0}
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (category: CategoryWithStats) => (
        <StatusBadge
          status={category.isActive ? "active" : "inactive"}
          label={category.isActive ? "Active" : "Inactive"}
        />
      ),
    },
    {
      key: "leaf",
      label: "Type",
      render: (category: CategoryWithStats) =>
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
      render: (category: CategoryWithStats) => (
        <DateDisplay date={new Date(category.createdAt)} format="relative" />
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
      items: (response.data || []) as CategoryWithStats[],
      nextCursor: currentPage < totalPages ? String(currentPage + 1) : null,
      hasNextPage: currentPage < totalPages,
    };
  };

  // Handle save
  const handleSave = async (id: string, data: Partial<CategoryWithStats>) => {
    await categoriesService.update(id, data);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    await categoriesService.delete(id);
  };

  return (
    <AdminResourcePage<CategoryWithStats>
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
  );
}
