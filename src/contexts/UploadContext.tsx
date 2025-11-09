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

export interface UploadFile {
  id: string;
  file: File;
  preview?: string;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  error?: string;
  url?: string;
  uploadedAt?: Date;
  retryCount?: number;
}

export interface UploadContextValue {
  uploads: UploadFile[];
  pendingCount: number;
  uploadingCount: number;
  failedCount: number;
  successCount: number;

  addUpload: (file: File, preview?: string) => string;
  updateUpload: (id: string, updates: Partial<UploadFile>) => void;
  removeUpload: (id: string) => void;
  retryUpload: (id: string) => void;
  clearCompleted: () => void;
  clearFailed: () => void;
  clearAll: () => void;

  hasPendingUploads: boolean;
  hasFailedUploads: boolean;
}

const UploadContext = createContext<UploadContextValue | undefined>(undefined);

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
      progress: 0,
      status: "pending",
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
              status: "pending",
              error: undefined,
              progress: 0,
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

export function useUploadContext() {
  const context = useContext(UploadContext);
  if (context === undefined) {
    throw new Error("useUploadContext must be used within an UploadProvider");
  }
  return context;
}
