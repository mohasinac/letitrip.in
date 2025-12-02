"use client";

import Image from "next/image";
import { toast } from "sonner";
import SlugInput from "@/components/common/SlugInput";
import { FormInput, FormLabel } from "@/components/forms";
import CategorySelectorWithCreate from "@/components/seller/CategorySelectorWithCreate";
import { mediaService } from "@/services/media.service";
import type { RequiredStepProps } from "./types";

export function RequiredInfoStep({
  formData,
  setFormData,
  uploadingImages,
  setUploadingImages,
  uploadProgress,
  setUploadProgress,
}: RequiredStepProps) {
  const handleImageUpload = async (files: File[]) => {
    setUploadingImages(true);
    try {
      const uploadPromises = files.map(async (file, index) => {
        const key = `image-${index}`;
        setUploadProgress((prev) => ({ ...prev, [key]: 0 }));
        const result = await mediaService.upload({ file, context: "product" });
        setUploadProgress((prev) => ({ ...prev, [key]: 100 }));
        return result.url;
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls],
      }));
    } catch (error) {
      console.error("Image upload failed:", error);
      toast.error("Failed to upload images. Please try again.");
    } finally {
      setUploadingImages(false);
      setUploadProgress({});
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
        Required Information
      </h2>

      {/* Basic Info Section */}
      <div className="space-y-4">
        <FormInput
          id="product-name"
          label="Product Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter product name"
        />

        <SlugInput
          value={formData.slug}
          sourceText={formData.name}
          onChange={(slug: string) => setFormData({ ...formData, slug })}
        />

        <div>
          <FormLabel required>Category</FormLabel>
          <CategorySelectorWithCreate
            value={formData.categoryId}
            onChange={(categoryId) =>
              setFormData({ ...formData, categoryId: categoryId || "" })
            }
            placeholder="Select or create a category"
            required
          />
        </div>

        <FormInput
          id="product-sku"
          label="SKU"
          required
          value={formData.sku}
          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
          placeholder="e.g., PROD-12345"
        />
      </div>

      {/* Pricing Section */}
      <div className="grid grid-cols-2 gap-4">
        <FormInput
          id="product-price"
          label="Price (₹)"
          type="number"
          required
          min={0}
          step={0.01}
          value={formData.price}
          onChange={(e) =>
            setFormData({
              ...formData,
              price: parseFloat(e.target.value) || 0,
            })
          }
          placeholder="0.00"
        />
        <FormInput
          id="product-stock"
          label="Stock Count"
          type="number"
          required
          min={0}
          value={formData.stockCount}
          onChange={(e) =>
            setFormData({
              ...formData,
              stockCount: parseInt(e.target.value) || 0,
            })
          }
          placeholder="0"
        />
      </div>

      {/* Image Upload Section */}
      <div>
        <FormLabel required>Product Images (at least 1)</FormLabel>
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 text-center">
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="image-upload"
            disabled={uploadingImages}
            onChange={(e) => {
              if (e.target.files) {
                handleImageUpload(Array.from(e.target.files));
              }
            }}
          />
          <label
            htmlFor="image-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
          >
            {uploadingImages ? "Uploading..." : "Select Images"}
          </label>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, GIF up to 10MB each
          </p>

          {uploadingImages && (
            <div className="mt-4 space-y-2">
              {Object.entries(uploadProgress)
                .filter(([key]) => key.startsWith("image-"))
                .map(([key, progress]) => (
                  <div key={key} className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {progress}%
                    </span>
                  </div>
                ))}
            </div>
          )}

          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div key={url} className="relative group">
                  <Image
                    src={url}
                    alt={`Product ${index + 1}`}
                    width={96}
                    height={96}
                    className="w-full h-24 object-cover rounded-lg"
                    unoptimized
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      className="w-4 h-4"
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
