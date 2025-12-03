"use client";

import React, { useState, useCallback } from "react";
import { logError } from "@/lib/firebase-error-logger";
import { toast } from "sonner";
import {
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  CheckCircle,
  RefreshCw,
  Star,
  Camera,
} from "lucide-react";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import OptimizedImage from "@/components/common/OptimizedImage";
import { mediaService } from "@/services/media.service";
import CameraCapture from "@/components/media/CameraCapture";
import { MediaFile } from "@/types/media";

interface ProductImage {
  id: string;
  url: string;
  file?: File;
  uploading?: boolean;
  error?: string;
  progress?: number;
}

interface ProductImageManagerProps {
  images: string[]; // Existing image URLs
  maxImages?: number;
  onImagesChange: (urls: string[]) => void;
  shopId: string;
  productId: string;
  disabled?: boolean;
}

// Sortable Image Item Component
function SortableImageItem({
  image,
  index,
  isPrimary,
  onRemove,
  onRetry,
}: {
  image: ProductImage;
  index: number;
  isPrimary: boolean;
  onRemove: () => void;
  onRetry: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: image.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative aspect-square rounded-lg border-2 border-gray-200 bg-gray-50 overflow-hidden group"
    >
      {/* Image */}
      {image.url && !image.uploading ? (
        <OptimizedImage
          src={image.url}
          alt={`Product image ${index + 1}`}
          fill
          objectFit="cover"
        />
      ) : null}

      {/* Uploading State */}
      {image.uploading && (
        <div className="absolute inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-2" />
          <p className="text-sm text-gray-600">
            {image.progress ? `${image.progress}%` : "Uploading..."}
          </p>
        </div>
      )}

      {/* Error State */}
      {image.error && (
        <div className="absolute inset-0 bg-red-50 bg-opacity-95 flex flex-col items-center justify-center p-2">
          <AlertCircle className="w-8 h-8 text-red-600 mb-2" />
          <p className="text-xs text-red-700 text-center mb-2">{image.error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-1 px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Primary Badge */}
      {isPrimary && !image.error && (
        <div className="absolute top-2 left-2 px-2 py-1 bg-blue-600 text-white text-xs rounded flex items-center gap-1">
          <Star className="w-3 h-3 fill-current" />
          Primary
        </div>
      )}

      {/* Success Indicator */}
      {image.url && !image.uploading && !image.error && (
        <div className="absolute top-2 right-2 p-1 bg-green-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
          <CheckCircle className="w-4 h-4" />
        </div>
      )}

      {/* Remove Button */}
      {!image.uploading && (
        <button
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Drag Handle (visible on hover) */}
      <div
        {...attributes}
        {...listeners}
        className="absolute inset-0 cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
      />
    </div>
  );
}

export default function ProductImageManager({
  images,
  maxImages = 10,
  onImagesChange,
  shopId,
  productId,
  disabled = false,
}: ProductImageManagerProps) {
  const [productImages, setProductImages] = useState<ProductImage[]>(
    images.map((url, index) => ({
      id: `existing-${index}`,
      url,
    }))
  );
  const [uploading, setUploading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const canAddMore = productImages.length < maxImages && !disabled;

  // Handle file selection
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    await handleFiles(Array.from(files));
    e.target.value = ""; // Reset input
  };

  // Handle drag and drop
  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/")
      );

      if (files.length > 0) {
        await handleFiles(files);
      }
    },
    [productImages]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Process files and upload
  const handleFiles = async (files: File[]) => {
    if (!canAddMore) return;

    const filesToUpload = files.slice(0, maxImages - productImages.length);
    const newImages: ProductImage[] = filesToUpload.map((file) => ({
      id: `new-${Date.now()}-${Math.random()}`,
      url: URL.createObjectURL(file),
      file,
      uploading: true,
      progress: 0,
    }));

    // Add to state immediately
    setProductImages((prev) => [...prev, ...newImages]);
    setUploading(true);

    // Upload each file
    for (const newImage of newImages) {
      await uploadImage(newImage);
    }

    setUploading(false);
  };

  // Upload single image to Firebase Storage (via API)
  const uploadImage = async (image: ProductImage) => {
    try {
      if (!image.file) throw new Error("No file to upload");

      // Start uploading state
      setProductImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? { ...img, uploading: true, progress: 0, error: undefined }
            : img
        )
      );

      // Perform upload through media service
      const res = await mediaService.upload({
        file: image.file,
        context: "product",
        contextId: productId,
        description: `product-image-${productId}`,
      });

      const uploadedUrl = res.url;

      // Compute updated list and propagate
      const updatedList = productImages.map((img) =>
        img.id === image.id
          ? { ...img, url: uploadedUrl, uploading: false, progress: 100 }
          : img
      );
      setProductImages(updatedList);

      const allUrls = updatedList.map((img) => img.url).filter((url) => url);
      onImagesChange(allUrls);
    } catch (error) {
      logError(error as Error, {
        component: "ProductImageManager.uploadImage",
        metadata: { imageId: image.id },
      });
      setProductImages((prev) =>
        prev.map((img) =>
          img.id === image.id
            ? {
                ...img,
                uploading: false,
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : img
        )
      );
    }
  };

  // Retry failed upload
  const handleRetry = async (imageId: string) => {
    const image = productImages.find((img) => img.id === imageId);
    if (!image || !image.file) return;

    setProductImages((prev) =>
      prev.map((img) =>
        img.id === imageId
          ? { ...img, uploading: true, error: undefined, progress: 0 }
          : img
      )
    );

    await uploadImage(image);
  };

  // Remove image
  const handleRemove = (imageId: string) => {
    setProductImages((prev) => prev.filter((img) => img.id !== imageId));

    // Update parent component
    const allUrls = productImages
      .filter((img) => img.id !== imageId)
      .map((img) => img.url)
      .filter((url) => url !== "");
    onImagesChange(allUrls);
  };

  // Handle drag end (reorder)
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = productImages.findIndex((img) => img.id === active.id);
      const newIndex = productImages.findIndex((img) => img.id === over.id);

      const reordered = arrayMove(productImages, oldIndex, newIndex);
      setProductImages(reordered);

      // Update parent component
      const allUrls = reordered
        .map((img: ProductImage) => img.url)
        .filter((url: string) => url !== "");
      onImagesChange(allUrls);
    }
  };

  // Handle camera capture
  const handleCameraCapture = async (mediaFile: MediaFile) => {
    setShowCamera(false);

    if (!canAddMore) return;

    const newImage: ProductImage = {
      id: `camera-${Date.now()}`,
      url: mediaFile.preview,
      file: mediaFile.file,
      uploading: true,
      progress: 0,
    };

    setProductImages((prev) => [...prev, newImage]);
    setUploading(true);

    await uploadImage(newImage);

    setUploading(false);
  };

  return (
    <div className="space-y-4">
      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
      {/* Upload Area */}
      {canAddMore && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="relative"
        >
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            disabled={disabled || uploading}
            className="hidden"
            id="product-image-upload"
          />
          <label
            htmlFor="product-image-upload"
            className={`block border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              disabled || uploading
                ? "border-gray-200 bg-gray-50 cursor-not-allowed"
                : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
            }`}
          >
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-sm font-medium text-gray-700 mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-gray-500 mb-4">
              PNG, JPG, GIF up to 10MB ({productImages.length}/{maxImages}{" "}
              images)
            </p>

            {/* Camera Button */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setShowCamera(true);
              }}
              disabled={disabled || uploading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              <Camera className="w-4 h-4" />
              Use Camera
            </button>
          </label>
        </div>
      )}

      {/* Images Grid */}
      {productImages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-medium text-gray-700">
              Product Images ({productImages.length}/{maxImages})
            </p>
            <p className="text-xs text-gray-500">
              Drag to reorder • First image is primary
            </p>
          </div>

          <DndContext
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={productImages.map((img) => img.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {productImages.map((image, index) => (
                  <SortableImageItem
                    key={image.id}
                    image={image}
                    index={index}
                    isPrimary={index === 0}
                    onRemove={() => handleRemove(image.id)}
                    onRetry={() => handleRetry(image.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Empty State */}
      {productImages.length === 0 && !canAddMore && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <ImageIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-600">No images uploaded yet</p>
        </div>
      )}

      {/* Help Text */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-blue-900">
            <p className="font-medium mb-1">Image Guidelines:</p>
            <ul className="list-disc list-inside space-y-0.5 text-blue-800">
              <li>First image will be used as the primary product image</li>
              <li>Drag images to reorder them</li>
              <li>Recommended size: 800x800px or larger</li>
              <li>Accepted formats: JPG, PNG, GIF</li>
              <li>Maximum file size: 10MB per image</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
