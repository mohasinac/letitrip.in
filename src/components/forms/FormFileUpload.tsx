/**
 * FormFileUpload Component
 *
 * File upload component with drag-and-drop, preview, and validation
 * Reuses useMediaUpload hook for upload logic
 */

import React, { forwardRef, useCallback, useRef, useState } from "react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { cn } from "@/lib/utils";

export interface FormFileUploadProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    "value" | "onChange" | "type"
  > {
  label?: string;
  error?: string;
  helperText?: string;
  value?: string | null; // URL of uploaded file
  onChange?: (url: string | null) => void;
  onFileSelect?: (file: File | null) => void;
  accept?: string; // File types e.g., "image/*,video/*"
  maxSize?: number; // Max file size in bytes
  allowedTypes?: string[]; // Allowed MIME types
  showPreview?: boolean; // Show file preview (default: true)
  previewHeight?: string; // Preview container height
  fullWidth?: boolean;
  compact?: boolean;
  autoUpload?: boolean; // Auto upload on file select (default: true)
}

export const FormFileUpload = forwardRef<
  HTMLInputElement,
  FormFileUploadProps
>(
  (
    {
      label,
      error,
      helperText,
      value,
      onChange,
      onFileSelect,
      accept,
      maxSize = 5 * 1024 * 1024, // 5MB default
      allowedTypes,
      showPreview = true,
      previewHeight = "200px",
      fullWidth = true,
      compact = false,
      className,
      disabled,
      autoUpload = true,
      ...props
    },
    ref
  ) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(value || null);

    // Initialize upload hook
    const {
      upload,
      isUploading,
      progress,
      error: uploadError,
    } = useMediaUpload({
      maxSize,
      allowedTypes,
      onSuccess: (url) => {
        setPreviewUrl(url);
        onChange?.(url);
      },
      onError: (err) => {
        console.error("Upload error:", err);
      },
    });

    // Handle file selection
    const handleFileSelect = useCallback(
      async (file: File | null) => {
        if (!file) {
          setSelectedFile(null);
          setPreviewUrl(null);
          onChange?.(null);
          onFileSelect?.(null);
          return;
        }

        setSelectedFile(file);
        onFileSelect?.(file);

        // Create preview for images
        if (showPreview && file.type.startsWith("image/")) {
          const objectUrl = URL.createObjectURL(file);
          setPreviewUrl(objectUrl);
        }

        // Auto-upload if enabled
        if (autoUpload) {
          try {
            await upload(file);
          } catch (err) {
            // Error handled by useMediaUpload
          }
        }
      },
      [upload, onChange, onFileSelect, showPreview, autoUpload]
    );

    // Manual upload trigger (when autoUpload is false)
    const handleManualUpload = useCallback(async () => {
      if (selectedFile) {
        try {
          await upload(selectedFile);
        } catch (err) {
          // Error handled by useMediaUpload
        }
      }
    }, [selectedFile, upload]);

    // Handle input change
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        handleFileSelect(file);
      },
      [handleFileSelect]
    );

    // Handle drag events
    const handleDragEnter = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
      (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (disabled) return;

        const file = e.dataTransfer.files[0];
        if (file) {
          handleFileSelect(file);
        }
      },
      [disabled, handleFileSelect]
    );

    // Handle click to open file dialog
    const handleClick = useCallback(() => {
      if (!disabled) {
        fileInputRef.current?.click();
      }
    }, [disabled]);

    // Handle clear
    const handleClear = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedFile(null);
        setPreviewUrl(null);
        onChange?.(null);
        onFileSelect?.(null);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
      [onChange, onFileSelect]
    );

    // Format file size
    const formatFileSize = (bytes: number): string => {
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    // Get file name
    const fileName = selectedFile?.name || null;
    const fileSize = selectedFile ? formatFileSize(selectedFile.size) : null;

    // Determine display error
    const displayError = error || uploadError;

    return (
      <div className={cn(fullWidth && "w-full", className)}>
        {/* Label */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Hidden file input */}
        <input
          ref={(node) => {
            // Assign to both refs
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
            // @ts-ignore
            fileInputRef.current = node;
          }}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
          {...props}
        />

        {/* Drop zone */}
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg transition-all cursor-pointer",
            compact ? "p-4" : "p-6",
            isDragging
              ? "border-blue-500 bg-blue-50"
              : displayError
                ? "border-red-300 bg-red-50"
                : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100",
            disabled &&
              "cursor-not-allowed opacity-50 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          {/* Preview or upload prompt */}
          {showPreview && previewUrl && selectedFile?.type.startsWith("image/") ? (
            <div className="relative">
              <img
                src={previewUrl}
                alt="Preview"
                style={{ height: previewHeight }}
                className="w-full object-contain rounded-lg"
              />

              {/* Clear button on preview */}
              <button
                type="button"
                onClick={handleClear}
                disabled={disabled || isUploading}
                className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Clear file"
              >
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Upload progress overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                  <div className="text-white text-center">
                    <div className="mb-2">Uploading...</div>
                    <div className="w-48 bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="mt-2 text-sm">{progress}%</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center">
              {/* Upload icon */}
              <svg
                className={cn(
                  "mx-auto mb-3 text-gray-400",
                  compact ? "w-8 h-8" : "w-12 h-12"
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>

              {/* Upload text */}
              <div className={cn("mb-2", compact ? "text-sm" : "text-base")}>
                {fileName ? (
                  <>
                    <div className="font-medium text-gray-900">{fileName}</div>
                    {fileSize && (
                      <div className="text-sm text-gray-500 mt-1">{fileSize}</div>
                    )}
                  </>
                ) : (
                  <>
                    <span className="text-blue-600 font-medium">Click to upload</span>
                    <span className="text-gray-600"> or drag and drop</span>
                  </>
                )}
              </div>

              {/* File type hint */}
              {!fileName && accept && (
                <div className="text-xs text-gray-500">
                  {accept.includes("image") && "Images only"}
                  {accept.includes("video") && "Videos only"}
                  {accept.includes("application/pdf") && "PDF files only"}
                </div>
              )}

              {/* Size limit hint */}
              {!fileName && maxSize && (
                <div className="text-xs text-gray-500 mt-1">
                  Max size: {formatFileSize(maxSize)}
                </div>
              )}

              {/* Upload progress (non-image files) */}
              {isUploading && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-2 text-sm text-gray-600">{progress}%</div>
                </div>
              )}

              {/* Manual upload button (when autoUpload is false) */}
              {!autoUpload && selectedFile && !isUploading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleManualUpload();
                  }}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Upload File
                </button>
              )}

              {/* Clear button (non-image files or when no preview) */}
              {fileName && !isUploading && (
                <button
                  type="button"
                  onClick={handleClear}
                  disabled={disabled}
                  className="mt-3 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* Error message */}
        {displayError && (
          <p className="mt-1 text-sm text-red-600">{displayError}</p>
        )}

        {/* Helper text */}
        {helperText && !displayError && (
          <p className="mt-1 text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

FormFileUpload.displayName = "FormFileUpload";
