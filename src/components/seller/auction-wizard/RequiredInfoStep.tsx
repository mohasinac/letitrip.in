"use client";

import CategorySelectorWithCreate from "@/components/seller/CategorySelectorWithCreate";
import ShopSelector from "@/components/seller/ShopSelector";
import { logError } from "@/lib/error-logger";
import { mediaService } from "@/services/media.service";
import {
  AuctionRequiredInfoStep,
  FormInput,
  FormLabel,
  FormSelect,
  SlugInput,
} from "@letitrip/react-library";
import Image from "next/image";
import { toast } from "sonner";
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
      logError(error as Error, {
        component: "AuctionWizard.RequiredInfoStep.handleImageUpload",
      });
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
    <AuctionRequiredInfoStep
      formData={{
        title: formData.title,
        slug: formData.slug,
        categoryId: formData.categoryId,
        shopId: formData.shopId,
        auctionType: formData.auctionType,
        condition: formData.condition,
        images: formData.images,
      }}
      onChange={handleChange}
      categories={categories}
      auctionTypes={auctionTypes}
      slugError={slugError}
      onSlugValidation={validateSlug}
      uploadingImages={uploadingImages}
      uploadProgress={uploadProgress}
      onImageUpload={handleImageUpload}
      onImageRemove={removeImage}
      ImageComponent={Image}
      FormInputComponent={FormInput}
      FormSelectComponent={FormSelect}
      FormLabelComponent={FormLabel}
      SlugInputComponent={SlugInput}
      CategorySelectorComponent={CategorySelectorWithCreate}
      ShopSelectorComponent={ShopSelector}
    />
  );
}
