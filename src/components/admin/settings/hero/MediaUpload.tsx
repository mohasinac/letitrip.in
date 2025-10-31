"use client";

import React, { useState, useRef } from "react";
import { CloudUpload, Camera, Trash2, Loader2 } from "lucide-react";

interface MediaUploadProps {
  onImageSelected: (imageUrl: string) => void;
  onVideoSelected?: (videoUrl: string) => void;
  currentImage?: string;
  currentVideo?: string;
  acceptedTypes?: string[];
  maxSize?: number; // in MB
}

export default function MediaUpload({
  onImageSelected,
  onVideoSelected,
  currentImage,
  currentVideo,
  acceptedTypes = [".jpg", ".jpeg", ".png", ".gif", ".mp4", ".webm"],
  maxSize = 25, // 25MB default
}: MediaUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // New state for local preview
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewType, setPreviewType] = useState<"image" | "video" | null>(
    null
  );

  // Cleanup preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleFileUpload = async (file: File) => {
    setError(null);

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    // Validate file type
    const fileType = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (!acceptedTypes.includes(fileType)) {
      setError(`Invalid file type. Accepted: ${acceptedTypes.join(", ")}`);
      return;
    }

    // Create local preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setPendingFile(file);

    // Determine media type
    const isVideo = fileType.includes(".mp4") || fileType.includes(".webm");
    setPreviewType(isVideo ? "video" : "image");
  };

  // Save/Upload the pending file
  const handleSaveMedia = async () => {
    if (!pendingFile || !previewType) return;

    setLoading(true);

    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", pendingFile);

      // Upload to your API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Upload failed");
      }

      const data = await response.json();
      const fileUrl = data.url;

      // Call appropriate callback
      if (previewType === "video") {
        onVideoSelected?.(fileUrl);
      } else {
        onImageSelected(fileUrl);
      }

      // Clear preview after successful upload
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(null);
      setPendingFile(null);
      setPreviewType(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // Cancel the pending upload
  const handleCancelPreview = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setPendingFile(null);
    setPreviewType(null);
    setError(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleCameraCapture = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleRemoveImage = () => {
    onImageSelected("");
  };

  const handleRemoveVideo = () => {
    onVideoSelected?.("");
  };

  return (
    <div className="space-y-4">
      {/* Upload Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <CloudUpload className="w-5 h-5" />
          {loading ? "Uploading..." : "Upload Image/Video"}
        </button>
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Camera className="w-5 h-5" />
          {loading ? "Capturing..." : "Use Camera"}
        </button>
      </div>

      {/* Hidden Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(",")}
        onChange={handleFileInputChange}
        className="hidden"
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        onChange={handleCameraCapture}
        className="hidden"
      />

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Loading Indicator */}
      {loading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 dark:text-blue-400" />
          <span className="ml-3 text-gray-700 dark:text-gray-300">
            Uploading...
          </span>
        </div>
      )}

      {/* Preview (Not Saved Yet) */}
      {previewUrl && previewType && (
        <div>
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">
            Preview (Not Saved Yet)
          </p>
          <div className="relative w-full rounded-lg border-3 border-blue-600 dark:border-blue-400 overflow-hidden shadow-lg">
            {previewType === "image" ? (
              <div
                className="w-full h-50"
                style={{
                  backgroundImage: `url(${previewUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ) : (
              <video
                src={previewUrl}
                className="w-full h-50 object-cover"
                controls
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <button
              onClick={handleSaveMedia}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? "Saving..."
                : `Save ${previewType === "image" ? "Image" : "Video"}`}
            </button>
            <button
              onClick={handleCancelPreview}
              disabled={loading}
              className="px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Current Image Preview */}
      {currentImage && !previewUrl && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Image
          </p>
          <div className="relative w-full h-50 rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
            <div
              className="w-full h-full"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <button
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Current Video Preview */}
      {currentVideo && !previewUrl && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Video
          </p>
          <div className="relative w-full rounded-lg border-2 border-gray-200 dark:border-gray-700 overflow-hidden">
            <video
              src={currentVideo}
              className="w-full h-50 object-cover"
              controls
            />
            <button
              onClick={handleRemoveVideo}
              className="absolute top-2 right-2 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/60 hover:bg-black/80 text-white text-sm transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove
            </button>
          </div>
        </div>
      )}

      {/* File Size Info */}
      <div className="inline-block px-3 py-1 rounded-lg border border-gray-300 dark:border-gray-600 text-xs text-gray-600 dark:text-gray-400">
        Max file size: {maxSize}MB | Accepted: {acceptedTypes.join(", ")}
      </div>
    </div>
  );
}
