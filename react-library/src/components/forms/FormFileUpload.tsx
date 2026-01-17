"use client";

/**
 * FormFileUpload Component
 * Framework-agnostic file upload input with drag-and-drop
 *
 * Purpose: File upload with preview and validation
 * Note: Does NOT include actual upload logic - that should be injectable
 *
 * @example Basic Usage
 * ```tsx
 * const [files, setFiles] = useState<File[]>([]);
 *
 * <FormFileUpload
 *   label="Upload Images"
 *   accept="image/*"
 *   multiple
 *   value={files}
 *   onChange={setFiles}
 * />
 * ```
 *
 * @example With Upload Handler
 * ```tsx
 * <FormFileUpload
 *   label="Upload Files"
 *   value={files}
 *   onChange={setFiles}
 *   onUpload={async (file) => {
 *     const formData = new FormData();
 *     formData.append('file', file);
 *     const response = await fetch('/api/upload', {
 *       method: 'POST',
 *       body: formData
 *     });
 *     return await response.json();
 *   }}
 *   maxSize={5 * 1024 * 1024} // 5MB
 *   maxFiles={10}
 * />
 * ```
 */

import { useCallback, useRef, useState } from "react";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Default icons
function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

export interface FormFileUploadProps {
  /** Input label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Accepted file types (e.g., "image/*", ".pdf,.doc") */
  accept?: string;
  /** Allow multiple files */
  multiple?: boolean;
  /** Current files */
  value?: File[];
  /** Called when files change */
  onChange?: (files: File[]) => void;
  /** Called when file should be uploaded (injectable) */
  onUpload?: (file: File) => Promise<{ url: string } | void>;
  /** Called when file should be removed */
  onRemove?: (file: File) => void;
  /** Max file size in bytes */
  maxSize?: number;
  /** Max number of files */
  maxFiles?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Show file previews (images only) */
  showPreviews?: boolean;
  /** Custom upload icon */
  UploadIcon?: React.ComponentType<{ className?: string }>;
  /** Custom remove icon */
  RemoveIcon?: React.ComponentType<{ className?: string }>;
  /** Custom file icon */
  FileIcon?: React.ComponentType<{ className?: string }>;
}

export function FormFileUpload({
  label,
  helperText,
  error,
  accept,
  multiple = false,
  value = [],
  onChange,
  onUpload,
  onRemove,
  maxSize,
  maxFiles,
  disabled = false,
  required = false,
  showPreviews = true,
  UploadIcon: UploadIconProp = UploadIcon,
  RemoveIcon = XIcon,
  FileIcon: FileIconProp = FileIcon,
}: FormFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (maxSize && file.size > maxSize) {
      return `File size exceeds ${formatFileSize(maxSize)}`;
    }
    return null;
  };

  const handleFiles = useCallback(
    (newFiles: FileList | File[]) => {
      const filesArray = Array.from(newFiles);

      // Validate max files
      if (maxFiles && value.length + filesArray.length > maxFiles) {
        // Just take what we can fit
        const remaining = maxFiles - value.length;
        filesArray.splice(remaining);
      }

      // Validate each file
      const validFiles: File[] = [];
      for (const file of filesArray) {
        const validationError = validateFile(file);
        if (!validationError) {
          validFiles.push(file);
        }
      }

      if (validFiles.length > 0) {
        const updatedFiles = multiple ? [...value, ...validFiles] : validFiles;
        onChange?.(updatedFiles);

        // Upload files if handler provided
        validFiles.forEach((file) => {
          onUpload?.(file);
        });
      }
    },
    [value, onChange, onUpload, multiple, maxFiles, maxSize]
  );

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!disabled && e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemove = (fileToRemove: File) => {
    const updatedFiles = value.filter((f) => f !== fileToRemove);
    onChange?.(updatedFiles);
    onRemove?.(fileToRemove);
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const isImage = (file: File) => file.type.startsWith("image/");

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragging &&
            !disabled &&
            "border-blue-500 bg-blue-50 dark:bg-blue-900/20",
          !isDragging &&
            !disabled &&
            "border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500",
          disabled &&
            "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 cursor-not-allowed",
          !!error && "border-red-300 dark:border-red-700"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="hidden"
          aria-label={label || "File upload"}
        />

        <UploadIconProp className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />

        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
        </p>

        {helperText && !error && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {helperText}
          </p>
        )}

        {maxSize && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Max size: {formatFileSize(maxSize)}
          </p>
        )}

        {maxFiles && multiple && (
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Max files: {maxFiles} ({value.length} / {maxFiles})
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
      )}

      {/* File List */}
      {value.length > 0 && (
        <div className="space-y-2">
          {value.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
            >
              {/* Preview or Icon */}
              {showPreviews && isImage(file) ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <FileIconProp className="w-8 h-8 text-gray-400 dark:text-gray-500" />
              )}

              {/* File Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatFileSize(file.size)}
                </p>
              </div>

              {/* Remove Button */}
              {!disabled && (
                <button
                  onClick={() => handleRemove(file)}
                  className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400 transition-colors"
                  aria-label={`Remove ${file.name}`}
                >
                  <RemoveIcon className="w-5 h-5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
