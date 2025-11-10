/**
 * REFERENCE IMPLEMENTATION: Hero Slide Form with Media Cleanup
 *
 * This is a reference implementation showing how to integrate
 * the media cleanup hook with an existing form.
 *
 * Use this as a template for implementing cleanup in:
 * - src/app/admin/hero-slides/create/page.tsx
 * - src/app/admin/hero-slides/[id]/edit/page.tsx
 * - Other forms with media upload
 */

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import MediaUploader from "@/components/media/MediaUploader";
import { apiService } from "@/services/api.service";
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";
import { MediaFile } from "@/types/media";

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  link_url: string;
  cta_text: string;
  is_active: boolean;
}

export default function HeroSlideFormWithCleanup({
  params,
  mode = "create",
}: {
  params?: { id: string };
  mode?: "create" | "edit";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<HeroSlide>>({
    title: "",
    subtitle: "",
    description: "",
    image_url: "",
    link_url: "",
    cta_text: "",
    is_active: true,
  });

  // Initialize media cleanup hook with navigation guard
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
    navigationGuardMessage:
      "You have uploaded an image that will be deleted. Leave anyway?",

    onUploadSuccess: (url) => {
      console.log("Image uploaded:", url);
      setFormData((prev) => ({ ...prev, image_url: url }));
    },
    onUploadError: (error) => {
      console.error("Upload failed:", error);
      alert(`Image upload failed: ${error}`);
    },
    onCleanupComplete: () => {
      console.log("Cleanup completed - media deleted from storage");
    },
  });

  // Load existing slide data in edit mode
  useEffect(() => {
    if (mode === "edit" && params?.id) {
      loadSlide();
    }
  }, [params?.id, mode]);

  const loadSlide = async () => {
    if (!params?.id) return;

    try {
      setLoading(true);
      const data = (await apiService.get(
        `/admin/hero-slides/${params.id}`,
      )) as HeroSlide;
      setFormData(data);
    } catch (error) {
      console.error("Failed to load slide:", error);
      alert("Failed to load slide");
      router.push("/admin/hero-slides");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle file upload from MediaUploader
   * Files are uploaded immediately and tracked for cleanup
   */
  const handleFilesAdded = async (files: MediaFile[]) => {
    if (files.length === 0) return;

    try {
      // Upload the first file (hero slides use single image)
      // Context is 'shop' for hero slides (no specific hero-slide context)
      await uploadMedia(files[0].file, "shop");
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  /**
   * Handle form submission with automatic cleanup on failure
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.image_url) {
      alert("Title and image are required");
      return;
    }

    setSaving(true);

    try {
      if (mode === "create") {
        // Create new hero slide
        await apiService.post("/admin/hero-slides", formData);
      } else if (params?.id) {
        // Update existing hero slide
        await apiService.patch(`/admin/hero-slides/${params.id}`, formData);
      }

      // ✅ Success! Clear tracking without deleting files
      clearTracking();

      // Navigate to list page
      router.push("/admin/hero-slides");
    } catch (error) {
      console.error("Failed to save slide:", error);

      // ❌ Failure! Clean up newly uploaded media
      // Only cleanup if we uploaded new media (hasUploadedMedia)
      if (hasUploadedMedia) {
        await cleanupUploadedMedia();

        // Reset image URL in form
        setFormData((prev) => ({ ...prev, image_url: "" }));
      }

      alert(
        `Failed to ${mode === "create" ? "create" : "update"} slide. ${
          hasUploadedMedia ? "Uploaded image has been deleted." : ""
        }`,
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handle cancel with navigation guard
   * Navigation guard automatically prompts and cleans up if user confirms
   */
  const handleCancel = async () => {
    if (hasUploadedMedia) {
      // Use navigation guard for automatic cleanup
      await confirmNavigation(() => {
        router.back();
      });
    } else {
      // No uploaded media, navigate directly
      router.back();
    }
  };

  /**
   * Handle file removal
   */
  const handleFileRemoved = (id: string) => {
    setFormData((prev) => ({ ...prev, image_url: "" }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {mode === "create" ? "Create" : "Edit"} Hero Slide
          </h1>
          <p className="text-gray-600 mt-1">
            {mode === "create"
              ? "Add a new slide to the homepage carousel"
              : "Update hero carousel slide"}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6">
        <div className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Main headline text"
              required
              disabled={saving || isUploading || isCleaning}
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={formData.subtitle}
              onChange={(e) =>
                setFormData({ ...formData, subtitle: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Secondary text"
              disabled={saving || isUploading || isCleaning}
            />
          </div>

          {/* Image Upload with Cleanup Tracking */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image <span className="text-red-500">*</span>
            </label>

            {/* Current Image Preview */}
            {formData.image_url && (
              <div className="mb-4">
                <img
                  src={formData.image_url}
                  alt="Hero slide"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {/* Upload Status */}
            {isUploading && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">Uploading image...</p>
              </div>
            )}

            {hasUploadedMedia && !isUploading && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700">
                  ⚠️ New image uploaded. Will be deleted if creation fails.
                </p>
              </div>
            )}

            {/* Media Uploader */}
            <MediaUploader
              accept="image"
              maxFiles={1}
              resourceType="shop"
              onFilesAdded={handleFilesAdded}
              onFileRemoved={handleFileRemoved}
              files={[]}
              disabled={saving || isUploading || isCleaning}
              enableCamera={true}
            />

            <p className="text-sm text-gray-500 mt-2">
              Recommended size: 1920x800px for best results
            </p>
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link URL
            </label>
            <input
              type="url"
              value={formData.link_url}
              onChange={(e) =>
                setFormData({ ...formData, link_url: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://..."
              disabled={saving || isUploading || isCleaning}
            />
          </div>

          {/* CTA Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Call-to-Action Text
            </label>
            <input
              type="text"
              value={formData.cta_text}
              onChange={(e) =>
                setFormData({ ...formData, cta_text: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Shop Now"
              disabled={saving || isUploading || isCleaning}
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) =>
                  setFormData({ ...formData, is_active: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                disabled={saving || isUploading || isCleaning}
              />
              <span className="text-sm font-medium text-gray-700">
                Active (show on homepage)
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t">
          <button
            type="submit"
            disabled={
              saving ||
              isUploading ||
              isCleaning ||
              !formData.title ||
              !formData.image_url
            }
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving
              ? "Saving..."
              : mode === "create"
                ? "Create Slide"
                : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={saving || isUploading || isCleaning}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {isCleaning ? "Cleaning up..." : "Cancel"}
          </button>

          {hasUploadedMedia && (
            <span className="text-sm text-orange-600">
              Unsaved changes (uploaded media will be cleaned up if you cancel)
            </span>
          )}
        </div>
      </form>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          🔒 Automatic Media Cleanup & Navigation Guard
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Images upload immediately when selected</li>
          <li>✓ Uploaded images are tracked for cleanup</li>
          <li>✓ If creation succeeds, images are kept</li>
          <li>✓ If creation fails, images are automatically deleted</li>
          <li>✓ Navigation guard prevents leaving page with unsaved media</li>
          <li>✓ Browser back, close, refresh all show confirmation dialog</li>
          <li>✓ Confirming navigation auto-cleans media from storage</li>
        </ul>
      </div>
    </div>
  );
}
