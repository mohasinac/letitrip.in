"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Category, CategoryTreeNode } from "@/types";
import { CategoryService } from "@/lib/services/category.service";
import { apiClient } from "@/lib/api/client";
import CategoryTree from "@/components/features/admin/CategoryTree";
import CategoryForm from "@/components/features/admin/CategoryForm";
import CategoryBulkActions from "@/components/features/admin/CategoryBulkActions";
import CategorySearch from "@/components/features/admin/CategorySearch";
import CategoryStats from "@/components/features/admin/CategoryStats";

export default function AdminCategoriesPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [view, setView] = useState<"tree" | "list">("tree");
  const [filters, setFilters] = useState({
    includeInactive: false,
    showFeaturedOnly: false,
    level: null as number | null,
  });

  // Load categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const result = (await apiClient.get(
        "/admin/categories/tree?" +
          new URLSearchParams({
            includeInactive: filters.includeInactive.toString(),
            withProductCounts: "true",
          })
      )) as any;

      if (result.success && result.data) {
        setCategories(result.data.categories);
      }
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [filters]);

  // Handle category operations
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowForm(true);
  };

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!confirm("Are you sure you want to delete this category?")) {
      return;
    }

    try {
      const result = (await apiClient.delete(
        `/admin/categories/${categoryId}`
      )) as any;

      if (result.success) {
        await loadCategories();
      } else {
        alert(result.error || "Failed to delete category");
      }
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert("Failed to delete category");
    }
  };

  const handleFormSubmit = async () => {
    setShowForm(false);
    setEditingCategory(null);
    await loadCategories();
  };

  const handleBulkAction = async (action: string, data?: any) => {
    if (selectedCategories.length === 0) {
      alert("Please select categories first");
      return;
    }

    try {
      const result = (await apiClient.post("/admin/categories/bulk", {
        operation: action,
        categoryIds: selectedCategories,
        data,
      })) as any;

      if (result.success) {
        setSelectedCategories([]);
        await loadCategories();
      } else {
        alert(result.error || "Bulk operation failed");
      }
    } catch (error) {
      console.error("Bulk operation failed:", error);
      alert("Bulk operation failed");
    }
  };

  // Check admin access
  if (!user || (user as any).role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Category Management
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage product categories and their hierarchy
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* View Toggle */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setView("tree")}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    view === "tree"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Tree View
                </button>
                <button
                  onClick={() => setView("list")}
                  className={`px-3 py-1 rounded text-sm font-medium ${
                    view === "list"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  List View
                </button>
              </div>

              <button
                onClick={handleCreateCategory}
                className="btn btn-primary"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Stats */}
            <CategoryStats categories={categories} />

            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Filters
              </h3>

              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.includeInactive}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        includeInactive: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Include inactive
                  </span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.showFeaturedOnly}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        showFeaturedOnly: e.target.checked,
                      }))
                    }
                    className="rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Featured only
                  </span>
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Level Filter
                  </label>
                  <select
                    value={filters.level || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        level: e.target.value ? parseInt(e.target.value) : null,
                      }))
                    }
                    className="input"
                  >
                    <option value="">All levels</option>
                    <option value="0">Root categories</option>
                    <option value="1">Level 1</option>
                    <option value="2">Level 2</option>
                    <option value="3">Level 3</option>
                    <option value="4">Level 4</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bulk Actions */}
            {selectedCategories.length > 0 && (
              <CategoryBulkActions
                selectedCount={selectedCategories.length}
                onAction={handleBulkAction}
                onClearSelection={() => setSelectedCategories([])}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search */}
            <div className="mb-6">
              <CategorySearch
                value={searchQuery}
                onChange={setSearchQuery}
                onResults={(results: Category[]) => {
                  // Handle search results if needed
                }}
              />
            </div>

            {/* Categories */}
            <div className="bg-white rounded-lg shadow">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-gray-500">Loading categories...</p>
                </div>
              ) : (
                <CategoryTree
                  categories={categories}
                  searchQuery={searchQuery}
                  filters={filters}
                  selectedCategories={selectedCategories}
                  onSelectionChange={setSelectedCategories}
                  onEdit={handleEditCategory}
                  onDelete={handleDeleteCategory}
                  view={view}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Category Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          allCategories={categories.flat()} // Flatten tree for parent selection
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingCategory(null);
          }}
        />
      )}
    </div>
  );
}
