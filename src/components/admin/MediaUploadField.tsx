/**
 * MediaUploadField — embeddable single-file upload field for forms.
 *
 * SCOPE: Use for video, document, or any non-image file fields inside forms.
 * For image fields specifically, prefer <ImageUpload> (images-only, with preview).
 *
 * UPLOAD PATH: caller-provided onUpload() → /api/media/upload (Firebase Admin SDK).
 * Pass `onUpload` from `useMediaUpload().upload`. The component is upload-agnostic.
 * Never calls Firebase Storage client SDK.
 */
"use client";

import { useState, useRef, ChangeEvent } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { THEME_CONSTANTS } from "@/constants";
import { useCamera } from "@/hooks";
import {
  Alert,
  Button,
  CameraCapture,
  Label,
  Span,
  Spinner,
  Text,
  TextLink,
} from "@/components";

export interface MediaUploadFieldProps {
  /** Required label shown above the upload control */
  label: string;
  /** Current file URL — empty string when no file has been uploaded */
  value: string;
  /** Called with the new URL after a successful upload or removal */
  onChange: (url: string) => void;
  /** Upload function: receives the selected File, returns the uploaded URL. Use useMediaUpload().upload. */
  onUpload: (file: File) => Promise<string>;
  /** MIME type filter, e.g. "video/*", "image/*", "application/pdf" or "*" */
  accept?: string;
  /** Maximum file size in MB (default: 50) */
  maxSizeMB?: number;
  /** Disables the control (readonly view) */
  disabled?: boolean;
  /** Optional helper text shown below the control */
  helperText?: string;
  /**
   * Controls which capture source(s) are available:
   * - 'file-only': file picker only (default)
   * - 'camera-only': camera viewfinder; falls back to <input capture> on unsupported devices
   * - 'both': segmented toggle between file picker and camera viewfinder
   */
  captureSource?: "file-only" | "camera-only" | "both";
  /**
   * What the camera should capture when captureSource includes camera:
   * - 'photo': still image only
   * - 'video': video recording only
   * - 'both': user can switch between photo and video capture
   */
  captureMode?: "photo" | "video" | "both";
}

function isVideo(url: string): boolean {
  return /\.(mp4|webm|ogg|mov|avi)(\?|$)/i.test(url);
}

function isImage(url: string): boolean {
  return /\.(jpe?g|png|gif|webp|svg)(\?|$)/i.test(url);
}

function filenameFromUrl(url: string): string {
  try {
    const parts = new URL(url).pathname.split("/");
    return decodeURIComponent(parts[parts.length - 1] || url);
  } catch {
    return url;
  }
}

export function MediaUploadField({
  label,
  value,
  onChange,
  onUpload,
  accept = "*",
  maxSizeMB = 50,
  disabled = false,
  helperText,
  captureSource = "file-only",
  captureMode = "photo",
}: MediaUploadFieldProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCaptureRef = useRef<HTMLInputElement>(null);

  const t = useTranslations("camera");
  const tUpload = useTranslations("upload");
  const { isSupported: isCameraSupported } = useCamera();
  const [inputMode, setInputMode] = useState<"file" | "camera">("file");

  const showCamera =
    captureSource === "camera-only" ||
    (captureSource === "both" && inputMode === "camera");
  const showFileInput =
    captureSource === "file-only" ||
    (captureSource === "both" && inputMode === "file");

  // MIME type for the mobile capture fallback input
  const captureModeAccept =
    captureMode === "video"
      ? "video/*"
      : captureMode === "both"
        ? "image/*,video/*"
        : "image/*";

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSizeMB) {
      setError(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }

    // Reset input so the same file can be re-selected after an error
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
    setError(null);
  };

  const handleCameraCapture = async (blob: Blob, type: "photo" | "video") => {
    const ext = type === "video" ? "webm" : "webp";
    const file = new File([blob], `camera-capture.${ext}`, { type: blob.type });
    setError(null);
    setIsLoading(true);
    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setIsLoading(false);
    }
  };

  const { themed, spacing } = THEME_CONSTANTS;

  return (
    <div className={spacing.stack}>
      {/* Label */}
      <Label className={`block text-sm font-medium ${themed.textSecondary}`}>
        {label}
      </Label>

      {/* Current file preview */}
      {value && !isLoading && (
        <div
          className={`rounded-lg border ${themed.border} ${themed.bgSecondary} p-3`}
        >
          {isVideo(value) ? (
            <video
              src={value}
              controls
              className="w-full max-h-56 rounded"
              aria-label={label}
            />
          ) : isImage(value) ? (
            <Image
              src={value}
              alt={label}
              width={400}
              height={224}
              className="w-full max-h-56 object-contain rounded"
              unoptimized
            />
          ) : (
            <TextLink href={value} className="text-sm underline break-all">
              {filenameFromUrl(value)}
            </TextLink>
          )}

          {!disabled && (
            <Button
              type="button"
              onClick={handleRemove}
              variant="danger"
              size="sm"
              className="mt-2"
            >
              {tUpload("remove")}
            </Button>
          )}
        </div>
      )}

      {/* Upload controls (capture source toggle + upload/camera area) */}
      {!disabled && !isLoading && (
        <>
          {/* Capture source toggle */}
          {captureSource === "both" && isCameraSupported && (
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant={inputMode === "file" ? "primary" : "outline"}
                size="sm"
                onClick={() => setInputMode("file")}
              >
                {t("switchToUpload")}
              </Button>
              <Button
                type="button"
                variant={inputMode === "camera" ? "primary" : "outline"}
                size="sm"
                onClick={() => setInputMode("camera")}
              >
                {t("switchToCamera")}
              </Button>
            </div>
          )}

          {/* Camera viewfinder */}
          {showCamera && isCameraSupported && (
            <CameraCapture
              mode={captureMode}
              facingMode="environment"
              onCapture={handleCameraCapture}
              onError={(msg) => setError(msg)}
            />
          )}

          {/* Mobile camera fallback */}
          {showCamera && !isCameraSupported && (
            <Button
              type="button"
              onClick={() => mobileCaptureRef.current?.click()}
              variant="ghost"
              className={`w-full py-3 border-2 border-dashed ${themed.border} rounded-xl text-sm ${themed.textSecondary} ${themed.hoverBorder} transition-colors`}
            >
              {t("switchToCamera")}
            </Button>
          )}

          {/* File picker */}
          {showFileInput && (
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              variant="ghost"
              className={`w-full py-3 border-2 border-dashed ${themed.border} rounded-xl text-sm ${themed.textSecondary} ${themed.hoverBorder} transition-colors`}
            >
              {value ? tUpload("replaceFile") : tUpload("chooseFile")}
            </Button>
          )}
        </>
      )}

      {/* Uploading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2">
          <Spinner size="sm" />
          <Text size="sm" variant="secondary">
            {tUpload("uploading")}
          </Text>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Mobile camera fallback input */}
      {showCamera && !isCameraSupported && (
        <input
          ref={mobileCaptureRef}
          type="file"
          accept={captureModeAccept}
          capture="environment"
          onChange={handleFileChange}
          className="hidden"
          aria-hidden="true"
        />
      )}

      {/* Helper text */}
      {helperText && !error && (
        <Text variant="secondary" size="xs">
          {helperText}
        </Text>
      )}

      {/* Error */}
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
