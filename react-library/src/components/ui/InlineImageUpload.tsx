"use client";

/**
 * InlineImageUpload Component
 *
 * Framework-agnostic inline image upload with preview and remove.
 * Requires injectable upload handler.
 *
 * @example
 * ```tsx
 * <InlineImageUpload
 *   value={imageUrl}
 *   onChange={setImageUrl}
 *   onUpload={handleFileUpload}
 *   size={64}
 * />
 * ```
 */

import React, { useState } from "react";

export interface InlineImageUploadProps {
  /** Current image URL */
  value?: string;
  /** Change callback */
  onChange: (url: string) => void;
  /** Upload handler - receives file, returns URL */
  onUpload: (file: File) => Promise<string>;
  /** Remove callback */
  onRemove?: () => void;
  /** Accepted file types */
  accept?: string;
  /** Image size (width and height) */
  size?: number;
  /** Max file size in MB */
  maxSizeMB?: number;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom Upload icon */
  UploadIcon?: React.ComponentType<{ className?: string }>;
  /** Custom X icon */
  XIcon?: React.ComponentType<{ className?: string }>;
  /** Custom Loader icon */
  LoaderIcon?: React.ComponentType<{ className?: string }>;
  /** Custom Image icon (fallback) */
  ImageIcon?: React.ComponentType<{ className?: string }>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icons
function DefaultUploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function DefaultXIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function DefaultLoaderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

function DefaultImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );
}

export function InlineImageUpload({
  value,
  onChange,
  onUpload,
  onRemove,
  accept = "image/*",
  size = 64,
  maxSizeMB = 5,
  loading: externalLoading,
  disabled,
  className = "",
  UploadIcon = DefaultUploadIcon,
  XIcon = DefaultXIcon,
  LoaderIcon = DefaultLoaderIcon,
  ImageIcon = DefaultImageIcon,
}: InlineImageUploadProps) {
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

    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image size must be less than ${maxSizeMB}MB`);
      return;
    }

    try {
      setUploading(true);
      setError(null);

      const url = await onUpload(file);
      onChange(url);
    } catch (err) {
      console.error("Upload failed:", err);
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
    <div className={cn("flex flex-col gap-1", className)}>
      <div
        className="relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700"
        style={{ width: size, height: size }}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-10">
            <LoaderIcon className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}

        {/* Image Preview */}
        {value && !isLoading ? (
          <>
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            {!disabled && (
              <button
                onClick={handleRemove}
                type="button"
                className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                title="Remove image"
              >
                <XIcon className="w-3 h-3" />
              </button>
            )}
          </>
        ) : !isLoading ? (
          /* Upload Button */
          <label
            className={cn(
              "cursor-pointer flex flex-col items-center justify-center w-full h-full",
              disabled
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-gray-200 dark:hover:bg-gray-700",
              "transition-colors"
            )}
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
              <UploadIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
            )}
          </label>
        ) : null}
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default InlineImageUpload;
