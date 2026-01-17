"use client";

/**
 * useMediaUpload Hook
 *
 * Generic hook for media uploads with retry logic, progress tracking, and validation.
 * Designed for use with the ImageUploadWithCrop and VideoUploadWithThumbnail components.
 *
 * Supports pluggable upload services (API-based, Storage-based, or custom implementations).
 */

import { useCallback, useState } from "react";
import type { UploadService } from "../types/adapters";

export interface MediaUploadOptions {
  /** Upload service implementation (API-based, Storage-based, or custom) */
  uploadService: UploadService;
  /** Maximum file size in bytes (default: 10MB) */
  maxSize?: number;
  /** Allowed MIME types (e.g., ['image/jpeg', 'image/png']) */
  allowedTypes?: string[];
  /** Maximum retry attempts (default: 3) */
  maxRetries?: number;
  /** Callback for upload progress updates (0-100) */
  onProgress?: (progress: number) => void;
  /** Callback for successful upload with URL */
  onSuccess?: (url: string) => void;
  /** Callback for upload errors */
  onError?: (error: string) => void;
  /** Enable auto-delete after 24 hours */
  autoDelete?: boolean;
  /** Upload context identifier (e.g., 'product', 'profile', 'auction') */
  context?: string;
  /** Related entity ID for context */
  contextId?: string;
  /** Custom upload path pattern */
  pathPattern?: string;
}

export interface MediaUploadReturn {
  /** Upload file to server */
  upload: (file: File) => Promise<string>;
  /** Retry the last failed upload */
  retry: () => Promise<string | null>;
  /** Cancel current upload */
  cancel: () => void;
  /** Reset all state */
  reset: () => void;
  /** Whether an upload is in progress */
  isUploading: boolean;
  /** Upload progress (0-100) */
  progress: number;
  /** Error message if upload failed */
  error: string | null;
  /** URL of uploaded file */
  uploadedUrl: string | null;
  /** Unique upload tracking ID */
  uploadId: string | null;
}

/**
 * Validate file against size and type constraints
 */
function validateFile(
  file: File,
  maxSize?: number,
  allowedTypes?: string[]
): { isValid: boolean; error?: string } {
  if (!file) {
    return {
      isValid: false,
      error: "File is required",
    };
  }

  if (typeof file !== "object" || !(file instanceof File)) {
    return {
      isValid: false,
      error: "Invalid file object",
    };
  }

  // Check file size
  if (maxSize && file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum (${maxSizeMB}MB)`,
    };
  }

  // Check file type
  if (allowedTypes && allowedTypes.length > 0) {
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Generate unique ID for upload tracking
 */
function generateUploadId(): string {
  return `upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Hook for handling media uploads with progress tracking and validation
 *
 * @example
 * ```typescript
 * const { upload, isUploading, progress, error } = useMediaUpload({
 *   maxSize: 5 * 1024 * 1024, // 5MB
 *   allowedTypes: ['image/jpeg', 'image/png'],
 *   onSuccess: (url) => console.log('Uploaded:', url),
 *   onError: (error) => console.error('Error:', error),
 * });
 *
 * const handleUpload = async (file: File) => {
 *   try {
 *     const url = await upload(file);
 *     console.log('Upload complete:', url);
 *   } catch (err) {
 *     console.error('Upload failed:', err);
 *   }
 * };
 * ```
 */
export function useMediaUpload(options: MediaUploadOptions): MediaUploadReturn {
  // Validate required options
  if (!options.uploadService) {
    throw new Error(
      "uploadService is required. Provide an UploadService implementation (ApiUploadService, StorageUploadService, or custom)"
    );
  }

  // Validate optional options
  if (
    options.maxSize !== undefined &&
    (typeof options.maxSize !== "number" || options.maxSize <= 0)
  ) {
    throw new Error("maxSize must be a positive number");
  }

  if (
    options.maxRetries !== undefined &&
    (typeof options.maxRetries !== "number" || options.maxRetries < 0)
  ) {
    throw new Error("maxRetries must be a non-negative number");
  }

  if (
    options.allowedTypes !== undefined &&
    !Array.isArray(options.allowedTypes)
  ) {
    throw new Error("allowedTypes must be an array");
  }

  const {
    uploadService,
    maxSize,
    allowedTypes,
    maxRetries = 3,
    onProgress,
    onSuccess,
    onError,
    autoDelete = false,
    context,
    contextId,
    pathPattern,
  } = options;

  const [uploadId, setUploadId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<File | null>(null);

  /**
   * Upload file with progress tracking
   */
  const upload = useCallback(
    async (file: File): Promise<string> => {
      if (!file) {
        const error = "File is required for upload";
        setError(error);
        onError?.(error);
        throw new Error(error);
      }

      setError(null);
      setProgress(0);
      setUploadedUrl(null);
      setIsUploading(true);
      setLastFile(file);

      let preview: string | undefined;
      const id = generateUploadId();
      setUploadId(id);

      try {
        // Validate file
        const validation = validateFile(file, maxSize, allowedTypes);

        if (!validation.isValid) {
          throw new Error(validation.error || "Invalid file");
        }

        // Create preview if it's an image
        if (file.type.startsWith("image/")) {
          preview = URL.createObjectURL(file);
        }

        // Build metadata
        const metadata: Record<string, any> = {};
        if (autoDelete) {
          metadata.autoDelete = true;
        }
        if (context) {
          metadata.context = context;
        }
        if (contextId) {
          metadata.contextId = contextId;
        }

        // Build custom path if pattern provided
        let uploadPath: string | undefined;
        if (pathPattern) {
          uploadPath = pathPattern
            .replace("{context}", context || "default")
            .replace("{contextId}", contextId || "")
            .replace("{timestamp}", Date.now().toString())
            .replace("{filename}", file.name);
        }

        // Use the provided upload service
        const url = await uploadService.upload(file, {
          path: uploadPath,
          metadata,
          onProgress: (progressPercent) => {
            setProgress(progressPercent);
            onProgress?.(progressPercent);
          },
        });

        // Cleanup preview blob URL
        if (preview) {
          URL.revokeObjectURL(preview);
        }

        setUploadedUrl(url);
        setProgress(100);
        onSuccess?.(url);

        return url;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        onError?.(errorMessage);

        // Cleanup preview blob URL on error
        if (preview) {
          URL.revokeObjectURL(preview);
        }

        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [
      uploadService,
      maxSize,
      allowedTypes,
      onProgress,
      onSuccess,
      onError,
      autoDelete,
      context,
      contextId,
      pathPattern,
    ]
  );

  /**
   * Retry the last failed upload
   */
  const retry = useCallback(async (): Promise<string | null> => {
    if (!lastFile) {
      const error = "No file available to retry upload";
      setError(error);
      return null;
    }

    return upload(lastFile);
  }, [lastFile, upload]);

  /**
   * Cancel current upload
   */
  const cancel = useCallback(() => {
    setUploadId(null);
    setIsUploading(false);
    setProgress(0);
    setError("Upload cancelled");
  }, []);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    setUploadId(null);
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setUploadedUrl(null);
    setLastFile(null);
  }, []);

  return {
    upload,
    retry,
    cancel,
    reset,
    isUploading,
    progress,
    error,
    uploadedUrl,
    uploadId,
  };
}
