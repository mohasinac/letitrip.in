/**
 * useMediaUpload Hook
 *
 * Hook for media uploads with retry logic and validation
 */

import { useState, useCallback } from "react";
import { useUploadContext } from "@/contexts/UploadContext";

export interface MediaUploadOptions {
  maxSize?: number; // Max file size in bytes
  allowedTypes?: string[]; // Allowed MIME types
  maxRetries?: number; // Maximum retry attempts
  onProgress?: (progress: number) => void;
  onSuccess?: (url: string) => void;
  onError?: (error: string) => void;
}

// Simple validation function
function validateFile(
  file: File,
  maxSize?: number,
  allowedTypes?: string[],
): { isValid: boolean; error?: string } {
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
        formData.append("file", file);

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
          status: "success",
          progress: 100,
          url,
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
            status: "error",
            error: errorMessage,
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
    ],
  );

  // Retry failed upload
  const retry = useCallback(async (): Promise<string | null> => {
    if (!uploadId) return null;

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
