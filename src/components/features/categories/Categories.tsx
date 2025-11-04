"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import { useAuth } from '@/lib/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import { PageHeader } from "@/components/ui/admin-seller/PageHeader";
import { UnifiedAlert } from "@/components/ui/unified";
import { UnifiedButton } from "@/components/ui/unified/Button";
import { SimpleTabs } from "@/components/ui/unified/Tabs";
import type { Category } from "@/types/shared";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import CategoryTreeView from "@/components/admin/categories/CategoryTreeView";
import CategoryListView from "@/components/admin/categories/CategoryListView";

interface Breadcrumb {
  label: string;
  href?: string;
  active?: boolean;
}

interface CategoriesProps {
  title?: string;
  description?: string;
  breadcrumbs?: Breadcrumb[];
}

export default function Categories({
  title = "Category Management",
  description = "Manage product categories and hierarchies",
  breadcrumbs,
}: CategoriesProps) {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "warning" | "info";
  }>({ show: false, message: "", type: "info" });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("list");

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setAlert({ show: false, message: "", type: "info" });
      const data = await apiClient.get<Category[]>(
        "/api/admin/categories?format=list"
      );
      // Ensure we always have an array
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Failed to fetch categories:", err);
      setCategories([]); // Set to empty array on error
      setAlert({
        show: true,
        message: err.response?.data?.error || "Failed to fetch categories",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch when user is authenticated and auth loading is complete
    if (!authLoading && user) {
      fetchCategories();
    } else if (!authLoading && !user) {
      setAlert({
        show: true,
        message: "Not authenticated",
        type: "error",
      });
      setLoading(false);
    }
  }, [authLoading, user, fetchCategories]);

  const handleOpenDialog = (category?: Category) => {
    setSelectedCategory(category || null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
  };

  const handleSubmit = async (formData: any) => {
    try {
      setAlert({ show: false, message: "", type: "info" });
      const method = selectedCategory ? "PATCH" : "POST";
      const url = selectedCategory
        ? `/admin/categories?id=${selectedCategory.id}`
        : `/admin/categories`;

      await (method === "PATCH"
        ? apiClient.patch<Category>(url, formData)
        : apiClient.post<Category>(url, formData));

      setAlert({
        show: true,
        message: selectedCategory
          ? "Category updated successfully"
          : "Category created successfully",
        type: "success",
      });
      handleCloseDialog();
      fetchCategories();
    } catch (err: any) {
      setAlert({
        show: true,
        message: err.response?.data?.error || "Failed to save category",
        type: "error",
      });
      console.error(err);
    }
  };

  const handleDelete = async (categoryId: string) => {
    // Find the category to check if it has children
    const hasChildren = categories.some((cat) =>
      cat.parentIds?.includes(categoryId)
    );

    const confirmMessage = hasChildren
      ? "⚠️ WARNING: This category has subcategories!\n\n" +
        "Deleting this category will:\n" +
        "• Delete ALL subcategories recursively\n" +
        "• Remove category assignment from all affected products\n\n" +
        "This action CANNOT be undone!\n\n" +
        "Are you absolutely sure you want to proceed?"
      : "Are you sure you want to delete this category?\n\n" +
        "This will also remove the category assignment from all products using it.";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setAlert({ show: false, message: "", type: "info" });
      const response = await apiClient.delete<{
        success: boolean;
        message?: string;
        data?: {
          id: string;
          deletedCategoriesCount: number;
          updatedProductsCount: number;
        };
      }>(`/admin/categories?id=${categoryId}`);

      const message =
        response.message ||
        (response.data
          ? `Successfully deleted ${response.data.deletedCategoriesCount} categories and updated ${response.data.updatedProductsCount} products`
          : "Category deleted successfully");

      setAlert({
        show: true,
        message,
        type: "success",
      });
      fetchCategories();
    } catch (err: any) {
      setAlert({
        show: true,
        message: err.response?.data?.error || "Failed to delete category",
        type: "error",
      });
      console.error(err);
    }
  };

  // Tabs configuration
  const tabs = [
    { id: "tree", label: "Tree View" },
    { id: "list", label: "List View" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={
          <UnifiedButton
            onClick={() => handleOpenDialog()}
            icon={<Plus className="w-5 h-5" />}
          >
            Add Category
          </UnifiedButton>
        }
      />

      {/* Alert */}
      {alert.show && (
        <UnifiedAlert
          variant={alert.type}
          onClose={() => setAlert({ ...alert, show: false })}
          className="mb-6"
        >
          {alert.message}
        </UnifiedAlert>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Tabs */}
          <SimpleTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
            variant="underline"
          />

          {/* Content */}
          <div className="p-6">
            {categories.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No categories found. Create your first category!
                </p>
                <UnifiedButton
                  onClick={() => handleOpenDialog()}
                  icon={<Plus className="w-5 h-5" />}
                >
                  Add Category
                </UnifiedButton>
              </div>
            ) : (
              <>
                {/* Tree View */}
                {activeTab === "tree" && (
                  <CategoryTreeView
                    categories={categories}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                  />
                )}

                {/* List View */}
                {activeTab === "list" && (
                  <CategoryListView
                    categories={categories}
                    onEdit={handleOpenDialog}
                    onDelete={handleDelete}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Category Form Dialog */}
      <CategoryForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleSubmit}
        category={selectedCategory}
        allCategories={categories}
      />
    </div>
  );
}
