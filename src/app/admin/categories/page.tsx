"use client";

import { useState } from "react";
import RoleGuard from "@/components/auth/RoleGuard";
import { Category, CategoryFormData } from "@/types";
import { useGlobalCategories } from "@/contexts/CategoriesContext";
import { CategoryForm } from "@/components/categories/CategoryForm";

export default function AdminCategoriesPage() {
  const {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    toggleCategoryStatus,
  } = useGlobalCategories();

  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");

  const handleSubmit = async (data: CategoryFormData) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, data);
      } else {
        await createCategory(data);
      }
      setShowForm(false);
      setEditingCategory(null);
    } catch (error) {
      console.error("Error saving category:", error);
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      await deleteCategory(categoryId);
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const handleToggleStatus = async (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId);
    if (!category) return;

    try {
      await toggleCategoryStatus(categoryId, category.isActive || false);
    } catch (error) {
      console.error("Error toggling category status:", error);
    }
  };

  const filteredCategories = categories.filter((category) => {
    const matchesSearch =
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && category.isActive) ||
      (statusFilter === "inactive" && !category.isActive);
    return matchesSearch && matchesStatus;
  });

  const parentCategories = categories.filter((cat) => !cat.parentId);

  if (loading && categories.length === 0) {
    return (
      <RoleGuard requiredRole="admin">
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </RoleGuard>
    );
  }

  if (error) {
    return (
      <RoleGuard requiredRole="admin">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-primary mb-2">
              Error Loading Categories
            </h2>
            <p className="text-secondary">{error}</p>
          </div>
        </div>
      </RoleGuard>
    );
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="admin-layout">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-primary">
                Category Management
              </h1>
              <p className="text-secondary mt-1">
                Manage product categories and subcategories
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              disabled={loading}
              className="bg-primary text-white px-4 py-2 rounded-md transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              Add New Category
            </button>
          </div>

          {/* Filters */}
          <div className="admin-card p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search categories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <svg
                      className="h-5 w-5 text-muted"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value as "all" | "active" | "inactive"
                    )
                  }
                  className="px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="all">All Categories</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Inactive Only</option>
                </select>
              </div>
            </div>

            <div className="mt-4 text-sm text-secondary">
              Showing {filteredCategories.length} of {categories.length}{" "}
              categories
            </div>
          </div>

          {/* Categories Table */}
          <div className="admin-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-surface">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Parent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Products
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Updated
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-border">
                  {filteredCategories.map((category) => (
                    <tr key={category.id} className="hover: bg-surface">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <img
                            src={category.image}
                            alt={category.name}
                            className="w-10 h-10 object-cover rounded-lg mr-3"
                          />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{category.icon}</span>
                              <div className="text-sm font-medium text-primary">
                                {category.name}
                              </div>
                              {category.featured && (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                                  Featured
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted">
                              /{category.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                        {category.parentId
                          ? categories.find((c) => c.id === category.parentId)
                              ?.name || "Unknown"
                          : "Root Category"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                        {category.productCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(category.id)}
                          disabled={loading}
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full transition-colors disabled:opacity-50 ${
                            category.isActive
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-red-100 text-red-800 hover:bg-red-200"
                          }`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted">
                        {category.updatedAt
                          ? new Date(category.updatedAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(category)}
                            disabled={loading}
                            className="text-primary hover:text-primary/80 transition-colors disabled:opacity-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Category Form Modal */}
          {showForm && (
            <CategoryForm
              category={editingCategory}
              parentCategories={parentCategories}
              onSubmit={handleSubmit}
              onCancel={() => {
                setShowForm(false);
                setEditingCategory(null);
              }}
              loading={loading}
            />
          )}
        </div>
      </div>
    </RoleGuard>
  );
}
