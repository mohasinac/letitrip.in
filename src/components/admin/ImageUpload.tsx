/**
 * ImageUpload — Canonical image upload component for all content images.
 *
 * SCOPE: Use for ANY form field that produces an image URL:
 *   - Product main image / gallery images
 *   - Blog post cover image
 *   - Category thumbnail / banner
 *   - Carousel slide image
 *   - Any other content image
 *
 * UPLOAD PATH: Stages locally → caller-provided onUpload() → /api/media/upload.
 * The component is upload-agnostic: pass `onUpload` from `useMediaUpload().upload`
 * (or any function that accepts a File and returns Promise<string>).
 *
 * For PROFILE AVATARS specifically, use <AvatarUpload> (src/components/AvatarUpload.tsx).
 */
"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { formatFileSize } from "@/utils";
import { useCamera } from "@/hooks";
import { Button, CameraCapture, Label, Span, Text } from "@/components";

const { flex, position } = THEME_CONSTANTS;

export interface ImageUploadProps {
  /** Current image URL to pre-populate the preview */
  currentImage?: string;
  /** Upload function: receives the selected File, returns the uploaded URL. Use useMediaUpload().upload. */
  onUpload: (file: File) => Promise<string>;
  /** Called after a successful upload or removal with the resulting URL (empty string on remove) */
  onChange?: (url: string) => void;
  accept?: string;
  maxSizeMB?: number;
  label?: string;
  helperText?: string;
  /**
   * Controls which capture source(s) are available:
   * - 'file-only': file picker only (default)
   * - 'camera-only': camera viewfinder; falls back to <input capture> on unsupported devices
   * - 'both': segmented toggle between file picker and camera viewfinder
   */
  captureSource?: "file-only" | "camera-only" | "both";
}

export function ImageUpload({
  currentImage,
  onUpload,
  onChange,
  accept = "image/jpeg,image/png,image/gif,image/webp",
  maxSizeMB = 10,
  label = "Upload Image",
  helperText,
  captureSource = "file-only",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string>(currentImage || "");
  const [error, setError] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCaptureRef = useRef<HTMLInputElement>(null);

  const t = useTranslations("camera");
  const { isSupported: isCameraSupported } = useCamera();
  const [captureMode, setCaptureMode] = useState<"file" | "camera">("file");

  const showCamera =
    captureSource === "camera-only" ||
    (captureSource === "both" && captureMode === "camera");
  const showFileInput =
    captureSource === "file-only" ||
    (captureSource === "both" && captureMode === "file");

  const handleCameraCapture = async (blob: Blob, _type: "photo" | "video") => {
    const file = new File([blob], "camera-capture.webp", {
      type: "image/webp",
    });
    setError("");
    setProgress(0);
    try {
      setUploading(true);
      setProgress(30);
      const url = await onUpload(file);
      setProgress(100);
      setPreview(url);
      onChange?.(url);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
      setPreview(currentImage || "");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

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
        `File size must be less than ${maxSizeMB}MB (current: ${formatFileSize(file.size)})`,
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

    // Upload via caller-provided function
    try {
      setUploading(true);
      setProgress(10);
      setProgress(30);
      const url = await onUpload(file);
      setProgress(100);
      setPreview(url);
      onChange?.(url);
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
    onChange?.("");
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Label */}
      {label && (
        <Label
          className={`block text-sm font-medium ${THEME_CONSTANTS.themed.textSecondary}`}
        >
          {label}
        </Label>
      )}

      {/* Preview Area */}
      <div className="relative">
        {preview ? (
          <div
            className={`relative group h-64 overflow-hidden rounded-lg border-2 ${THEME_CONSTANTS.themed.border}`}
          >
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
              unoptimized
            />

            {/* Overlay with actions */}
            <div
              className={`${position.fill} bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg ${flex.center} gap-3`}
            >
              <Button
                type="button"
                onClick={handleClick}
                disabled={uploading}
                variant="secondary"
                size="sm"
                className="px-4 py-2 bg-white text-zinc-900 rounded-md hover:bg-zinc-100 transition-colors duration-200 font-medium"
              >
                Change
              </Button>
              <Button
                type="button"
                onClick={handleRemove}
                disabled={uploading}
                variant="danger"
                size="sm"
                className="px-4 py-2"
              >
                Remove
              </Button>
            </div>

            {/* Upload Progress */}
            {uploading && progress > 0 && (
              <div className="absolute inset-x-0 bottom-0 h-2 bg-zinc-200 dark:bg-slate-700 rounded-b-lg overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Capture source toggle */}
            {captureSource === "both" && isCameraSupported && (
              <div className={`${flex.center} gap-2 mb-3`}>
                <Button
                  type="button"
                  variant={captureMode === "file" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setCaptureMode("file")}
                >
                  {t("switchToUpload")}
                </Button>
                <Button
                  type="button"
                  variant={captureMode === "camera" ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setCaptureMode("camera")}
                >
                  {t("switchToCamera")}
                </Button>
              </div>
            )}

            {/* Camera viewfinder */}
            {showCamera && isCameraSupported && (
              <CameraCapture
                mode="photo"
                facingMode="environment"
                onCapture={handleCameraCapture}
                onError={setError}
              />
            )}

            {/* Mobile camera fallback — no getUserMedia support */}
            {showCamera && !isCameraSupported && (
              <Button
                type="button"
                onClick={() => mobileCaptureRef.current?.click()}
                disabled={uploading}
                variant="ghost"
                className={`w-full h-64 border-2 border-dashed ${THEME_CONSTANTS.themed.border} rounded-lg ${THEME_CONSTANTS.themed.hoverBorder} transition-colors duration-200 ${flex.centerCol} ${THEME_CONSTANTS.themed.textSecondary} ${THEME_CONSTANTS.themed.bgTertiary}`}
              >
                <Span className="text-sm font-medium">
                  {t("switchToCamera")}
                </Span>
              </Button>
            )}

            {/* File picker */}
            {showFileInput && (
              <Button
                type="button"
                onClick={handleClick}
                disabled={uploading}
                variant="ghost"
                className={`w-full h-64 border-2 border-dashed ${THEME_CONSTANTS.themed.border} rounded-lg ${THEME_CONSTANTS.themed.hoverBorder} transition-colors duration-200 ${flex.centerCol} ${THEME_CONSTANTS.themed.textSecondary} ${THEME_CONSTANTS.themed.bgTertiary}`}
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
                <Span className="text-sm font-medium">
                  {uploading ? "Uploading..." : "Click to upload"}
                </Span>
                <Span className="text-xs mt-1">
                  {accept
                    .split(",")
                    .map((mimeType) => mimeType.split("/")[1].toUpperCase())
                    .join(", ")}{" "}
                  (max {maxSizeMB}MB)
                </Span>
              </Button>
            )}
          </>
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

      {/* Mobile camera fallback input */}
      {showCamera && !isCameraSupported && (
        <input
          ref={mobileCaptureRef}
          type="file"
          accept="image/*"
          capture="environment" // eslint-disable-line react/no-unknown-property
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <Text variant="secondary" size="xs">
          {helperText}
        </Text>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
          <Text variant="error" size="sm">
            {error}
          </Text>
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
          <Span>Uploading {progress}%...</Span>
        </div>
      )}
    </div>
  );
}
