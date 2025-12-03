"use client";

import Image from "next/image";
import { toast } from "sonner";
import SlugInput from "@/components/common/SlugInput";
import { FormInput, FormSelect, FormLabel } from "@/components/forms";
import CategorySelectorWithCreate from "@/components/seller/CategorySelectorWithCreate";
import { ShopSelector } from "@/components/seller/ShopSelector";
import { mediaService } from "@/services/media.service";
import type { RequiredStepProps } from "./types";

export function RequiredInfoStep({
  formData,
  setFormData,
  categories,
  auctionTypes,
  slugError,
  validateSlug,
  uploadingImages,
  setUploadingImages,
  uploadProgress,
  setUploadProgress,
}: RequiredStepProps) {
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (files: File[]) => {
    if (files.length + formData.images.length > 10) {
      toast.error("Maximum 10 images allowed");
      return;
    }
    setUploadingImages(true);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const key = `image-${index}`;
        setUploadProgress((prev) => ({ ...prev, [key]: 0 }));

        const result = await mediaService.upload({
          file,
          context: "auction",
        });

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
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Auction Information
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Enter the essential details for your auction
        </p>
      </div>

      {/* Title */}
      <FormInput
        id="auction-title"
        label="Auction Title"
        required
        value={formData.title}
        onChange={(e) => handleChange("title", e.target.value)}
        placeholder="e.g., Vintage Rolex Watch - Limited Edition"
        helperText="Choose a clear, descriptive title that buyers will search for"
      />

      {/* Slug */}
      <div>
        <FormLabel required>Auction URL</FormLabel>
        <SlugInput
          id="auction-slug"
          sourceText={formData.title}
          value={formData.slug}
          onChange={(slug: string) => {
            handleChange("slug", slug);
            validateSlug(slug);
          }}
          prefix="auctions/"
          error={slugError}
        />
      </div>

      {/* Category */}
      <div>
        <FormLabel required>Category</FormLabel>
        <CategorySelectorWithCreate
          value={formData.category}
          onChange={(categoryId) => handleChange("category", categoryId || "")}
          placeholder="Select or create a category"
          required
        />
      </div>

      {/* Shop */}
      <div>
        <FormLabel required>Shop</FormLabel>
        <ShopSelector
          value={formData.shopId || ""}
          onChange={(shopId) => handleChange("shopId", shopId || "")}
          required
          helperText="Select which shop this auction belongs to"
        />
      </div>

      {/* Starting Bid */}
      <FormInput
        id="auction-starting-bid"
        label="Starting Bid (₹)"
        type="number"
        required
        value={formData.startingBid}
        onChange={(e) => handleChange("startingBid", e.target.value)}
        min={1}
        step={1}
        placeholder="1000"
        helperText="The minimum bid required to start the auction"
      />

      {/* Auction Type */}
      <div>
        <FormLabel required>Auction Type</FormLabel>
        <div className="grid gap-3 sm:grid-cols-3">
          {auctionTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              onClick={() => handleChange("auctionType", type.value)}
              className={`rounded-lg border-2 p-4 text-left transition-colors ${
                formData.auctionType === type.value
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <div className="font-medium text-sm text-gray-900 dark:text-white">
                {type.label}
              </div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                {type.description}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Condition */}
      <FormSelect
        id="auction-condition"
        label="Item Condition"
        required
        value={formData.condition}
        onChange={(e) => handleChange("condition", e.target.value)}
        options={[
          { value: "new", label: "New" },
          { value: "like-new", label: "Like New" },
          { value: "excellent", label: "Excellent" },
          { value: "good", label: "Good" },
          { value: "fair", label: "Fair" },
          { value: "for-parts", label: "For Parts/Not Working" },
        ]}
      />

      {/* Image Upload */}
      <div>
        <FormLabel required>Auction Images (at least 1)</FormLabel>
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-6 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="auction-image-upload"
            disabled={uploadingImages}
            onChange={(e) => {
              if (e.target.files) {
                handleImageUpload(Array.from(e.target.files));
              }
            }}
          />
          <label
            htmlFor="auction-image-upload"
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer"
          >
            {uploadingImages ? "Uploading..." : "Select Images"}
          </label>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            PNG, JPG, GIF up to 10MB each • {formData.images.length}/10 images
          </p>

          {/* Upload Progress */}
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

          {/* Uploaded Images */}
          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-4 gap-4">
              {formData.images.map((url, index) => (
                <div key={url} className="relative group">
                  <Image
                    src={url}
                    alt={`Auction ${index + 1}`}
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
                  {index === 0 && (
                    <span className="absolute top-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
