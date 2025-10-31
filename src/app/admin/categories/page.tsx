"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, Loader2 } from "lucide-react";
import RoleGuard from "@/components/features/auth/RoleGuard";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";
import type { Category } from "@/types";
import CategoryForm from "@/components/admin/categories/CategoryForm";
import CategoryTreeView from "@/components/admin/categories/CategoryTreeView";
import CategoryListView from "@/components/admin/categories/CategoryListView";
import { useBreadcrumbTracker } from "@/hooks/useBreadcrumbTracker";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <div className="py-6">{children}</div>}
    </div>
  );
}

function AdminCategoriesContent() {
  const { user, loading: authLoading } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [tabValue, setTabValue] = useState(1);

  // Add breadcrumb
  useBreadcrumbTracker([
    {
      label: "Admin",
      href: "/admin",
    },
    {
      label: "Categories",
      href: "/admin/categories",
      active: true,
    },
  ]);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.get<Category[]>(
        "/admin/categories?format=list"
      );
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to fetch categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Only fetch when user is authenticated and auth loading is complete
    if (!authLoading && user) {
      fetchCategories();
    } else if (!authLoading && !user) {
      setError("Not authenticated");
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
      setError(null);
      const method = selectedCategory ? "PATCH" : "POST";
      const url = selectedCategory
        ? `/admin/categories?id=${selectedCategory.id}`
        : `/admin/categories`;

      const data = await (method === "PATCH"
        ? apiClient.patch<Category>(url, formData)
        : apiClient.post<Category>(url, formData));

      setSuccess(
        selectedCategory
          ? "Category updated successfully"
          : "Category created successfully"
      );
      handleCloseDialog();
      fetchCategories();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save category");
      console.error(err);
    }
  };

  const handleDelete = async (categoryId: string) => {
    // Find the category to check if it has children
    const categoryToDelete = categories.find((cat) => cat.id === categoryId);
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
      setError(null);
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

      setSuccess(message);
      fetchCategories();
      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to delete category");
      console.error(err);
    }
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            Category Management
          </h1>
          <button
            onClick={() => handleOpenDialog()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Add Category
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex justify-between items-center">
            <p className="text-red-800 dark:text-red-200">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
            >
              ✕
            </button>
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex justify-between items-center">
            <p className="text-green-800 dark:text-green-200">{success}</p>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            {/* Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-800">
              <nav className="flex gap-8 px-6" aria-label="category view">
                <button
                  onClick={(e) => setTabValue(0)}
                  id="tab-0"
                  aria-controls="tabpanel-0"
                  className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                    tabValue === 0
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  Tree View
                </button>
                <button
                  onClick={(e) => setTabValue(1)}
                  id="tab-1"
                  aria-controls="tabpanel-1"
                  className={`py-4 px-2 font-semibold border-b-2 transition-colors ${
                    tabValue === 1
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                  }`}
                >
                  List View
                </button>
              </nav>
            </div>

            {/* Tree View */}
            <TabPanel value={tabValue} index={0}>
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No categories found. Create your first category!
                  </p>
                </div>
              ) : (
                <CategoryTreeView
                  categories={categories}
                  onEdit={handleOpenDialog}
                  onDelete={handleDelete}
                />
              )}
            </TabPanel>

            {/* List View */}
            <TabPanel value={tabValue} index={1}>
              {categories.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 dark:text-gray-400">
                    No categories found. Create your first category!
                  </p>
                </div>
              ) : (
                <CategoryListView
                  categories={categories}
                  onEdit={handleOpenDialog}
                  onDelete={handleDelete}
                />
              )}
            </TabPanel>
          </div>
        )}
      </div>

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

export default function AdminCategories() {
  return (
    <RoleGuard requiredRole="admin">
      <AdminCategoriesContent />
    </RoleGuard>
  );
}
