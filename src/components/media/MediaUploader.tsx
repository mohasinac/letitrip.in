"use client";

import React, { useRef, useState } from "react";
import { Upload, Camera, Video, X, AlertCircle } from "lucide-react";
import { MediaFile, MediaType, MediaUploadOptions } from "@/types/media";
import { validateMedia } from "@/lib/media/media-validator";
import MediaPreviewCard from "./MediaPreviewCard";
import CameraCapture from "./CameraCapture";
import VideoRecorder from "./VideoRecorder";

interface MediaUploaderProps {
  accept?: "image" | "video" | "all";
  maxFiles?: number;
  resourceType?: "product" | "shop" | "category" | "user" | "auction";
  multiple?: boolean;
  onFilesAdded?: (files: MediaFile[]) => void;
  onFileRemoved?: (id: string) => void;
  files?: MediaFile[];
  className?: string;
  disabled?: boolean;
  enableCamera?: boolean;
  enableVideoRecording?: boolean;
}

export default function MediaUploader({
  accept = "all",
  maxFiles = 10,
  resourceType = "product",
  multiple = true,
  onFilesAdded,
  onFileRemoved,
  files = [],
  className = "",
  disabled = false,
  enableCamera = true,
  enableVideoRecording = true,
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [showVideoRecorder, setShowVideoRecorder] = useState(false);

  const acceptedTypes = {
    image: "image/*",
    video: "video/*",
    all: "image/*,video/*",
  };

  const canAddMore = files.length < maxFiles;

  const handleFiles = async (fileList: FileList) => {
    const newErrors: string[] = [];
    const validFiles: MediaFile[] = [];

    const filesToProcess = Array.from(fileList).slice(
      0,
      maxFiles - files.length
    );

    for (const file of filesToProcess) {
      // Determine media type
      let mediaType: MediaType;
      if (file.type.startsWith("image/")) {
        mediaType = "image";
      } else if (file.type.startsWith("video/")) {
        mediaType = "video";
      } else {
        mediaType = "document";
      }

      // Skip if not accepted type
      if (accept === "image" && mediaType !== "image") continue;
      if (accept === "video" && mediaType !== "video") continue;

      // Map resourceType to FILE_SIZE_LIMITS key
      let sizeLimitKey: keyof typeof import("@/constants/media").FILE_SIZE_LIMITS;
      if (mediaType === "image") {
        switch (resourceType) {
          case "product":
            sizeLimitKey = "PRODUCT_IMAGE";
            break;
          case "shop":
            sizeLimitKey = "SHOP_LOGO";
            break;
          case "category":
            sizeLimitKey = "CATEGORY_IMAGE";
            break;
          case "user":
            sizeLimitKey = "USER_AVATAR";
            break;
          case "auction":
            sizeLimitKey = "PRODUCT_IMAGE"; // Reuse product image limits
            break;
          default:
            sizeLimitKey = "PRODUCT_IMAGE";
        }
      } else if (mediaType === "video") {
        sizeLimitKey = "PRODUCT_VIDEO";
      } else {
        sizeLimitKey = "INVOICE";
      }

      // Validate file
      const validation = await validateMedia(file, sizeLimitKey, mediaType);

      if (validation.errors.length > 0) {
        newErrors.push(`${file.name}: ${validation.errors.join(", ")}`);
        continue;
      }

      // Create preview URL
      const preview = URL.createObjectURL(file);

      // Create MediaFile object
      const mediaFile: MediaFile = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file,
        type: mediaType,
        source: "file",
        preview,
        uploadStatus: "pending",
        uploadProgress: 0,
        metadata: {
          slug: "",
          description: "",
          size: file.size,
          mimeType: file.type,
        },
      };

      validFiles.push(mediaFile);
    }

    setErrors(newErrors);

    if (validFiles.length > 0 && onFilesAdded) {
      onFilesAdded(validFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || !canAddMore) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleClick = () => {
    if (!disabled && canAddMore) {
      fileInputRef.current?.click();
    }
  };

  const handleCameraCapture = (mediaFile: MediaFile) => {
    if (onFilesAdded) {
      onFilesAdded([mediaFile]);
    }
    setShowCamera(false);
  };

  const handleVideoRecorded = (mediaFile: MediaFile) => {
    if (onFilesAdded) {
      onFilesAdded([mediaFile]);
    }
    setShowVideoRecorder(false);
  };

  return (
    <div className={className}>
      {/* Camera Capture Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Video Recorder Modal */}
      {showVideoRecorder && (
        <VideoRecorder
          onRecorded={handleVideoRecorded}
          onClose={() => setShowVideoRecorder(false)}
        />
      )}
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : disabled || !canAddMore
            ? "border-gray-200 bg-gray-50 cursor-not-allowed"
            : "border-gray-300 hover:border-gray-400 cursor-pointer"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={(e) => e.key === "Enter" && handleClick()}
        role="button"
        tabIndex={disabled || !canAddMore ? -1 : 0}
        aria-label="Upload media files"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={acceptedTypes[accept]}
          multiple={multiple}
          onChange={handleChange}
          disabled={disabled || !canAddMore}
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />

        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {dragActive
            ? "Drop files here"
            : canAddMore
            ? "Upload media files"
            : `Maximum ${maxFiles} files reached`}
        </h3>

        <p className="text-sm text-gray-500 mb-4">
          {canAddMore
            ? "Drag & drop files here, or click to browse"
            : "Remove files to upload more"}
        </p>

        {/* Quick Action Buttons */}
        {canAddMore && !disabled && (
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Choose Files
            </button>

            {accept !== "video" && enableCamera && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCamera(true);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Camera
              </button>
            )}

            {accept !== "image" && enableVideoRecording && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowVideoRecorder(true);
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center gap-2"
              >
                <Video className="w-4 h-4" />
                Record Video
              </button>
            )}
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">
          {files.length} / {maxFiles} files
        </p>
      </div>

      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="mt-4 space-y-2">
          {errors.map((error, index) => (
            <div
              key={index}
              className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => setErrors(errors.filter((_, i) => i !== index))}
                className="ml-auto"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <MediaPreviewCard
              key={file.id}
              media={file}
              onRemove={() => onFileRemoved?.(file.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
