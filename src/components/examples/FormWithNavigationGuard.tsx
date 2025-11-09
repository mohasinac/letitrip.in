/**
 * EXAMPLE: Form with Navigation Guard and Media Cleanup
 *
 * This example shows how to prevent navigation when there's unsaved uploaded media.
 * The navigation guard automatically triggers cleanup when user confirms they want to leave.
 */

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMediaUploadWithCleanup } from "@/hooks/useMediaUploadWithCleanup";
import { apiService } from "@/services/api.service";
import MediaUploader from "@/components/media/MediaUploader";
import { MediaFile } from "@/types/media";

export default function FormWithNavigationGuard() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    images: [] as string[],
  });

  // Hook with navigation guard enabled (default)
  const {
    uploadMultipleMedia,
    cleanupUploadedMedia,
    clearTracking,
    confirmNavigation,
    hasUploadedMedia,
    isUploading,
    isCleaning,
  } = useMediaUploadWithCleanup({
    // Navigation guard is enabled by default
    enableNavigationGuard: true,
    navigationGuardMessage:
      "You have uploaded images that will be deleted. Leave anyway?",

    onUploadSuccess: (url) => {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, url],
      }));
    },

    onUploadError: (error) => {
      alert(`Upload failed: ${error}`);
    },

    onCleanupComplete: () => {
      console.log("✓ Uploaded media cleaned up");
    },
  });

  const handleFilesAdded = async (files: MediaFile[]) => {
    if (files.length === 0) return;

    try {
      await uploadMultipleMedia(
        files.map((f) => f.file),
        "product"
      );
    } catch (error) {
      console.error("Upload error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create the resource
      await apiService.post("/products", formData);

      // Success! Clear tracking so navigation guard won't trigger
      clearTracking();

      // Navigate away
      router.push("/products");
    } catch (error) {
      // Failure! Cleanup uploaded media
      await cleanupUploadedMedia();
      setFormData((prev) => ({ ...prev, images: [] }));
      alert("Failed to create product. Uploaded images deleted.");
    }
  };

  /**
   * Handle custom navigation with guard
   * Use confirmNavigation for programmatic navigation
   */
  const handleCustomNavigation = async (path: string) => {
    const canNavigate = await confirmNavigation(async () => {
      // This cleanup will run automatically if user confirms
      // No need to call cleanupUploadedMedia here
      router.push(path);
    });

    if (!canNavigate) {
      console.log("Navigation cancelled by user");
    }
  };

  /**
   * Handle cancel with guard
   */
  const handleCancel = async () => {
    if (hasUploadedMedia) {
      // Navigation guard will automatically show confirmation and cleanup
      await confirmNavigation(async () => {
        router.back();
      });
    } else {
      // No unsaved media, navigate directly
      router.back();
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-bold mb-6">Create Product</h1>

        {/* Warning Banner */}
        {hasUploadedMedia && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold text-orange-900">
                  Unsaved Changes
                </h3>
                <p className="text-sm text-orange-800 mt-1">
                  You have uploaded {formData.images.length} image(s). If you
                  leave this page without saving, they will be automatically
                  deleted.
                </p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              required
              disabled={isUploading || isCleaning}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
              rows={4}
              disabled={isUploading || isCleaning}
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Images
            </label>

            {isUploading && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">📤 Uploading images...</p>
              </div>
            )}

            <MediaUploader
              accept="image"
              maxFiles={5}
              resourceType="product"
              onFilesAdded={handleFilesAdded}
              onFileRemoved={() => {}}
              files={[]}
              disabled={isUploading || isCleaning}
            />

            {formData.images.length > 0 && (
              <div className="mt-4 grid grid-cols-3 gap-4">
                {formData.images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Uploaded ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-6 border-t">
            <button
              type="submit"
              disabled={isUploading || isCleaning || !formData.title}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              Create Product
            </button>

            <button
              type="button"
              onClick={handleCancel}
              disabled={isUploading || isCleaning}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              {isCleaning ? "Cleaning up..." : "Cancel"}
            </button>

            {/* Custom navigation examples */}
            <button
              type="button"
              onClick={() => handleCustomNavigation("/products")}
              disabled={isUploading || isCleaning}
              className="px-6 py-2 text-purple-600 border border-purple-600 rounded-lg hover:bg-purple-50"
            >
              View Products
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">
            🛡️ Navigation Guard Active
          </h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Browser back/forward buttons are protected</li>
            <li>✓ Page refresh/close shows confirmation</li>
            <li>✓ Link clicks show confirmation dialog</li>
            <li>✓ Media is automatically cleaned up if you leave</li>
            <li>✓ Guard is disabled after successful save</li>
          </ul>
        </div>

        {/* How it works */}
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-semibold text-gray-900 mb-2">How It Works</h3>
          <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
            <li>Upload images → Navigation guard activates automatically</li>
            <li>Try to navigate away → Confirmation dialog appears</li>
            <li>
              Confirm leave → Media is cleaned up, then navigation proceeds
            </li>
            <li>Cancel leave → Stay on page, media is kept</li>
            <li>Save successfully → Guard deactivates, navigate freely</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
