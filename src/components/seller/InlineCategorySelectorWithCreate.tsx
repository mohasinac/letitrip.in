"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Loader2, ChevronDown } from "lucide-react";
import SlugInput from "@/components/common/SlugInput";
import { categoriesService } from "@/services/categories.service";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  parentIds?: string[];
  level: number;
  has_children: boolean;
  is_active: boolean;
}

interface InlineCategorySelectorWithCreateProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export default function InlineCategorySelectorWithCreate({
  value,
  onChange,
  disabled = false,
  error,
}: InlineCategorySelectorWithCreateProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);

  // Create category form state
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoriesService.list({ isActive: true });
      const leafCategories = data
        .filter((cat: any) => !cat.has_children)
        .map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          parent_id: cat.parent_id || null,
          parentIds: cat.parentIds,
          level: cat.level || 0,
          has_children: cat.has_children || false,
          is_active: cat.is_active,
        }));
      setCategories(leafCategories);
    } catch (error) {
      console.error("Failed to load categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const validateCreateForm = () => {
    const errors: Record<string, string> = {};

    if (!createForm.name.trim()) {
      errors.name = "Category name is required";
    } else if (createForm.name.trim().length < 2) {
      errors.name = "Category name must be at least 2 characters";
    } else if (createForm.name.trim().length > 100) {
      errors.name = "Category name must be less than 100 characters";
    }

    if (!createForm.slug.trim()) {
      errors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(createForm.slug)) {
      errors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    setCreateErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCategory = async () => {
    if (!validateCreateForm()) {
      return;
    }

    try {
      setCreating(true);

      const newCategory = await categoriesService.create({
        name: createForm.name.trim(),
        slug: createForm.slug.trim(),
        description: createForm.description.trim() || "",
        image: null,
        icon: null,
        parentIds: [],
        order: 0,
        isFeatured: false,
        showOnHomepage: false,
        isActive: true,
      });

      // Reload categories
      await loadCategories();

      // Select the newly created category
      onChange(newCategory.id);

      // Reset form and close dialog
      setCreateForm({ name: "", slug: "", description: "" });
      setCreateErrors({});
      setShowCreateDialog(false);
    } catch (error: any) {
      console.error("Failed to create category:", error);
      setCreateErrors({
        submit:
          error?.message || "Failed to create category. Please try again.",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setCreateForm({
      name: "",
      slug: "",
      description: "",
    });
    setShowCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
    setCreateForm({ name: "", slug: "", description: "" });
    setCreateErrors({});
  };

  const selectedCategory = categories.find((cat) => cat.id === value);

  return (
    <>
      <div className="flex items-center gap-1">
        <div className="flex-1 relative">
          <select
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled || loading}
            className={`w-full px-2 py-1.5 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              error ? "border-red-300" : "border-gray-300"
            } ${disabled ? "bg-gray-50 cursor-not-allowed" : ""}`}
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={handleOpenCreateDialog}
          disabled={disabled || loading}
          className="flex-shrink-0 p-1.5 rounded border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          title="Create new category"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Create Category Dialog */}
      {showCreateDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleCloseCreateDialog();
          }}
        >
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Create New Category
              </h3>
              <button
                type="button"
                onClick={handleCloseCreateDialog}
                disabled={creating}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Form */}
            <div className="px-6 py-4 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => {
                    setCreateForm((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }));
                    setCreateErrors((prev) => ({ ...prev, name: "" }));
                  }}
                  className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    createErrors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Electronics, Fashion"
                  maxLength={100}
                  autoFocus
                  disabled={creating}
                />
                {createErrors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {createErrors.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {createForm.name.length}/100 characters
                </p>
              </div>

              {/* Slug */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <SlugInput
                  sourceText={createForm.name}
                  value={createForm.slug}
                  onChange={(slug) => {
                    setCreateForm((prev) => ({ ...prev, slug }));
                    setCreateErrors((prev) => ({ ...prev, slug: "" }));
                  }}
                  error={createErrors.slug}
                  placeholder="auto-generated-slug"
                  disabled={creating}
                />
              </div>

              {/* Description (Optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  value={createForm.description}
                  onChange={(e) =>
                    setCreateForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Brief description of this category"
                  maxLength={500}
                  disabled={creating}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {createForm.description.length}/500 characters
                </p>
              </div>

              {/* Info */}
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-blue-800">
                  💡 This will create a new leaf category that can be used
                  immediately for products.
                </p>
              </div>

              {/* Submit Error */}
              {createErrors.submit && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                  <p className="text-xs text-red-600">{createErrors.submit}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleCloseCreateDialog}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creating}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {creating ? "Creating..." : "Create Category"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
