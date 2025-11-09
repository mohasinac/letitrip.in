/**
 * useUploadQueue Hook
 *
 * Hook for managing upload queue with automatic processing
 */

import { useCallback, useEffect, useRef } from "react";
import { useUploadContext } from "@/contexts/UploadContext";

export interface UploadQueueOptions {
  maxConcurrent?: number; // Maximum concurrent uploads
  autoStart?: boolean; // Auto-start processing queue
  onComplete?: (id: string, url: string) => void;
  onError?: (id: string, error: string) => void;
}

export function useUploadQueue(options: UploadQueueOptions = {}) {
  const { maxConcurrent = 3, autoStart = true, onComplete, onError } = options;

  const { uploads, uploadingCount, updateUpload, removeUpload } =
    useUploadContext();

  const processingRef = useRef(false);

  // Process pending uploads
  const processQueue = useCallback(async () => {
    if (processingRef.current) return;
    processingRef.current = true;

    try {
      const pendingUploads = uploads.filter((u) => u.status === "pending");
      const currentUploading = uploadingCount;

      // Process uploads up to maxConcurrent
      const available = maxConcurrent - currentUploading;
      const toProcess = pendingUploads.slice(0, available);

      await Promise.all(
        toProcess.map(async (upload) => {
          try {
            // Update status to uploading
            updateUpload(upload.id, { status: "uploading", progress: 0 });

            // Create form data
            const formData = new FormData();
            formData.append("file", upload.file);

            // Upload with progress tracking
            const xhr = new XMLHttpRequest();

            const uploadPromise = new Promise<string>((resolve, reject) => {
              xhr.upload.addEventListener("progress", (e) => {
                if (e.lengthComputable) {
                  const progress = Math.round((e.loaded / e.total) * 100);
                  updateUpload(upload.id, { progress });
                }
              });

              xhr.addEventListener("load", () => {
                if (xhr.status >= 200 && xhr.status < 300) {
                  const response = JSON.parse(xhr.responseText);
                  resolve(response.url || response.data?.url);
                } else {
                  reject(new Error(`Upload failed with status ${xhr.status}`));
                }
              });

              xhr.addEventListener("error", () => {
                reject(new Error("Network error during upload"));
              });

              xhr.addEventListener("abort", () => {
                reject(new Error("Upload aborted"));
              });

              xhr.open("POST", "/api/media/upload");
              xhr.send(formData);
            });

            const url = await uploadPromise;

            // Update as successful
            updateUpload(upload.id, {
              status: "success",
              progress: 100,
              url,
              uploadedAt: new Date(),
            });

            onComplete?.(upload.id, url);
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : "Upload failed";

            updateUpload(upload.id, {
              status: "error",
              error: errorMessage,
              progress: 0,
            });

            onError?.(upload.id, errorMessage);
          }
        }),
      );
    } finally {
      processingRef.current = false;
    }
  }, [
    uploads,
    uploadingCount,
    maxConcurrent,
    updateUpload,
    onComplete,
    onError,
  ]);

  // Auto-start processing when new pending uploads are added
  useEffect(() => {
    if (autoStart) {
      const pendingCount = uploads.filter((u) => u.status === "pending").length;
      if (pendingCount > 0 && uploadingCount < maxConcurrent) {
        processQueue();
      }
    }
  }, [uploads, uploadingCount, maxConcurrent, autoStart, processQueue]);

  // Manual start
  const startQueue = useCallback(() => {
    processQueue();
  }, [processQueue]);

  // Pause all uploads (aborts current uploads)
  const pauseQueue = useCallback(() => {
    // Mark all uploading as pending
    uploads
      .filter((u) => u.status === "uploading")
      .forEach((upload) => {
        updateUpload(upload.id, {
          status: "pending",
          progress: 0,
        });
      });
  }, [uploads, updateUpload]);

  // Retry all failed uploads
  const retryAllFailed = useCallback(() => {
    uploads
      .filter((u) => u.status === "error")
      .forEach((upload) => {
        updateUpload(upload.id, {
          status: "pending",
          error: undefined,
          progress: 0,
          retryCount: (upload.retryCount || 0) + 1,
        });
      });
  }, [uploads, updateUpload]);

  // Cancel specific upload
  const cancelUpload = useCallback(
    (id: string) => {
      removeUpload(id);
    },
    [removeUpload],
  );

  return {
    startQueue,
    pauseQueue,
    retryAllFailed,
    cancelUpload,
    isProcessing: processingRef.current,
  };
}
