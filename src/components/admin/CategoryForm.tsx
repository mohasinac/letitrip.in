"use client";

import CategorySelector, {
  Category as CategoryType,
} from "@/components/common/CategorySelector";
import OptimizedImage from "@/components/common/OptimizedImage";
import RichTextEditor from "@/components/common/RichTextEditor";
import SlugInput from "@/components/common/SlugInput";
import { FormField } from "@/components/forms/FormField";
import { FormInput } from "@/components/forms/FormInput";
import { FormLabel } from "@/components/forms/FormLabel";
import { FormTextarea } from "@/components/forms/FormTextarea";
import MediaUploader from "@/components/media/MediaUploader";
import { Card } from "@/components/ui/Card";
import { Checkbox } from "@/components/ui/Checkbox";
import { FormActions } from "@/components/ui/FormActions";
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";
import { logError } from "@/lib/firebase-error-logger";
import { categoriesService } from "@/services/categories.service";
import { MediaFile } from "@/types/media";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
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

  const {
    uploadMedia,
    cleanupUploadedMedia,
    clearTracking,
    confirmNavigation,
    isUploading,
    isCleaning,
    hasUploadedMedia,
  } = useMediaUploadWithCleanup({
    enableNavigationGuard: true,
    navigationGuardMessage: "You have uploaded an image. Leave and delete?",
    onUploadSuccess: (url) => {
      setFormData((prev) => ({ ...prev, image: url }));
    },
    onUploadError: (error) => {
      setErrors((prev) => ({ ...prev, image: `Upload failed: ${error}` }));
    },
    onCleanupComplete: () => {
      setUploadedFiles([]);
    },
  });

  // Load categories for CategorySelector
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await categoriesService.list();
        const transformed = response.data.map((cat: any) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          parent_id: cat.parent_id,
          level: 0,
          has_children: false,
          is_active: cat.is_active,
        }));
        setCategories(transformed);
      } catch (error) {
        logError(error as Error, {
          component: "CategoryForm.loadCategories",
        });
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

      if (mode === "create") {
        await categoriesService.create(formData as any);
      } else {
        await categoriesService.update(
          initialData?.slug || "",
          formData as any,
        );
      }

      // Success! Clear tracking
      clearTracking();

      // Redirect to categories list
      router.push("/admin/categories");
      router.refresh();
    } catch (error) {
      logError(error as Error, {
        component: "CategoryForm.handleSubmit",
        metadata: { formData, isEdit: !!initialData },
      });

      // Failure! Clean up uploaded media
      if (hasUploadedMedia) {
        await cleanupUploadedMedia();
        setFormData((prev) => ({ ...prev, image: initialData?.image || "" }));
      }

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

  const handleImageUpload = async (files: MediaFile[]) => {
    if (files.length === 0) return;

    setUploadedFiles(files);

    try {
      await uploadMedia(files[0].file, "category");
    } catch (error) {
      logError(error as Error, {
        component: "CategoryForm.handleImageUpload",
        metadata: { fileName: files[0].file.name },
      });
    }
  };

  const handleCancel = async () => {
    if (hasUploadedMedia) {
      await confirmNavigation(() => router.back());
    } else {
      router.back();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card title="Basic Information">
        <div className="space-y-4">
          {/* Name */}
          <FormField label="Category Name" required error={errors.name}>
            <FormInput
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                setErrors((prev) => ({ ...prev, name: "" }));
              }}
              placeholder="Electronics, Fashion, etc."
              disabled={loading}
            />
          </FormField>

          {/* Slug */}
          <div id="category-slug-wrapper">
            <FormLabel htmlFor="category-slug-wrapper" required>
              URL Slug
            </FormLabel>
            <SlugInput
              sourceText={formData.name}
              value={formData.slug}
              onChange={(slug) => {
                setFormData((prev) => ({ ...prev, slug }));
                setErrors((prev) => ({ ...prev, slug: "" }));
              }}
              error={errors.slug}
              placeholder="auto-generated-slug"
              disabled={loading}
              showPreview={true}
              allowManualEdit={true}
            />
          </div>

          {/* Description */}
          <div id="category-description-wrapper">
            <FormLabel htmlFor="category-description-wrapper">
              Description
            </FormLabel>
            <RichTextEditor
              value={formData.description}
              onChange={(html) =>
                setFormData((prev) => ({ ...prev, description: html }))
              }
              placeholder="Enter category description..."
            />
          </div>

          {/* Parent Category */}
          <div id="parent-category-wrapper">
            <FormLabel htmlFor="parent-category-wrapper">
              Parent Category
            </FormLabel>
            <CategorySelector
              categories={categories}
              value={formData.parent_id}
              onChange={(parent_id) =>
                setFormData((prev) => ({
                  ...prev,
                  parent_id: parent_id || null,
                }))
              }
              placeholder="Select parent category (optional)"
              allowParentSelection={true}
            />
            <p className="mt-1 text-sm text-gray-500">
              Leave empty to create a root level category
            </p>
          </div>

          {/* Sort Order */}
          <FormField label="Sort Order" hint="Lower numbers appear first">
            <FormInput
              type="number"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sort_order: parseInt(e.target.value) || 0,
                }))
              }
              placeholder="0"
              min={0}
              disabled={loading}
            />
          </FormField>
        </div>
      </Card>

      {/* Image */}
      <Card title="Category Image">
        <div className="space-y-4">
          {formData.image && !uploadedFiles.length && (
            <div className="relative w-full max-w-md h-48">
              <OptimizedImage
                src={formData.image}
                alt="Current category"
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}

          {isUploading && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">📤 Uploading image...</p>
            </div>
          )}

          {hasUploadedMedia && !isUploading && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                ⚠️ New image uploaded. Will be deleted if save fails.
              </p>
            </div>
          )}

          <MediaUploader
            accept="image"
            maxFiles={1}
            multiple={false}
            resourceType="category"
            onFilesAdded={handleImageUpload}
            onFileRemoved={() => {
              setUploadedFiles([]);
            }}
            files={uploadedFiles}
            disabled={loading || isUploading || isCleaning}
          />
        </div>
      </Card>

      {/* Display Options */}
      <Card title="Display Options">
        <div className="space-y-4">
          <Checkbox
            label="Active"
            description="Make this category visible to customers"
            checked={formData.is_active}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_active: e.target.checked,
              }))
            }
            disabled={loading}
          />

          <Checkbox
            label="Featured"
            description="Highlight this category in featured sections"
            checked={formData.is_featured}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                is_featured: e.target.checked,
              }))
            }
            disabled={loading}
          />

          <Checkbox
            label="Show on Homepage"
            description="Display this category on the homepage"
            checked={formData.show_on_homepage}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                show_on_homepage: e.target.checked,
              }))
            }
            disabled={loading}
          />
        </div>
      </Card>

      {/* SEO Metadata */}
      <Card title="SEO Metadata">
        <div className="space-y-4">
          <FormField
            label="Meta Title"
            hint={`${formData.meta_title.length} / 60 characters`}
          >
            <FormInput
              value={formData.meta_title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, meta_title: e.target.value }))
              }
              placeholder="SEO title (defaults to category name)"
              maxLength={60}
              disabled={loading}
            />
          </FormField>

          <FormField
            label="Meta Description"
            hint={`${formData.meta_description.length} / 160 characters`}
          >
            <FormTextarea
              value={formData.meta_description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  meta_description: e.target.value,
                }))
              }
              rows={3}
              placeholder="SEO description"
              maxLength={160}
              disabled={loading}
            />
          </FormField>
        </div>
      </Card>

      {/* Error Message */}
      {errors.submit && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}

      {/* Actions */}
      <FormActions
        onCancel={handleCancel}
        submitLabel={mode === "create" ? "Create Category" : "Save Changes"}
        isSubmitting={loading}
        cancelDisabled={loading}
      />
    </form>
  );
}
