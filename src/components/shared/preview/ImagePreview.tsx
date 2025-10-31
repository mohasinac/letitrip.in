"use client";

import React, { useState } from "react";
import { getImageUrl } from "@/lib/utils/storage";

interface ImagePreviewProps {
  imageUrl: string | null | undefined;
  useCache?: boolean;
  cacheDuration?: number;
  className?: string;
}

/**
 * ImagePreview Component
 * Displays image thumbnail with fallback and error handling
 * Automatically uses cached API endpoint for images
 */
export function ImagePreview({
  imageUrl,
  useCache = true,
  cacheDuration = 86400,
  className = "",
}: ImagePreviewProps) {
  const [imageError, setImageError] = useState(false);

  if (!imageUrl) {
    return (
      <div
        className={`w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 ${className}`}
      >
        <span className="text-xs text-gray-500 dark:text-gray-400">
          No image
        </span>
      </div>
    );
  }

  if (imageError) {
    return (
      <div
        className={`w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border border-red-500 dark:border-red-600 ${className}`}
      >
        <span className="text-xs text-red-600 dark:text-red-400">
          Failed to load
        </span>
      </div>
    );
  }

  // Use cached API endpoint for image retrieval
  const cachedImageUrl = useCache
    ? getImageUrl(imageUrl, true, cacheDuration)
    : imageUrl;

  return (
    <img
      src={cachedImageUrl}
      onError={() => setImageError(true)}
      className={`w-20 h-20 object-cover rounded border border-gray-200 dark:border-gray-700 ${className}`}
      alt="Preview"
    />
  );
}

export default ImagePreview;
