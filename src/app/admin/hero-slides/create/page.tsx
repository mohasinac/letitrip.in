"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import { FormInput, FormCheckbox, FormLabel } from "@/components/forms";
import MediaUploader from "@/components/media/MediaUploader";
import { heroSlidesService } from "@/services/hero-slides.service";
import RichTextEditor from "@/components/common/RichTextEditor";
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";
import { MediaFile } from "@/types/media";

export default function CreateHeroSlidePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<MediaFile[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    description: "",
    image: "",
    ctaLink: "",
    ctaText: "Shop Now",
    isActive: true,
    order: 0,
  });

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
    navigationGuardMessage: "You have uploaded an image. Leave and delete it?",
    onUploadSuccess: (url) => {
      setFormData((prev) => ({ ...prev, image: url }));
    },
    onUploadError: (error) => {
      toast.error(`Upload failed: ${error}`);
    },
    onCleanupComplete: () => {
      console.log("Uploaded media cleaned up");
      setUploadedFiles([]);
    },
  });

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

    if (!formData.title || !formData.image) {
      toast.error("Title and image are required");
      return;
    }

    try {
      setLoading(true);
      await heroSlidesService.createHeroSlide(formData);

      // Success! Clear tracking
      clearTracking();

      router.push("/admin/hero-slides");
    } catch (error) {
      console.error("Failed to create slide:", error);

      // Failure! Clean up uploaded media
      if (hasUploadedMedia) {
        await cleanupUploadedMedia();
        setFormData((prev) => ({ ...prev, image: "" }));
      }

      toast.error("Failed to create slide. Uploaded image deleted.");
    } finally {
      setLoading(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Create Hero Slide</h1>
        <p className="text-gray-600 mt-1">
          Add a new slide to the homepage hero carousel
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg border p-6">
        <div className="space-y-6">
          {/* Title */}
          <FormInput
            label="Title"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Main headline text"
          />

          {/* Subtitle */}
          <div>
            <FormLabel htmlFor="slide-subtitle">Subtitle (Rich Text)</FormLabel>
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
            <FormLabel htmlFor="slide-description">
              Description (Rich Text)
            </FormLabel>
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
            <FormLabel htmlFor="slide-image" required>
              Image
            </FormLabel>

            {isUploading && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">📤 Uploading image...</p>
              </div>
            )}

            {hasUploadedMedia && !isUploading && (
              <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-sm text-orange-700">
                  ⚠️ New image uploaded. Will be deleted if creation fails.
                </p>
              </div>
            )}

            <MediaUploader
              accept="image"
              maxFiles={1}
              resourceType="shop"
              onFilesAdded={handleFilesAdded}
              onFileRemoved={() => {
                setFormData({ ...formData, image: "" });
                setUploadedFiles([]);
              }}
              files={uploadedFiles}
              disabled={loading || isUploading || isCleaning}
              enableCamera={true}
            />

            {formData.image && !uploadedFiles.length && (
              <div className="mt-4 relative w-full h-48">
                <OptimizedImage
                  src={formData.image}
                  alt="Hero slide preview"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Link URL */}
          <FormInput
            label="Link URL"
            type="url"
            value={formData.ctaLink}
            onChange={(e) =>
              setFormData({ ...formData, ctaLink: e.target.value })
            }
            placeholder="https://..."
            helperText="Where users go when they click the slide"
          />

          {/* CTA Text */}
          <FormInput
            label="Call-to-Action Text"
            value={formData.ctaText}
            onChange={(e) =>
              setFormData({ ...formData, ctaText: e.target.value })
            }
            placeholder="Shop Now"
          />

          {/* Active Status */}
          <FormCheckbox
            label="Active (show on homepage)"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-8 pt-6 border-t">
          <button
            type="submit"
            disabled={
              loading ||
              isUploading ||
              isCleaning ||
              !formData.title ||
              !formData.image
            }
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating..." : "Create Slide"}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            disabled={loading || isUploading || isCleaning}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {isCleaning ? "Cleaning up..." : "Cancel"}
          </button>

          {hasUploadedMedia && (
            <span className="text-sm text-orange-600">Unsaved changes</span>
          )}
        </div>
      </form>
    </div>
  );
}
