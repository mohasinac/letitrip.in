"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import SlugInput from "@/components/common/SlugInput";
import RichTextEditor from "@/components/common/RichTextEditor";
import CategorySelector, {
  Category as CategoryType,
} from "@/components/common/CategorySelector";
import MediaUploader from "@/components/media/MediaUploader";
import { MediaFile } from "@/types/media";

interface CategoryFormProps {
  initialData?: {
    id?: string;
    name: string;
    slug: string;
    description?: string;
    parent_id?: string | null;
    image?: string;
    is_featured?: boolean;
    show_on_homepage?: boolean;
    is_active?: boolean;
    sort_order?: number;
    meta_title?: string;
    meta_description?: string;
  };
  mode: "create" | "edit";
}

export default function CategoryForm({ initialData, mode }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryType[]>([]);
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    parent_id: initialData?.parent_id || null,
    image: initialData?.image || "",
    is_featured: initialData?.is_featured || false,
    show_on_homepage: initialData?.show_on_homepage || false,
    is_active: initialData?.is_active !== false,
    sort_order: initialData?.sort_order || 0,
    meta_title: initialData?.meta_title || "",
    meta_description: initialData?.meta_description || "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load categories for CategorySelector
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await fetch("/api/categories");
        const result = await response.json();
        if (result.success && result.data) {
          const transformed = result.data.map((cat: any) => ({
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            parent_id: cat.parent_id,
            level: 0,
            has_children: false,
            is_active: cat.is_active,
          }));
          setCategories(transformed);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
      }
    };
    loadCategories();
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const url =
        mode === "create"
          ? "/api/categories"
          : `/api/categories/${initialData?.slug}`;

      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Failed to save category");
      }

      // Redirect to categories list
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      console.error("Failed to save category:", error);
      setErrors({
        submit:
          error instanceof Error
            ? error.message
            : "Failed to save category. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (files: MediaFile[]) => {
    if (files.length > 0) {
      // Use preview for new uploads, will be replaced with actual URL after upload
      setFormData((prev) => ({ ...prev, image: files[0].preview || "" }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Basic Information
        </h2>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
              setErrors((prev) => ({ ...prev, name: "" }));
            }}
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.name ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Electronics, Fashion, etc."
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            URL Slug *
          </label>
          <SlugInput
            sourceText={formData.name}
            value={formData.slug}
            onChange={(slug) => {
              setFormData((prev) => ({ ...prev, slug }));
              setErrors((prev) => ({ ...prev, slug: "" }));
            }}
            error={errors.slug}
            placeholder="auto-generated-slug"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <RichTextEditor
            value={formData.description}
            onChange={(html) =>
              setFormData((prev) => ({ ...prev, description: html }))
            }
            placeholder="Enter category description..."
          />
        </div>

        {/* Parent Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parent Category
          </label>
          <CategorySelector
            categories={categories}
            value={formData.parent_id}
            onChange={(parent_id) =>
              setFormData((prev) => ({ ...prev, parent_id: parent_id || null }))
            }
            placeholder="Select parent category (optional)"
            allowParentSelection={true}
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to create a root level category
          </p>
        </div>

        {/* Sort Order */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort Order
          </label>
          <input
            type="number"
            value={formData.sort_order}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                sort_order: parseInt(e.target.value) || 0,
              }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="0"
            min="0"
          />
          <p className="mt-1 text-sm text-gray-500">
            Lower numbers appear first
          </p>
        </div>
      </div>

      {/* Image */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Category Image</h2>

        <MediaUploader
          accept="image"
          maxFiles={1}
          multiple={false}
          resourceType="category"
          onFilesAdded={handleImageUpload}
          files={
            formData.image
              ? [
                  {
                    id: "current",
                    file: new File([], ""),
                    type: "image" as const,
                    source: "file" as const,
                    preview: formData.image,
                    uploadStatus: "completed" as const,
                    uploadProgress: 100,
                    metadata: {
                      slug: "",
                      description: "",
                      size: 0,
                      mimeType: "image/jpeg",
                    },
                  },
                ]
              : []
          }
        />
      </div>

      {/* Display Options */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Display Options</h2>

        <div className="space-y-4">
          {/* Active */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_active: e.target.checked,
                }))
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">Active</div>
              <div className="text-sm text-gray-500">
                Make this category visible to customers
              </div>
            </div>
          </label>

          {/* Featured */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  is_featured: e.target.checked,
                }))
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">Featured</div>
              <div className="text-sm text-gray-500">
                Highlight this category in featured sections
              </div>
            </div>
          </label>

          {/* Show on Homepage */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.show_on_homepage}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  show_on_homepage: e.target.checked,
                }))
              }
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <div className="text-sm font-medium text-gray-900">
                Show on Homepage
              </div>
              <div className="text-sm text-gray-500">
                Display this category on the homepage
              </div>
            </div>
          </label>
        </div>
      </div>

      {/* SEO Metadata */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">SEO Metadata</h2>

        {/* Meta Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Title
          </label>
          <input
            type="text"
            value={formData.meta_title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SEO title (defaults to category name)"
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.meta_title.length} / 60 characters
          </p>
        </div>

        {/* Meta Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Description
          </label>
          <textarea
            value={formData.meta_description}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                meta_description: e.target.value,
              }))
            }
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="SEO description"
          />
          <p className="mt-1 text-sm text-gray-500">
            {formData.meta_description.length} / 160 characters
          </p>
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          disabled={loading}
        >
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode === "create" ? "Create Category" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
