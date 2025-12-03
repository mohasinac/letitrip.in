"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Loader2 } from "lucide-react";
import CategorySelector, {
  Category as CategoryType,
} from "@/components/common/CategorySelector";
import SlugInput from "@/components/common/SlugInput";
import { FormInput, FormTextarea, FormLabel } from "@/components/forms";
import { categoriesService } from "@/services/categories.service";
import { logError } from "@/lib/firebase-error-logger";
import {
  VALIDATION_RULES,
  VALIDATION_MESSAGES,
} from "@/constants/validation-messages";
import { useLoadingState } from "@/hooks/useLoadingState";
import { useDebounce } from "@/hooks/useDebounce";

interface CategorySelectorWithCreateProps {
  value: string | null;
  onChange: (categoryId: string | null, category: CategoryType | null) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  required?: boolean;
  onCategoryCreated?: (category: CategoryType) => void; // Callback when new category is created
}

export default function CategorySelectorWithCreate({
  value,
  onChange,
  error,
  disabled = false,
  placeholder = "Select a category",
  className = "",
  required = false,
  onCategoryCreated,
}: CategorySelectorWithCreateProps) {
  const {
    isLoading: loading,
    data: categories,
    setData: setCategories,
    execute,
  } = useLoadingState<CategoryType[]>({
    initialData: [],
    onLoadError: (error) => {
      logError(error, {
        context: "CategorySelectorWithCreate.loadCategories",
      });
    },
  });

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [refreshKey, setRefreshKey] = useState(0);

  // Create category form state
  const [createForm, setCreateForm] = useState({
    name: "",
    slug: "",
    description: "",
  });
  const [createErrors, setCreateErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadCategories();
  }, [refreshKey]);

  const loadCategories = () =>
    execute(async () => {
      const response = await categoriesService.list({
        isActive: true,
        _t: Date.now(),
      });
      return response.data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        parent_id: cat.parentId || null,
        parentIds: cat.parentIds || [],
        childrenIds: cat.childrenIds || [],
        level: cat.level || 0,
        has_children:
          !cat.isLeaf && (cat.childrenIds?.length > 0 || cat.hasChildren),
        is_active: cat.isActive !== false,
        product_count: cat.productCount || 0,
      }));
    });

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
        featured: false,
        isActive: true,
      });

      // Transform the newly created category
      const transformedCategory: CategoryType = {
        id: newCategory.id,
        name: newCategory.name,
        slug: newCategory.slug,
        parent_id: null,
        level: 0,
        has_children: false,
        is_active: true,
      };

      // Trigger refresh to reload all categories
      setRefreshKey((prev) => prev + 1);

      // Call parent callback if provided
      if (onCategoryCreated) {
        onCategoryCreated(transformedCategory);
      }

      // Select the newly created category
      onChange(newCategory.id, transformedCategory);

      // Reset form and close dialog
      setCreateForm({ name: "", slug: "", description: "" });
      setCreateErrors({});
      setShowCreateDialog(false);
      setSearchQuery("");
    } catch (error: any) {
      logError(error as Error, {
        context: "CategorySelectorWithCreate.createCategory",
      });
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
      name: searchQuery,
      slug: searchQuery.toLowerCase().replace(/\s+/g, "-"),
      description: "",
    });
    setShowCreateDialog(true);
  };

  const handleCloseCreateDialog = () => {
    setShowCreateDialog(false);
    setCreateForm({ name: "", slug: "", description: "" });
    setCreateErrors({});
  };

  if (loading) {
    return (
      <div className={`relative ${className}`}>
        <div className="flex items-center gap-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm bg-gray-50">
          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          <span className="text-gray-400">Loading categories...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative ${className}`}>
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <CategorySelector
              categories={categories}
              value={value}
              onChange={(id, cat) => {
                onChange(id, cat);
                setSearchQuery("");
              }}
              placeholder={placeholder}
              disabled={disabled}
              error={error}
              allowParentSelection={false}
            />
          </div>
          <button
            type="button"
            onClick={handleOpenCreateDialog}
            disabled={disabled}
            className="flex-shrink-0 p-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Create new category"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Create Category Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
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
              <FormInput
                id="create-category-name"
                label="Category Name"
                required={required}
                value={createForm.name}
                onChange={(e) => {
                  setCreateForm((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }));
                  setCreateErrors((prev) => ({ ...prev, name: "" }));
                }}
                error={createErrors.name}
                placeholder="e.g., Electronics, Fashion"
                maxLength={100}
                showCharCount
                autoFocus
                disabled={creating}
              />

              {/* Slug */}
              <div>
                <FormLabel required={required}>URL Slug</FormLabel>
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
              <FormTextarea
                id="create-category-description"
                label="Description"
                helperText="Optional brief description of this category"
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Brief description of this category"
                maxLength={500}
                showCharCount
                disabled={creating}
              />

              {/* Info */}
              <div className="rounded-lg bg-blue-50 p-3">
                <p className="text-xs text-blue-800">
                  💡 This will create a new leaf category that can be used
                  immediately for products. Only required fields are shown.
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
