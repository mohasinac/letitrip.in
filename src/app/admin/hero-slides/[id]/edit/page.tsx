"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import MediaUploader from "@/components/media/MediaUploader";
import {
  heroSlidesService,
  type HeroSlideFormData,
} from "@/services/hero-slides.service";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import RichTextEditor from "@/components/common/RichTextEditor";
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";
import { MediaFile } from "@/types/media";

interface FormState {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  ctaLink: string;
  ctaText: string;
  isActive: boolean;
  order: number;
}

export default function EditHeroSlidePage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [formData, setFormData] = useState<FormState | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);

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
      "You have uploaded a new image. Leave and delete it?",
    onUploadSuccess: (url) => {
      setFormData((prev) => (prev ? { ...prev, image: url } : null));
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error}`);
    },
    onCleanupComplete: () => {
      console.log("Uploaded media cleaned up");
      setUploadedFiles([]);
    },
  });

  useEffect(() => {
    loadSlide();
  }, [params.id]);

  const loadSlide = async () => {
    try {
      setLoading(true);
      const slide = await heroSlidesService.getHeroSlideById(
        params.id as string
      );
      // Transform from service format to form format
      const data: FormState = {
        title: slide.title,
        subtitle: slide.subtitle || "",
        description: slide.description || "",
        image: slide.image,
        ctaLink: slide.ctaLink,
        ctaText: slide.ctaText,
        isActive: slide.isActive,
        order: slide.order,
      };
      setFormData(data);
    } catch (error) {
      console.error("Failed to load slide:", error);
      toast.error("Failed to load slide");
      router.push("/admin/hero-slides");
    } finally {
      setLoading(false);
    }
  };

  const handleFilesAdded = async (files: MediaFile[]) => {
    if (files.length === 0) return;

    setUploadedFiles(files);

    try {
      await uploadMedia(files[0].file, "shop");
    } catch (error) {
      console.error("Failed to upload image:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData || !formData.title || !formData.image) {
      toast.error("Title and image are required");
      return;
    }

    try {
      setSaving(true);
      await heroSlidesService.updateHeroSlide(params.id as string, formData);

      // Success! Clear tracking
      clearTracking();

      router.push("/admin/hero-slides");
    } catch (error) {
      console.error("Failed to update slide:", error);

      // Failure! Clean up newly uploaded media
      if (hasUploadedMedia) {
        await cleanupUploadedMedia();
        // Restore original image URL would need to be tracked separately
      }

      toast.error("Failed to update slide. New image deleted.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (hasUploadedMedia) {
      await confirmNavigation(() => router.back());
    } else {
      router.back();
    }
  };

  const handleDelete = async () => {
    try {
      await heroSlidesService.deleteHeroSlide(params.id as string);
      router.push("/admin/hero-slides");
    } catch (error) {
      console.error("Failed to delete slide:", error);
      toast.error("Failed to delete slide");
    }
  };

  if (loading || !formData) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Edit Hero Slide
            </h1>
            <p className="text-gray-600 mt-1">Update hero carousel slide</p>
          </div>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
          >
            Delete Slide
          </button>
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
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtitle (Rich Text)
            </label>
            <RichTextEditor
              value={formData.subtitle}
              onChange={(value: string) =>
                setFormData({ ...formData, subtitle: value })
              }
              placeholder="Secondary text with formatting..."
              minHeight={120}
              tools={["bold", "italic", "underline", "link", "clear"]}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Rich Text)
            </label>
            <RichTextEditor
              value={formData.description}
              onChange={(value: string) =>
                setFormData({ ...formData, description: value })
              }
              placeholder="Additional details with formatting..."
              minHeight={150}
            />
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image <span className="text-red-500">*</span>
            </label>

            {formData.image && !uploadedFiles.length && (
              <div className="mb-4">
                <img
                  src={formData.image}
                  alt="Current hero slide"
                  className="w-full h-48 object-cover rounded-lg"
                />
              </div>
            )}

            {isUploading && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  📤 Uploading new image...
                </p>
              </div>
            )}

            {hasUploadedMedia && !isUploading && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700">
                  ⚠️ New image uploaded. Will be deleted if save fails.
                </p>
              </div>
            )}

            <MediaUploader
              accept="image"
              maxFiles={1}
              resourceType="shop"
              onFilesAdded={handleFilesAdded}
              onFileRemoved={() => {
                setUploadedFiles([]);
              }}
              files={uploadedFiles}
              disabled={saving || isUploading || isCleaning}
              enableCamera={true}
            />
          </div>

          {/* Link URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link URL
            </label>
            <input
              type="url"
              value={formData.ctaLink}
              onChange={(e) =>
                setFormData({ ...formData, ctaLink: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="https://..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Where users go when they click the slide
            </p>
          </div>

          {/* CTA Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Call-to-Action Text
            </label>
            <input
              type="text"
              value={formData.ctaText}
              onChange={(e) =>
                setFormData({ ...formData, ctaText: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Shop Now"
            />
          </div>

          {/* Active Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
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
              !formData.image
            }
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
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
            <span className="text-sm text-orange-600">Unsaved changes</span>
          )}
        </div>
      </form>

      {/* Delete Confirmation */}
      {showDeleteDialog && (
        <ConfirmDialog
          isOpen={true}
          title="Delete Hero Slide"
          description={`Are you sure you want to delete "${formData.title}"? This action cannot be undone.`}
          confirmLabel="Delete"
          variant="danger"
          onConfirm={handleDelete}
          onClose={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}
