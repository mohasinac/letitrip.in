"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  FolderTree,
} from "lucide-react";
import { ViewToggle } from "@/components/seller/ViewToggle";
import { StatusBadge } from "@/components/common/StatusBadge";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useAuth } from "@/contexts/AuthContext";
import {
  InlineEditRow,
  QuickCreateRow,
  BulkActionBar,
  InlineImageUpload,
  TableCheckbox,
  InlineField,
  BulkAction,
} from "@/components/common/inline-edit";
import { getCategoryBulkActions } from "@/constants/bulk-actions";
import { categoriesService } from "@/services/categories.service";
import {
  CATEGORY_FIELDS,
  getFieldsForContext,
  toInlineFields,
} from "@/constants/form-fields";
import { validateForm } from "@/lib/form-validation";

interface Category {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  description?: string;
  image?: string;
  is_featured: boolean;
  show_on_homepage: boolean;
  is_active: boolean;
  sort_order?: number;
  created_at: string;
  updated_at: string;
}

export default function CategoriesPage() {
  const { user, isAdmin } = useAuth();
  const [view, setView] = useState<"grid" | "table">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Inline edit states
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  useEffect(() => {
    if (user && isAdmin) {
      loadCategories();
    }
  }, [user, isAdmin]);

  // Fields configuration for inline edit - using centralized config
  const baseFields = toInlineFields(
    getFieldsForContext(CATEGORY_FIELDS, "table")
  );

  // Update parent category options dynamically
  const fields: InlineField[] = baseFields.map((field) => {
    if (field.key === "parentId") {
      return {
        ...field,
        options: [
          { value: "", label: "None (Root Category)" },
          ...categories
            .filter((c) => c.id !== editingId) // Prevent self-parent
            .map((c) => ({
              value: c.id,
              label: c.name,
            })),
        ],
      };
    }
    return field;
  });

  // Bulk actions configuration
  const bulkActions = getCategoryBulkActions(selectedIds.length);

  // Bulk action handler
  const handleBulkAction = async (actionId: string) => {
    try {
      setActionLoading(true);
      // TODO: Implement bulk action API endpoint and add to categoriesService
      // For now, handle individual actions
      if (actionId === "delete") {
        await Promise.all(
          selectedIds.map(async (id) => {
            const category = categories.find((c) => c.id === id);
            if (category) {
              await categoriesService.delete(category.slug);
            }
          })
        );
      } else if (actionId === "activate" || actionId === "deactivate") {
        await Promise.all(
          selectedIds.map(async (id) => {
            const category = categories.find((c) => c.id === id);
            if (category) {
              await categoriesService.update(category.slug, {
                isActive: actionId === "activate",
              });
            }
          })
        );
      }

      await loadCategories();
      setSelectedIds([]);
    } catch (error) {
      console.error("Bulk action failed:", error);
      alert("Failed to perform bulk action");
    } finally {
      setActionLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoriesService.list();
      // Map Category type to component's expected format
      const mappedData = data.map((cat) => ({
        ...cat,
        parent_id: cat.parentId || null,
        is_featured: cat.isFeatured || false,
        show_on_homepage: cat.showOnHomepage || false,
        is_active: cat.isActive !== false,
        sort_order: cat.sortOrder || 0,
        created_at: cat.createdAt || new Date().toISOString(),
        updated_at: cat.updatedAt || new Date().toISOString(),
      }));
      setCategories(mappedData as any);
    } catch (error) {
      console.error("Failed to load categories:", error);
      setError(
        error instanceof Error ? error.message : "Failed to load categories"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const category = categories.find((c) => c.id === id);
      if (!category) return;

      await categoriesService.delete(category.slug);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      setDeleteId(null);
    } catch (error) {
      console.error("Failed to delete category:", error);
      alert(
        "Failed to delete category. It may have subcategories or products."
      );
    }
  };

  // Filter categories by search query
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate hierarchy level (for display)
  const getCategoryLevel = (category: Category): number => {
    if (!category.parent_id) return 0;
    const parent = categories.find((c) => c.id === category.parent_id);
    return parent ? getCategoryLevel(parent) + 1 : 0;
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            Access Denied
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Error</h3>
          <p className="mt-1 text-sm text-gray-500">{error}</p>
          <button
            onClick={loadCategories}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage product categories (Admin Only)
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <ViewToggle view={view} onViewChange={setView} />
          <Link
            href="/admin/categories/create"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Link>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <Filter className="h-4 w-4" />
          Filters
        </button>
      </div>

      {/* Grid View */}
      {view === "grid" && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="group relative rounded-lg border border-gray-200 bg-white overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="aspect-video bg-gray-100">
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    <FolderTree size={48} />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Level {getCategoryLevel(category)}
                    </p>
                  </div>
                  <StatusBadge
                    status={category.is_active ? "active" : "inactive"}
                  />
                </div>
                <div className="mt-3 flex items-center gap-2 text-sm">
                  {category.is_featured && (
                    <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                      Featured
                    </span>
                  )}
                  {category.show_on_homepage && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      Homepage
                    </span>
                  )}
                </div>
                {category.description && (
                  <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/admin/categories/${category.slug}/edit`}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="flex-1 rounded-lg bg-blue-600 px-3 py-2 text-center text-sm font-medium text-white hover:bg-blue-700"
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-16 z-10 mb-4">
          <BulkActionBar
            selectedCount={selectedIds.length}
            actions={bulkActions}
            onAction={handleBulkAction}
            onClearSelection={() => setSelectedIds([])}
            loading={actionLoading}
            resourceName="category"
          />
        </div>
      )}

      {/* Table View */}
      {view === "table" && (
        <div className="rounded-lg border border-gray-200 bg-white">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-3">
                    <TableCheckbox
                      checked={
                        selectedIds.length === filteredCategories.length &&
                        filteredCategories.length > 0
                      }
                      indeterminate={
                        selectedIds.length > 0 &&
                        selectedIds.length < filteredCategories.length
                      }
                      onChange={(checked) => {
                        setSelectedIds(
                          checked ? filteredCategories.map((c) => c.id) : []
                        );
                      }}
                      aria-label="Select all categories"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Parent
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Flags
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {/* Quick Create Row */}
                <QuickCreateRow
                  fields={fields}
                  onSave={async (values) => {
                    try {
                      // Validate form fields
                      const fieldsToValidate = getFieldsForContext(
                        CATEGORY_FIELDS,
                        "table"
                      );
                      const { isValid, errors } = validateForm(
                        values,
                        fieldsToValidate
                      );

                      if (!isValid) {
                        setValidationErrors(errors);
                        throw new Error("Please fix validation errors");
                      }

                      setValidationErrors({});

                      await categoriesService.create({
                        name: values.name,
                        slug: values.name.toLowerCase().replace(/\s+/g, "-"),
                        parentId: values.parent_id || null,
                        image: values.image || "",
                        isFeatured: values.is_featured || false,
                        showOnHomepage: values.show_on_homepage || false,
                        isActive: values.is_active !== false,
                        sortOrder: 0,
                      } as any);
                      await loadCategories();
                    } catch (error) {
                      console.error("Failed to create category:", error);
                      throw error;
                    }
                  }}
                  resourceName="category"
                  defaultValues={{
                    is_active: true,
                    is_featured: false,
                    show_on_homepage: false,
                    parent_id: "",
                  }}
                />

                {/* Category Rows */}
                {filteredCategories.map((category) => {
                  const isEditing = editingId === category.id;
                  const parentCategory = categories.find(
                    (c) => c.id === category.parent_id
                  );

                  if (isEditing) {
                    return (
                      <InlineEditRow
                        key={category.id}
                        fields={fields}
                        initialValues={{
                          image: category.image || "",
                          name: category.name,
                          parent_id: category.parent_id || "",
                          is_featured: category.is_featured,
                          show_on_homepage: category.show_on_homepage,
                          is_active: category.is_active,
                        }}
                        onSave={async (values) => {
                          try {
                            // Validate form fields
                            const fieldsToValidate = getFieldsForContext(
                              CATEGORY_FIELDS,
                              "table"
                            );
                            const { isValid, errors } = validateForm(
                              values,
                              fieldsToValidate
                            );

                            if (!isValid) {
                              setValidationErrors(errors);
                              throw new Error("Please fix validation errors");
                            }

                            setValidationErrors({});

                            await categoriesService.update(category.slug, {
                              name: values.name,
                              parentId: values.parent_id || null,
                              image: values.image || undefined,
                              isFeatured: values.is_featured,
                              showOnHomepage: values.show_on_homepage,
                              isActive: values.is_active,
                            });
                            await loadCategories();
                            setEditingId(null);
                          } catch (error) {
                            console.error("Failed to update category:", error);
                            throw error;
                          }
                        }}
                        onCancel={() => setEditingId(null)}
                        resourceName="category"
                      />
                    );
                  }

                  return (
                    <tr
                      key={category.id}
                      className="hover:bg-gray-50"
                      onDoubleClick={() => setEditingId(category.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <TableCheckbox
                          checked={selectedIds.includes(category.id)}
                          onChange={(checked) => {
                            setSelectedIds((prev) =>
                              checked
                                ? [...prev, category.id]
                                : prev.filter((id) => id !== category.id)
                            );
                          }}
                          aria-label={`Select ${category.name}`}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 flex-shrink-0 rounded bg-gray-100 flex items-center justify-center">
                            {category.image ? (
                              <img
                                src={category.image}
                                alt={category.name}
                                className="h-full w-full rounded object-cover"
                              />
                            ) : (
                              <FolderTree className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              /{category.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {parentCategory ? parentCategory.name : "Root"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge
                          status={category.is_active ? "active" : "inactive"}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {category.is_featured && (
                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700">
                              Featured
                            </span>
                          )}
                          {category.show_on_homepage && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                              Homepage
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/categories/${category.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded p-1.5 text-gray-600 hover:bg-gray-100"
                            title="View"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/categories/${category.slug}/edit`}
                            className="rounded p-1.5 text-blue-600 hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={() => setDeleteId(category.id)}
                            className="rounded p-1.5 text-red-600 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-12">
          <FolderTree className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {searchQuery ? "No categories found" : "No categories yet"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchQuery
              ? "Try adjusting your search query"
              : "Get started by creating a new category"}
          </p>
          {!searchQuery && (
            <div className="mt-6">
              <Link
                href="/admin/categories/create"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Create Category
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteId !== null}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        onConfirm={() => {
          if (deleteId) handleDelete(deleteId);
        }}
        onClose={() => setDeleteId(null)}
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  );
}
