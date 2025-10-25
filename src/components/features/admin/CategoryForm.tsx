"use client";

import { useState, useEffect } from "react";
import { Category, CategoryFormData, CategorySEO } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import { apiClient } from "@/lib/api/client";

interface CategoryFormProps {
  category?: Category | null;
  allCategories: Category[];
  onSubmit: () => void;
  onCancel: () => void;
}

export default function CategoryForm({
  category,
  allCategories,
  onSubmit,
  onCancel,
}: CategoryFormProps) {
  const { user } = useAuth();
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    image: "",
    icon: "",
    parentId: "",
    isActive: true,
    featured: false,
    sortOrder: 0,
    seo: {
      metaTitle: "",
      metaDescription: "",
      altText: "",
      keywords: [],
    },
  });

  const [loading, setLoading] = useState(false);
  const [slugLoading, setSlugLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string>("");
  const [currentTab, setCurrentTab] = useState<"basic" | "seo" | "advanced">(
    "basic"
  );

  // Initialize form data
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        icon: category.icon || "",
        parentId: category.parentId || "",
        isActive: category.isActive,
        featured: category.featured,
        sortOrder: category.sortOrder,
        seo: category.seo || {
          metaTitle: "",
          metaDescription: "",
          altText: "",
          keywords: [],
        },
      });
      setImagePreview(category.image || "");
    }
  }, [category]);

  // Get available parent categories (excluding self and descendants)
  const getAvailableParents = () => {
    if (!category) return allCategories;

    return allCategories.filter((cat) => {
      // Exclude self
      if (cat.id === category.id) return false;

      // Exclude descendants (categories that have this category in their parentIds)
      if (cat.parentIds?.includes(category.id)) return false;

      return true;
    });
  };

  const handleInputChange = (field: keyof CategoryFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Auto-generate slug from name
    if (field === "name" && value && !category) {
      generateSlug(value);
    }
  };

  const handleSEOChange = (field: keyof CategorySEO, value: any) => {
    setFormData((prev) => ({
      ...prev,
      seo: {
        ...prev.seo!,
        [field]: value,
      },
    }));
  };

  const generateSlug = async (name: string) => {
    if (!name.trim()) return;

    setSlugLoading(true);
    try {
      const response = await fetch("/api/admin/categories/validate-slug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, excludeId: category?.id }),
      });

      const result = await response.json();
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          slug: result.data.slug,
        }));
      }
    } catch (error) {
      console.error("Failed to generate slug:", error);
    } finally {
      setSlugLoading(false);
    }
  };

  const validateSlug = async (slug: string) => {
    if (!slug.trim()) return;

    try {
      const searchParams = new URLSearchParams();
      searchParams.append("slug", slug);
      if (category?.id) {
        searchParams.append("excludeId", category.id);
      }

      const response = await fetch(
        `/api/admin/categories/validate-slug?${searchParams}`
      );
      const result = await response.json();

      if (result.success && !result.data.available) {
        setErrors((prev) => ({
          ...prev,
          slug: "This slug is already taken",
        }));
      }
    } catch (error) {
      console.error("Failed to validate slug:", error);
    }
  };

  const handleImageUpload = async (file: File) => {
    if (!file) return;

    try {
      setLoading(true);

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("type", "category");
      if (category?.id) {
        uploadFormData.append("categoryId", category.id);
      }

      // Note: apiClient doesn't support FormData yet, use fetch
      const token = user?.getIdToken ? await user.getIdToken() : "";
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: uploadFormData,
      });

      const result = await response.json();
      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          image: result.data.url,
        }));
        setImagePreview(result.data.url);
      } else {
        alert(result.error || "Failed to upload image");
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
      alert("Failed to upload image");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      if (category) {
        const result = (await apiClient.put(
          `/admin/categories/${category.id}`,
          formData
        )) as any;

        if (result.success) {
          onSubmit();
        } else {
          alert(result.error || "Failed to update category");
        }
      } else {
        const result = (await apiClient.post(
          "/admin/categories",
          formData
        )) as any;

        if (result.success) {
          onSubmit();
        } else {
          alert(result.error || "Failed to create category");
        }
      }
    } catch (error) {
      console.error("Failed to save category:", error);
      alert("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const availableParents = getAvailableParents();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              {category ? "Edit Category" : "Create Category"}
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-6 py-4 border-b border-gray-200">
          <nav className="flex space-x-8">
            <button
              onClick={() => setCurrentTab("basic")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === "basic"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Basic Information
            </button>
            <button
              onClick={() => setCurrentTab("seo")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === "seo"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              SEO & Meta
            </button>
            <button
              onClick={() => setCurrentTab("advanced")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                currentTab === "advanced"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Advanced Settings
            </button>
          </nav>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            {/* Basic Information Tab */}
            {currentTab === "basic" && (
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className={`input ${errors.name ? "border-red-300" : ""}`}
                    placeholder="Enter category name"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Slug *
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) =>
                        handleInputChange("slug", e.target.value)
                      }
                      onBlur={(e) => validateSlug(e.target.value)}
                      className={`input ${errors.slug ? "border-red-300" : ""}`}
                      placeholder="category-slug"
                    />
                    {slugLoading && (
                      <div className="ml-2 flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      </div>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    URL-friendly version of the name. Only lowercase letters,
                    numbers, and hyphens.
                  </p>
                  {errors.slug && (
                    <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    className="input"
                    placeholder="Brief description of the category"
                  />
                </div>

                {/* Parent Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parent Category
                  </label>
                  <select
                    value={formData.parentId}
                    onChange={(e) =>
                      handleInputChange("parentId", e.target.value)
                    }
                    className="input"
                  >
                    <option value="">No Parent (Root Category)</option>
                    {availableParents.map((parent) => (
                      <option key={parent.id} value={parent.id}>
                        {"  ".repeat(parent.level)}
                        {parent.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category Image
                  </label>
                  <div className="flex items-center space-x-4">
                    {imagePreview && (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary-dark"
                    />
                  </div>
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon (HTML/Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => handleInputChange("icon", e.target.value)}
                    className="input"
                    placeholder="🏠 or <i class='fas fa-home'></i>"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    You can use emoji or HTML icon code
                  </p>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {currentTab === "seo" && (
              <div className="space-y-6">
                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Title
                  </label>
                  <input
                    type="text"
                    value={formData.seo?.metaTitle || ""}
                    onChange={(e) =>
                      handleSEOChange("metaTitle", e.target.value)
                    }
                    className="input"
                    placeholder="SEO title for search engines"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Recommended: 50-60 characters
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Meta Description
                  </label>
                  <textarea
                    value={formData.seo?.metaDescription || ""}
                    onChange={(e) =>
                      handleSEOChange("metaDescription", e.target.value)
                    }
                    rows={3}
                    className="input"
                    placeholder="SEO description for search engines"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Recommended: 150-160 characters
                  </p>
                </div>

                {/* Alt Text */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Alt Text
                  </label>
                  <input
                    type="text"
                    value={formData.seo?.altText || ""}
                    onChange={(e) => handleSEOChange("altText", e.target.value)}
                    className="input"
                    placeholder="Descriptive text for category image"
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    value={formData.seo?.keywords?.join(", ") || ""}
                    onChange={(e) =>
                      handleSEOChange(
                        "keywords",
                        e.target.value
                          .split(",")
                          .map((k) => k.trim())
                          .filter(Boolean)
                      )
                    }
                    className="input"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Separate keywords with commas
                  </p>
                </div>
              </div>
            )}

            {/* Advanced Settings Tab */}
            {currentTab === "advanced" && (
              <div className="space-y-6">
                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) =>
                      handleInputChange(
                        "sortOrder",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="input"
                    min="0"
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Lower numbers appear first
                  </p>
                </div>

                {/* Status Toggles */}
                <div className="space-y-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) =>
                        handleInputChange("isActive", e.target.checked)
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Active</span>
                    <span className="ml-2 text-xs text-gray-500">
                      (Category is visible and can be used)
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.featured}
                      onChange={(e) =>
                        handleInputChange("featured", e.target.checked)
                      }
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">Featured</span>
                    <span className="ml-2 text-xs text-gray-500">
                      (Show in featured categories section)
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : category ? (
                "Update Category"
              ) : (
                "Create Category"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
