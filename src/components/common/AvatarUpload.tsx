"use client";

import Image from "next/image";
import { ChangeEvent, useRef, useState } from "react";

interface AvatarUploadProps {
  currentAvatar?: string;
  userName: string;
  onUploadSuccess?: (avatarUrl: string) => void;
  onUploadError?: (error: string) => void;
  className?: string;
}

export default function AvatarUpload({
  currentAvatar = "/avatars/default.jpg",
  userName,
  onUploadSuccess,
  onUploadError,
  className = "",
}: AvatarUploadProps) {
  const [avatar, setAvatar] = useState(currentAvatar);
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!validTypes.includes(file.type)) {
      onUploadError?.(
        "Invalid file type. Please upload JPEG, PNG, WebP, or GIF images.",
      );
      return;
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      onUploadError?.("File size must be less than 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setShowPreview(true);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("avatar", file);

      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload avatar");
      }

      setAvatar(data.avatarUrl);
      setShowPreview(false);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      onUploadSuccess?.(data.avatarUrl);
    } catch (error) {
      console.error("Avatar upload error:", error);
      onUploadError?.(
        error instanceof Error ? error.message : "Failed to upload avatar",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!confirm("Are you sure you want to remove your avatar?")) return;

    setIsUploading(true);

    try {
      const response = await fetch("/api/user/avatar", {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to remove avatar");
      }

      setAvatar("/avatars/default.jpg");
      onUploadSuccess?.("/avatars/default.jpg");
    } catch (error) {
      console.error("Avatar removal error:", error);
      onUploadError?.(
        error instanceof Error ? error.message : "Failed to remove avatar",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Current Avatar */}
      <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
        <Image
          src={avatar}
          alt={userName}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Upload Button */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="absolute bottom-0 right-0 w-8 h-8 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors"
        title="Change avatar"
      >
        {isUploading ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
        ) : (
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        )}
      </button>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Remove Avatar Button */}
      {avatar !== "/avatars/default.jpg" && !showPreview && (
        <button
          type="button"
          onClick={handleRemove}
          disabled={isUploading}
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
        >
          Remove
        </button>
      )}

      {/* Preview Modal */}
      {showPreview && previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Preview Avatar
            </h3>

            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                {isUploading ? "Uploading..." : "Upload"}
              </button>
              <button
                onClick={handleCancelPreview}
                disabled={isUploading}
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
