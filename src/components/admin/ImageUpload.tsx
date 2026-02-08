"use client";

import { useState, useRef, ChangeEvent } from "react";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

interface ImageUploadProps {
  currentImage?: string;
  onUpload: (imageUrl: string) => void;
  folder?: string;
  isPublic?: boolean;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
}

export function ImageUpload({
  currentImage,
  onUpload,
  folder = "uploads",
  isPublic = true,
  accept = "image/jpeg,image/png,image/gif,image/webp",
  maxSizeMB = 10,
  label = "Upload Image",
  helperText,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || "");
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset states
    setError("");
    setProgress(0);

    // Validate file size
    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSizeMB) {
      setError(
        `File size must be less than ${maxSizeMB}MB (current: ${fileSizeMB.toFixed(2)}MB)`,
      );
      return;
    }

    // Validate file type
    const acceptedTypes = accept.split(",").map((t) => t.trim());
    if (!acceptedTypes.includes(file.type)) {
      setError(`Invalid file type. Accepted: ${accept}`);
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreview(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);

    // Upload to server
    try {
      setUploading(true);
      setProgress(10);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      formData.append("public", isPublic.toString());

      setProgress(30);

      const response = await fetch(API_ENDPOINTS.MEDIA.UPLOAD, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      setProgress(70);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const data = await response.json();
      setProgress(100);

      if (data.success && data.data?.url) {
        onUpload(data.data.url);
        setPreview(data.data.url);
      } else {
        throw new Error("Upload response invalid");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setPreview(currentImage || "");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleRemove = () => {
    setPreview("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onUpload("");
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}

      {/* Preview Area */}
      <div className="relative">
        {preview ? (
          <div className="relative group">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-cover rounded-lg border-2 border-gray-300 dark:border-gray-600"
            />

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleClick}
                disabled={uploading}
                className="px-4 py-2 bg-white text-gray-900 rounded-md hover:bg-gray-100 transition-colors duration-200 font-medium"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-medium"
              >
                Remove
              </button>
            </div>

            {/* Upload Progress */}
            {uploading && progress > 0 && (
              <div className="absolute inset-x-0 bottom-0 h-2 bg-gray-200 dark:bg-gray-700 rounded-b-lg overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={handleClick}
            disabled={uploading}
            className="w-full h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800"
          >
            <svg
              className="w-12 h-12 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-sm font-medium">
              {uploading ? "Uploading..." : "Click to upload"}
            </span>
            <span className="text-xs mt-1">
              {accept
                .split(",")
                .map((t) => t.split("/")[1].toUpperCase())
                .join(", ")}{" "}
              (max {maxSizeMB}MB)
            </span>
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{helperText}</p>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Upload Status */}
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Uploading {progress}%...</span>
        </div>
      )}
    </div>
  );
}
