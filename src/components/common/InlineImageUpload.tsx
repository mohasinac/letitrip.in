"use client";

import OptimizedImage from "@/components/common/OptimizedImage";
import { logError } from "@/lib/firebase-error-logger";
import { mediaService } from "@/services/media.service";
import { InlineImageUploadProps } from "@/types/inline-edit";
import { Image as ImageIcon, Loader2, Upload, X } from "lucide-react";
import { useState } from "react";

export function InlineImageUpload({
  value,
  onChange,
  onRemove,
  accept = "image/*",
  size = 64,
  loading: externalLoading,
  disabled,
  context = "product",
}: InlineImageUploadProps) {
  const validContext = context as
    | "product"
    | "shop"
    | "auction"
    | "review"
    | "return"
    | "avatar"
    | "category";
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = uploading || externalLoading;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB");
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const response = await mediaService.upload({
        file,
        context: validContext,
      });
      onChange(response.url);
    } catch (err) {
      logError(err as Error, {
        component: "InlineImageUpload.handleUpload",
        context: validContext,
      });
      setError("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
    } else {
      onChange("");
    }
    setError(null);
  };

  return (
    <div className="flex flex-col gap-1">
      <div
        className="relative rounded overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200"
        style={{ width: size, height: size }}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}

        {/* Image Preview */}
        {value && !isLoading ? (
          <>
            <OptimizedImage
              src={value}
              alt="Preview"
              width={size}
              height={size}
              className="rounded-lg"
              objectFit="cover"
            />
            {!disabled && (
              <button
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                title="Remove image"
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </>
        ) : !isLoading ? (
          /* Upload Button */
          <label
            className={`cursor-pointer flex flex-col items-center justify-center w-full h-full ${
              disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-200"
            }`}
          >
            <input
              type="file"
              accept={accept}
              onChange={handleFileSelect}
              disabled={disabled || isLoading}
              className="hidden"
            />
            {error ? (
              <ImageIcon className="w-6 h-6 text-red-400" />
            ) : (
              <Upload className="w-6 h-6 text-gray-400" />
            )}
          </label>
        ) : null}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
