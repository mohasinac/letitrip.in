"use client";

import React from "react";
import Image from "next/image";
import { X, Edit2, RotateCw, AlertCircle, CheckCircle2 } from "lucide-react";
import { MediaFile } from "@/types/media";
import { formatFileSize, formatDuration } from "@/lib/media/media-validator";

interface MediaPreviewCardProps {
  media: MediaFile;
  onRemove?: () => void;
  onEdit?: () => void;
  onRetry?: () => void;
  showActions?: boolean;
  className?: string;
}

export default function MediaPreviewCard({
  media,
  onRemove,
  onEdit,
  onRetry,
  showActions = true,
  className = "",
}: MediaPreviewCardProps) {
  const isImage = media.type === "image";
  const isVideo = media.type === "video";
  const isUploading =
    media.uploadStatus === "uploading" || media.uploadStatus === "processing";
  const isError = media.uploadStatus === "failed";
  const isSuccess = media.uploadStatus === "completed";

  return (
    <div
      className={`relative group rounded-lg border bg-white overflow-hidden ${
        isError ? "border-red-300" : "border-gray-200"
      } ${className}`}
    >
      {/* Preview */}
      <div className="relative aspect-video bg-gray-100">
        {isImage && media.preview && (
          <Image
            src={media.preview}
            alt={media.file.name}
            fill
            className="object-cover"
          />
        )}
        {isVideo && media.preview && (
          <div className="relative w-full h-full">
            <video
              src={media.preview}
              className="w-full h-full object-cover"
              muted
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
              <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-t-transparent border-l-12 border-l-gray-800 border-b-8 border-b-transparent ml-1" />
              </div>
            </div>
          </div>
        )}
        {!media.preview && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-gray-400 text-sm">No preview</div>
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mb-2" />
              <div className="text-white text-sm font-medium">
                {media.uploadProgress}%
              </div>
            </div>
          </div>
        )}

        {/* Status Overlay */}
        {isError && (
          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
        )}
        {isSuccess && !isUploading && (
          <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
            <CheckCircle2 className="w-4 h-4 text-white" />
          </div>
        )}

        {/* Action Buttons */}
        {showActions && !isUploading && (
          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onEdit && !isError && (
              <button
                onClick={onEdit}
                className="p-1.5 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4 text-gray-700" />
              </button>
            )}
            {onRetry && isError && (
              <button
                onClick={onRetry}
                className="p-1.5 bg-white rounded-md shadow-sm hover:bg-gray-50 transition-colors"
                title="Retry Upload"
              >
                <RotateCw className="w-4 h-4 text-gray-700" />
              </button>
            )}
          </div>
        )}

        {showActions && onRemove && !isUploading && (
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 bg-white rounded-md shadow-sm hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
            title="Remove"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-3">
        <div className="text-sm font-medium text-gray-900 truncate mb-1">
          {media.file.name}
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{formatFileSize(media.file.size)}</span>
          {isVideo && media.metadata?.duration && (
            <span>{formatDuration(media.metadata.duration)}</span>
          )}
          {isImage && media.metadata?.dimensions && (
            <span>
              {media.metadata.dimensions.width} ×{" "}
              {media.metadata.dimensions.height}
            </span>
          )}
        </div>

        {/* Error Message */}
        {isError && media.error && (
          <div className="mt-2 text-xs text-red-600 bg-red-50 rounded px-2 py-1">
            {media.error}
          </div>
        )}

        {/* Upload Progress Bar */}
        {isUploading && (
          <div className="mt-2">
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-600 h-full transition-all duration-300"
                style={{ width: `${media.uploadProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
