/**
 * MediaUploadField — embeddable single-file upload field for forms.
 *
 * SCOPE: Use for video, document, or any non-image file fields inside forms.
 * For image fields specifically, prefer <ImageUpload> (images-only, with preview).
 *
 * UPLOAD PATH: useMediaUpload → POST /api/media/upload (Firebase Admin SDK).
 * Never calls Firebase Storage client SDK.
 */
"use client";

import { useRef, ChangeEvent } from "react";
import Image from "next/image";
import { THEME_CONSTANTS } from "@/constants";
import { useMediaUpload } from "@/hooks";
import { Alert, Button, Label, Span, Spinner, Text, TextLink } from "@/components";

interface MediaUploadFieldProps {
  /** Required label shown above the upload control */
  label: string;
  /** Current file URL — empty string when no file has been uploaded */
  value: string;
  /** Called with the new URL after a successful upload */
  onChange: (url: string) => void;
  /** MIME type filter, e.g. "video/*", "image/*", "application/pdf" or "*" */
  accept?: string;
  /** Maximum file size in MB (default: 50) */
  maxSizeMB?: number;
  /** Storage folder hint forwarded to /api/media/upload */
  folder?: string;
  /** Disables the control (readonly view) */
  disabled?: boolean;
  /** Optional helper text shown below the control */
  helperText?: string;
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
  accept = "*",
  maxSizeMB = 50,
  folder = "uploads",
  disabled = false,
  helperText,
}: MediaUploadFieldProps) {
  const uploadMutation = useMediaUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isLoading = uploadMutation.isLoading;
  const error = uploadMutation.error?.message ?? null;

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileSizeMB = file.size / 1024 / 1024;
    if (fileSizeMB > maxSizeMB) {
      return; // handled by the mutation error state
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("public", "true");

    try {
      const data = await uploadMutation.mutate(formData);
      if (data?.url) {
        onChange(data.url);
      }
    } catch {
      // error surfaced via uploadMutation.error
    }

    // Reset input so the same file can be re-selected after an error
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    onChange("");
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
            <TextLink
              href={value}
              className="text-sm underline break-all"
            >
              {filenameFromUrl(value)}
            </TextLink>
          )}

          {!disabled && (
            <Button
              type="button"
              onClick={handleRemove}
              variant="ghost"
              size="sm"
              className="mt-2 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-medium"
            >
              Remove
            </Button>
          )}
        </div>
      )}

      {/* Upload button / drop area */}
      {!disabled && !isLoading && (
        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          variant="ghost"
          className={`w-full py-3 border-2 border-dashed ${themed.border} rounded-lg text-sm ${themed.textSecondary} hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors`}
        >
          {value ? "Replace file" : "Choose file to upload"}
        </Button>
      )}

      {/* Uploading indicator */}
      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400">
          <Spinner size="sm" />
          <Span>Uploading…</Span>
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
