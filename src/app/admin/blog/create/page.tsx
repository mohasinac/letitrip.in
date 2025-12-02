"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import OptimizedImage from "@/components/common/OptimizedImage";
import { ArrowLeft, Save, Eye, Loader2, Upload, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import RichTextEditor from "@/components/common/RichTextEditor";
import {
  FormInput,
  FormTextarea,
  FormLabel,
  FormSelect,
} from "@/components/forms";
import { blogService } from "@/services/blog.service";
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";

export default function CreateBlogPostPage() {
  const router = useRouter();
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "",
    tags: [] as string[],
    status: "draft" as "draft" | "published",
    featured: false,
  });

  const [tagInput, setTagInput] = useState("");
  const [customCategory, setCustomCategory] = useState("");

  // Media upload
  const { getUploadedUrls, isUploading, uploadMedia, cleanupUploadedMedia } =
    useMediaUploadWithCleanup();
  const uploadedUrls = getUploadedUrls();

  const categories = [
    "News",
    "Guides",
    "Updates",
    "Tips",
    "Events",
    "Announcements",
    "Tutorials",
    "Reviews",
  ];

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));

    // Auto-generate slug from title
    if (name === "title") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }

    // Clear error for field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        featuredImage: "Please select a valid image file",
      }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        featuredImage: "Image size must be less than 5MB",
      }));
      return;
    }

    try {
      await uploadMedia(file, "product"); // Use product context for blog images
      setErrors((prev) => ({ ...prev, featuredImage: "" }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        featuredImage:
          error instanceof Error ? error.message : "Failed to upload image",
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required";
    }
    if (!formData.excerpt.trim()) {
      newErrors.excerpt = "Excerpt is required";
    }
    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }
    if (!formData.category && !customCategory) {
      newErrors.category = "Category is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (status: "draft" | "published") => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const category = customCategory || formData.category;

      await blogService.create({
        ...formData,
        category,
        status,
        featuredImage: uploadedUrls[0],
        publishedAt: status === "published" ? new Date() : undefined,
      });

      // Don't cleanup on success - blog post now owns the images
      router.push("/admin/blog");
    } catch (error) {
      console.error("Failed to create blog post:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to create blog post"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.content || uploadedUrls.length > 0) {
      if (
        confirm(
          "Are you sure you want to cancel? All unsaved changes will be lost."
        )
      ) {
        cleanupUploadedMedia();
        router.push("/admin/blog");
      }
    } else {
      router.push("/admin/blog");
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Access Denied</p>
          <p className="text-gray-500 text-sm">
            You must be an admin to access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/blog"
            className="rounded p-2 hover:bg-gray-100"
            title="Back to blog posts"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Create Blog Post
            </h1>
            <p className="text-sm text-gray-600">
              Write and publish a new blog post
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-6">
        {/* Title */}
        <FormInput
          label="Title"
          required
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="Enter post title"
          error={errors.title}
        />

        {/* Slug */}
        <FormInput
          label="Slug"
          required
          name="slug"
          value={formData.slug}
          onChange={handleInputChange}
          placeholder="post-slug"
          error={errors.slug}
          helperText={`URL: /blog/${formData.slug || "post-slug"}`}
        />

        {/* Excerpt */}
        <FormTextarea
          label="Excerpt"
          required
          name="excerpt"
          value={formData.excerpt}
          onChange={handleInputChange}
          rows={3}
          placeholder="Brief description of the post (shown in listings)"
          error={errors.excerpt}
        />

        {/* Featured Image */}
        <div>
          <FormLabel>Featured Image</FormLabel>
          {uploadedUrls.length > 0 ? (
            <div className="relative inline-block h-48">
              <OptimizedImage
                src={uploadedUrls[0]}
                alt="Featured"
                width={300}
                height={192}
                className="rounded-lg border border-gray-300"
              />
              <button
                onClick={() => cleanupUploadedMedia()}
                className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 hover:bg-gray-100">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                {isUploading ? "Uploading..." : "Click to upload image"}
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PNG, JPG up to 5MB
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploading}
              />
            </label>
          )}
          {errors.featuredImage && (
            <p className="mt-1 text-sm text-red-600">{errors.featuredImage}</p>
          )}
        </div>

        {/* Content */}
        <div>
          <FormLabel required>Content</FormLabel>
          <RichTextEditor
            value={formData.content}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, content: value }))
            }
            placeholder="Write your blog post content here..."
            minHeight={400}
            error={errors.content}
          />
        </div>

        {/* Category */}
        <div>
          <FormLabel required>Category</FormLabel>
          <div className="flex gap-2">
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`flex-1 rounded-lg border ${
                errors.category ? "border-red-500" : "border-gray-300"
              } px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500`}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat.toLowerCase()}>
                  {cat}
                </option>
              ))}
            </select>
            <span className="text-gray-500 self-center">or</span>
            <input
              type="text"
              placeholder="Custom category"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
          </div>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">{errors.category}</p>
          )}
        </div>

        {/* Tags */}
        <div>
          <FormLabel>Tags</FormLabel>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) =>
                e.key === "Enter" && (e.preventDefault(), handleAddTag())
              }
              placeholder="Add tag and press Enter"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              Add
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-sm text-purple-700"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-purple-900"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              checked={formData.featured}
              onChange={handleInputChange}
              className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
            />
            <span className="text-sm text-gray-700">
              Feature this post (show in featured sections and homepage)
            </span>
          </label>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-gray-200 pt-6">
        <button
          onClick={handleCancel}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          disabled={loading}
        >
          Cancel
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => handleSubmit("draft")}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save as Draft
          </button>
          <button
            onClick={() => handleSubmit("published")}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            Publish
          </button>
        </div>
      </div>
    </div>
  );
}
