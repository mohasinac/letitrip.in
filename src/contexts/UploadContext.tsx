/**
 * @fileoverview React Component
 * @module src/contexts/UploadContext
 * @description This file contains the UploadContext component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Upload Context
 *
 * Global state management for file uploads
 * Tracks pending uploads, progress, and failures
 */

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

/**
 * UploadFile interface
 * 
 * @interface
 * @description Defines the structure and contract for UploadFile
 */
export interface UploadFile {
  /** Id */
  id: string;
  /** File */
  file: File;
  /** Preview */
  preview?: string;
  /** Progress */
  progress: number;
  /** Status */
  status: "pending" | "uploading" | "success" | "error";
  /** Error */
  error?: string;
  /** Url */
  url?: string;
  /** Uploaded At */
  uploadedAt?: Date;
  /** Retry Count */
  retryCount?: number;
}

/**
 * UploadContextValue interface
 * 
 * @interface
 * @description Defines the structure and contract for UploadContextValue
 */
export interface UploadContextValue {
  /** Uploads */
  uploads: UploadFile[];
  /** Pending Count */
  pendingCount: number;
  /** Uploading Count */
  uploadingCount: number;
  /** Failed Count */
  failedCount: number;
  /** Success Count */
  successCount: number;

  /** Add Upload */
  addUpload: (file: File, preview?: string) => string;
  /** Update Upload */
  updateUpload: (id: string, updates: Partial<UploadFile>) => void;
  /** Remove Upload */
  removeUpload: (id: string) => void;
  /** Retry Upload */
  retryUpload: (id: string) => void;
  /** Clear Completed */
  clearCompleted: () => void;
  /** Clear Failed */
  clearFailed: () => void;
  /** Clear All */
  clearAll: () => void;

  /** Has Pending Uploads */
  hasPendingUploads: boolean;
  /** Has Failed Uploads */
  hasFailedUploads: boolean;
}

const UploadContext = createContext<UploadContextValue | undefined>(undefined);

/**
 * Function: Upload Provider
 */
/**
 * Performs upload provider operation
 *
 * @param {{ children} { children } - The { children }
 *
 * @returns {any} The uploadprovider result
 *
 * @example
 * UploadProvider({});
 */

/**
 * Performs upload provider operation
 *
 * @param {{ children} { children } - The { children }
 *
 * @returns {any} The uploadprovider result
 *
 * @example
 * UploadProvider({});
 */

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [uploads, setUploads] = useState<UploadFile[]>([]);

  // Calculate counts
  const pendingCount = uploads.filter((u) => u.status === "pending").length;
  const uploadingCount = uploads.filter((u) => u.status === "uploading").length;
  const failedCount = uploads.filter((u) => u.status === "error").length;
  const successCount = uploads.filter((u) => u.status === "success").length;
  const hasPendingUploads = pendingCount > 0 || uploadingCount > 0;
  const hasFailedUploads = failedCount > 0;

  // Add a new upload
  const addUpload = useCallback((file: File, preview?: string): string => {
    const id = `upload-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    const newUpload: UploadFile = {
      id,
      file,
      preview,
      /** Progress */
      progress: 0,
      /** Status */
      status: "pending",
      /** Retry Count */
      retryCount: 0,
    };

    setUploads((prev) => [...prev, newUpload]);
    return id;
  }, []);

  // Update an existing upload
  const updateUpload = useCallback(
    (id: string, updates: Partial<UploadFile>) => {
      setUploads((prev) =>
        prev.map((upload) =>
          upload.id === id ? { ...upload, ...updates } : upload,
        ),
      );
    },
    [],
  );

  // Remove an upload
  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === id);
      // Revoke object URL to free memory
      if (upload?.preview) {
        URL.revokeObjectURL(upload.preview);
      }
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  // Retry a failed upload
  const retryUpload = useCallback((id: string) => {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id
          ? {
              ...upload,
              /** Status */
              status: "pending",
              /** Error */
              error: undefined,
              /** Progress */
              progress: 0,
              /** Retry Count */
              retryCount: (upload.retryCount || 0) + 1,
            }
          : upload,
      ),
    );
  }, []);

  // Clear completed uploads
  const clearCompleted = useCallback(() => {
    setUploads((prev) => {
      // Revoke object URLs
      prev
        .filter((u) => u.status === "success")
        .forEach((upload) => {
          if (upload.preview) {
            URL.revokeObjectURL(upload.preview);
          }
        });
      return prev.filter((u) => u.status !== "success");
    });
  }, []);

  // Clear failed uploads
  const clearFailed = useCallback(() => {
    setUploads((prev) => {
      // Revoke object URLs
      prev
        .filter((u) => u.status === "error")
        .forEach((upload) => {
          if (upload.preview) {
            URL.revokeObjectURL(upload.preview);
          }
        });
      return prev.filter((u) => u.status !== "error");
    });
  }, []);

  // Clear all uploads
  const clearAll = useCallback(() => {
    setUploads((prev) => {
      // Revoke all object URLs
      prev.forEach((upload) => {
        if (upload.preview) {
          URL.revokeObjectURL(upload.preview);
        }
      });
      return [];
    });
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      uploads.forEach((upload) => {
        if (upload.preview) {
          URL.revokeObjectURL(upload.preview);
        }
      });
    };
  }, [uploads]);

  const value: UploadContextValue = {
    uploads,
    pendingCount,
    uploadingCount,
    failedCount,
    successCount,
    addUpload,
    updateUpload,
    removeUpload,
    retryUpload,
    clearCompleted,
    clearFailed,
    clearAll,
    hasPendingUploads,
    hasFailedUploads,
  };

  return (
    <UploadContext.Provider value={value}>{children}</UploadContext.Provider>
  );
}

/**
 * Function: Use Upload Context
 */
/**
 * Custom React hook for upload context
 *
 * @returns {any} The useuploadcontext result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useUploadContext();
 */

/**
 * Custom React hook for upload context
 *
 * @returns {any} The useuploadcontext result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * useUploadContext();
 */

export function useUploadContext() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error("useUploadContext must be used within an UploadProvider");
  }
  return context;
}
