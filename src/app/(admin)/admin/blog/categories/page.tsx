"use client";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LoadingSpinner } from "@/components/admin/LoadingSpinner";
import { toast } from "@/components/admin/Toast";
import { ConfirmDialog } from "@letitrip/react-library";
import { FormInput } from "@letitrip/react-library";
import { FormSelect } from "@letitrip/react-library";
import { FormTextarea } from "@letitrip/react-library";
import { useAuth } from "@/contexts/AuthContext";
import { useLoadingState } from "@letitrip/react-library";
import { logError } from "@/lib/firebase-error-logger";
import { apiService } from "@/services/api.service";
import {
  AlertCircle,
  Edit,
  FileText,
  Folder,
  FolderOpen,
  GripVertical,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Types
interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  postCount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Category form modal
function CategoryModal({
  isOpen,
  onClose,
  category,
  categories,
  onSave,
  saving,
}: {
  isOpen: boolean;
  onClose: () => void;
  category: BlogCategory | null;
  categories: BlogCategory[];
  onSave: (data: Partial<BlogCategory>) => void;
  saving: boolean;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [parentId, setParentId] = useState<string>("");

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSlug(category.slug);
      setDescription(category.description || "");
      setParentId(category.parentId || "");
    } else {
      setName("");
      setSlug("");
      setDescription("");
      setParentId("");
    }
  }, [category, isOpen]);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!category) {
      setSlug(generateSlug(value));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      slug,
      description: description || undefined,
      parentId: parentId || undefined,
    });
  };

  if (!isOpen) return null;

  // Filter out current category and its children from parent options
  const availableParents = categories.filter(
    (c) => c.id !== category?.id && c.parentId !== category?.id,
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {category ? "Edit Category" : "Add Category"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <FormInput
            label="Name"
            required
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="Category name"
          />

          <FormInput
            label="Slug"
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="category-slug"
            helperText="URL-friendly identifier (auto-generated from name)"
          />

          <FormTextarea
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Brief description of this category"
          />

          <FormSelect
            label="Parent Category"
            value={parentId}
            onChange={(e) => setParentId(e.target.value)}
            placeholder="None (Top Level)"
            options={availableParents.map((cat) => ({
              value: cat.id,
              label: cat.name,
            }))}
          />

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim() || !slug.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {category ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Category row component
function CategoryRow({
  category,
  categories,
  onEdit,
  onDelete,
  level = 0,
}: {
  category: BlogCategory;
  categories: BlogCategory[];
  onEdit: (category: BlogCategory) => void;
  onDelete: (id: string) => void;
  level?: number;
}) {
  const children = categories.filter((c) => c.parentId === category.id);

  return (
    <>
      <tr className="hover:bg-gray-50 transition-colors">
        <td className="px-4 py-3">
          <div
            className="flex items-center gap-2"
            style={{ marginLeft: level * 24 }}
          >
            <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
            {children.length > 0 ? (
              <FolderOpen className="h-5 w-5 text-blue-500" />
            ) : (
              <Folder className="h-5 w-5 text-gray-400" />
            )}
            <span className="font-medium text-gray-900">{category.name}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
            {category.slug}
          </code>
        </td>
        <td className="px-4 py-3">
          <span className="text-gray-600 text-sm line-clamp-1">
            {category.description || "-"}
          </span>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1 text-sm">
            <FileText className="h-4 w-4 text-gray-400" />
            <span>{category.postCount}</span>
          </div>
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => onEdit(category)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title="Edit"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(category.id)}
              disabled={category.postCount > 0}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded disabled:opacity-30 disabled:cursor-not-allowed"
              title={
                category.postCount > 0
                  ? "Cannot delete category with posts"
                  : "Delete"
              }
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>
      {children.map((child) => (
        <CategoryRow
          key={child.id}
          category={child}
          categories={categories}
          onEdit={onEdit}
          onDelete={onDelete}
          level={level + 1}
        />
      ))}
    </>
  );
}

export default function BlogCategoriesPage() {
  const { isAdmin } = useAuth();
  const {
    isLoading: loading,
    error,
    data: categories,
    setData: setCategories,
    execute,
  } = useLoadingState<BlogCategory[]>({
    initialData: [],
    onLoadError: (error) => {
      logError(error, { component: "BlogCategoriesPage.loadCategories" });
      toast.error("Failed to load blog categories");
    },
  });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<BlogCategory | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = () =>
    execute(async () => {
      const response = await apiService.get<{ data: BlogCategory[] }>(
        "/blog/categories",
      );
      setCategories(
        response.data || [
          {
            id: "1",
            name: "Guides",
            slug: "guides",
            description: "How-to guides and tutorials",
            postCount: 12,
            order: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "2",
            name: "News",
            slug: "news",
            description: "Latest platform news and updates",
            postCount: 8,
            order: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: "3",
            name: "Tips & Tricks",
            slug: "tips-tricks",
            description: "Helpful tips for buyers and sellers",
            postCount: 15,
            order: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      );
    });

  const handleSave = async (data: Partial<BlogCategory>) => {
    try {
      setSaving(true);

      if (editCategory) {
        // Update existing
        await apiService.patch(`/blog/categories/${editCategory.id}`, data);
        if (categories) {
          setCategories(
            categories.map((c: BlogCategory) =>
              c.id === editCategory.id
                ? ({ ...c, ...data } as BlogCategory)
                : c,
            ),
          );
        }
        toast.success("Category updated successfully");
      } else {
        // Create new
        const response = await apiService.post<{ data: BlogCategory }>(
          "/blog/categories",
          data,
        );
        if (categories) {
          setCategories([
            ...categories,
            response.data ||
              ({
                ...data,
                id: Date.now().toString(),
                postCount: 0,
              } as BlogCategory),
          ]);
        }
        toast.success("Category created successfully");
      }

      setModalOpen(false);
      setEditCategory(null);
    } catch (error) {
      console.error("Failed to save category:", error);
      toast.error("Failed to save category");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await apiService.delete(`/blog/categories/${deleteId}`);
      if (categories) {
        setCategories(
          categories.filter((c: BlogCategory) => c.id !== deleteId),
        );
      }
      toast.success("Category deleted successfully");
    } catch (error) {
      console.error("Failed to delete category:", error);
      toast.error("Failed to delete category");
    } finally {
      setDeleteId(null);
    }
  };

  const openEditModal = (category: BlogCategory) => {
    setEditCategory(category);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditCategory(null);
    setModalOpen(true);
  };

  // Filter categories
  const filteredCategories =
    categories && searchQuery.trim()
      ? categories.filter(
          (c) =>
            c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            c.slug.toLowerCase().includes(searchQuery.toLowerCase()),
        )
      : categories;

  // Get root categories
  const rootCategories = filteredCategories?.filter((c) => !c.parentId) ?? [];

  // Stats
  const totalPosts = categories?.reduce((sum, c) => sum + c.postCount, 0) ?? 0;

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
    return <LoadingSpinner fullScreen message="Loading categories..." />;
  }

  return (
    <>
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Category"
        description="Are you sure you want to delete this category? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
      />

      <CategoryModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditCategory(null);
        }}
        category={editCategory}
        categories={categories || []}
        onSave={handleSave}
        saving={saving}
      />

      <div className="space-y-6">
        <AdminPageHeader
          title="Blog Categories"
          description="Organize blog posts into categories"
          actions={
            <>
              <Link
                href="/admin/blog"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <FileText className="h-4 w-4" />
                All Posts
              </Link>
              <button
                onClick={openCreateModal}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
                Add Category
              </button>
            </>
          }
        />

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Categories</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {categories?.length ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Root Categories</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {categories?.filter((c) => !c.parentId).length ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Sub Categories</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {categories?.filter((c) => c.parentId).length ?? 0}
            </p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Posts</p>
            <p className="text-2xl font-bold text-gray-900 mt-1">
              {totalPosts}
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search categories..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Slug
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Posts
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rootCategories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center">
                      <Folder className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                      <p className="font-medium text-gray-900">
                        No categories found
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchQuery
                          ? "Try a different search term"
                          : "Create your first blog category"}
                      </p>
                      {!searchQuery && (
                        <button
                          onClick={openCreateModal}
                          className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4" />
                          Add Category
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  rootCategories.map((category) => (
                    <CategoryRow
                      key={category.id}
                      category={category}
                      categories={filteredCategories || []}
                      onEdit={openEditModal}
                      onDelete={(id) => setDeleteId(id)}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help text */}
        <div className="bg-blue-50 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Managing Categories</p>
            <p className="mt-1">
              Categories help organize your blog posts. You can create nested
              categories for better organization. Categories with posts cannot
              be deleted.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
