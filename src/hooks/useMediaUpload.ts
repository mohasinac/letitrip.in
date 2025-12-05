/**
 * @fileoverview TypeScript Module
 * @module src/hooks/useMediaUpload
 * @description This file contains functionality related to useMediaUpload
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * useMediaUpload Hook
 *
 * Hook for media uploads with retry logic and validation
 */

import { useState, useCallback } from "react";
import { useUploadContext } from "@/contexts/UploadContext";

/**
 * MediaUploadOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for MediaUploadOptions
 */
export interface MediaUploadOptions {
  /** MaxSize */
  maxSize?: number; // Max file size in bytes
  /** AllowedTypes */
  allowedTypes?: string[]; // Allowed MIME types
  /** MaxRetries */
  maxRetries?: number; // Maximum retry attempts
  /** On Progress */
  onProgress?: (progress: number) => void;
  /** On Success */
  onSuccess?: (url: string) => void;
  /** On Error */
  onError?: (error: string) => void;
}

// Simple validation function
/**
 * Function: Validate File
 */
/**
 * Validates file
 *
 * @param {File} file - The file
 * @param {number} [maxSize] - The max size
 * @param {string[]} [allowedTypes] - The allowed types
 *
 * @returns {boolean} True if condition is met, false otherwise
 */

/**
 * Validates file
 *
 * @returns {number} The validatefile result
 */

function validateFile(
  /** File */
  file: File,
  /** Max Size */
  maxSize?: number,
  /** Allowed Types */
  allowedTypes?: string[],
): { isValid: boolean; error?: string } {
  // Check file size
  if (maxSize && file.size > maxSize) {
    /**
     * Performs max size m b operation
     *
     * @returns {any} The maxsizemb result
     */

    /**
     * Performs max size m b operation
     *
     * @returns {any} The maxsizemb result
     */

    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    /**
     * Performs file size m b operation
     *
     * @returns {any} The filesizemb result
     */

    /**
     * Performs file size m b operation
     *
     * @returns {any} The filesizemb result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      /** Is Valid */
      isValid: false,
      /** Error */
      error: `File size (${fileSizeMB}MB) exceeds maximum (${maxSizeMB}MB)`,
    };
  }

  // Check file type
  if (allowedTypes && allowedTypes.length > 0) {
    if (!allowedTypes.includes(file.type)) {
      return {
        /** Is Valid */
        isValid: false,
        /** Error */
        error: `File type ${file.type} is not allowed`,
      };
    }
  }

  return { isValid: true };
}

/**
 * Function: Use Media Upload
 */
/**
 * Custom React hook for media upload
 *
 * @param {MediaUploadOptions} [options] - Configuration options
 *
 * @returns {any} The usemediaupload result
 *
 * @example
 * useMediaUpload(options);
 */

/**
 * Custom React hook for media upload
 *
 * @param {MediaUploadOptions} [options] - Configuration options
 *
 * @returns {any} The usemediaupload result
 *
 * @example
 * useMediaUpload(options);
 */

export function useMediaUpload(options: MediaUploadOptions = {}) {
  const {
    maxSize,
    allowedTypes,
    maxRetries = 3,
    onProgress,
    onSuccess,
    onError,
  } = options;

  const { addUpload, updateUpload, removeUpload, retryUpload } =
    useUploadContext();
  const [uploadId, setUploadId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);

  // Validate and upload file
  /**
 * Performs upload operation
 *
 * @param {File} async(file - The async(file
 *
 * @returns {Promise<string> =>} The upload result
 *
 */
const upload = useCallback(
    async (file: File): Promise<string> => {
      setError(null);
      setProgress(0);
      setUploadedUrl(null);
      setIsUploading(true);

      try {
        // Validate file
        const validation = validateFile(file, maxSize, allowedTypes);

        if (!validation.isValid) {
          throw new Error(validation.error || "Invalid file");
        }

        // Create preview if it's an image
        let preview: string | undefined;
        if (file.type.startsWith("image/")) {
          preview = URL.createObjectURL(file);
        }

        // Add to upload context
        const id = addUpload(file, preview);
        setUploadId(id);

        // Create form data
        const formData = new FormData();
        f/**
 * Performs upload promise operation
 *
 * @param {any} (resolve - The (resolve
 * @param {any} reject - The reject
 *
 * @returns {any} The uploadpromise result
 *
 */
ormData.append("file", file);

        // Upload with XMLHttpRequest for progress tracking
        const xhr = new XMLHttpRequest();

        const uploadPromise = new Promise<string>((resolve, reject) => {
          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const progressPercent = Math.round((e.loaded / e.total) * 100);
              setProgress(progressPercent);
              onProgress?.(progressPercent);
              updateUpload(id, { progress: progressPercent });
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const response = JSON.parse(xhr.responseText);
              const url = response.url || response.data?.url;

              if (!url) {
                reject(new Error("No URL returned from upload"));
                return;
              }

              resolve(url);
            } else {
              let errorMessage = `Upload failed with status ${xhr.status}`;
              try {
                const errorResponse = JSON.parse(xhr.responseText);
                errorMessage = errorResponse.error?.message || errorMessage;
              } catch {
                // Ignore JSON parse error
              }
              reject(new Error(errorMessage));
            }
          });

          xhr.addEventListener("error", () => {
            reject(new Error("Network error during upload"));
          });

          xhr.addEventListener("abort", () => {
            reject(new Error("Upload aborted"));
          });

          updateUpload(id, { status: "uploading" });
          xhr.open("POST", "/api/media/upload");
          xhr.send(formData);
        });

        const url = await uploadPromise;

        // Update context as successful
        updateUpload(id, {
          /** Status */
          status: "success",
          /** Progress */
          progress: 100,
          url,
          /** Uploaded At */
          uploadedAt: new Date(),
        });

        setUploadedUrl(url);
        setProgress(100);
        onSuccess?.(url);

        return url;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Upload failed";
        setError(errorMessage);
        onError?.(errorMessage);

        if (uploadId) {
          updateUpload(uploadId, {
            /** Status */
            status: "error",
            /** Error */
            error: errorMessage,
            /** Progress */
  /**
 * Performs retry operation
 *
 * @param {any} async( - The async(
 *
 * @returns {Promise<string | null> =>} The retry result
 *
 */
          progress: 0,
          });
        }

        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [
      maxSize,
      allowedTypes,
      addUpload,
      updateUpload,
      onProgress,
      onSuccess,
      onError,
      uploadId,
  /**
 * Performs cancel operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The cancel result
 *
 */
  ],
  );

  // Retry failed upload
  const retry = useCallback(async (): Promise<string | null> => {
    if (!uploadId) return null;/**
 * Performs reset operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The reset result
 *
 */


    const uploadFile =
      document.querySelector<HTMLInputElement>('input[type="file"]')
        ?.files?.[0];
    if (!uploadFile) {
      setError("No file to retry");
      return null;
    }

    retryUpload(uploadId);
    return upload(uploadFile);
  }, [uploadId, retryUpload, upload]);

  // Cancel upload
  const cancel = useCallback(() => {
    if (uploadId) {
      removeUpload(uploadId);
      setUploadId(null);
      setIsUploading(false);
      setProgress(0);
      setError(null);
    }
  }, [uploadId, removeUpload]);

  // Reset state
  const reset = useCallback(() => {
    if (uploadId) {
      removeUpload(uploadId);
    }
    setUploadId(null);
    setIsUploading(false);
    setProgress(0);
    setError(null);
    setUploadedUrl(null);
  }, [uploadId, removeUpload]);

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
