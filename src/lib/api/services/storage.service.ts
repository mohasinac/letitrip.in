/**
 * Storage Service
 * Standalone service layer for storage API operations
 * Handles image uploads and retrievals with caching
 */

import { apiClient } from "../client";

export interface StorageUploadResponse {
  success: boolean;
  data: {
    url: string;
    filename: string;
    filepath: string;
    size: number;
    type: string;
  };
  error?: string;
}

export interface StorageUploadRequest {
  file: File;
  folder: string;
  slug?: string;
  onProgress?: (progress: number) => void;
}

export class StorageService {
  /**
   * Upload image to Firebase Storage
   * @param request - Upload configuration with file and folder
   * @returns Upload response with file path and URL
   */
  static async uploadImage(
    request: StorageUploadRequest
  ): Promise<StorageUploadResponse> {
    try {
      const { file, folder, slug, onProgress } = request;

      // Validate file
      if (!file || !file.type.startsWith("image/")) {
        throw new Error("File must be an image");
      }

      // Create form data
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      if (slug) {
        formData.append("slug", slug);
      }

      // Upload with progress tracking
      const response = await apiClient.post<StorageUploadResponse>(
        "/storage/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              onProgress(progress);
            }
          },
        }
      );

      if (!response.success) {
        throw new Error(response.error || "Upload failed");
      }

      return response;
    } catch (error) {
      console.error("StorageService.uploadImage error:", error);
      throw error;
    }
  }

  /**
   * Get cached image URL
   * @param path - File path in storage
   * @param cacheDuration - Cache duration in seconds (default: 24 hours)
   */
  static getImageUrl(path: string, cacheDuration: number = 86400): string {
    if (!path) return "";

    // If it's already a full URL, return as-is
    if (path.startsWith("http")) {
      return path;
    }

    // Encode path to handle special characters
    const encodedPath = encodeURIComponent(path);

    // Return API endpoint with cache parameter
    return `/api/storage/get?path=${encodedPath}&cache=${Math.max(0, Math.min(cacheDuration, 2592000))}`;
  }

  /**
   * Get direct Firebase Storage public URL
   * @param path - File path in storage
   */
  static getPublicUrl(path: string): string {
    if (!path) return "";

    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucket) {
      console.warn("Firebase storage bucket not configured");
      return "";
    }

    return `https://storage.googleapis.com/${bucket}/${path}`;
  }

  /**
   * Download file from storage (client-side)
   * @param path - File path in storage
   */
  static async downloadFile(path: string): Promise<Blob> {
    try {
      const response = await fetch(
        `/api/storage/get?path=${encodeURIComponent(path)}`
      );

      if (!response.ok) {
        throw new Error(`Download failed: ${response.statusText}`);
      }

      return await response.blob();
    } catch (error) {
      console.error("StorageService.downloadFile error:", error);
      throw error;
    }
  }

  /**
   * Delete file from storage (requires admin auth)
   * @param path - File path in storage
   */
  static async deleteFile(path: string): Promise<void> {
    try {
      await apiClient.delete(`/storage/delete?path=${encodeURIComponent(path)}`);
    } catch (error) {
      console.error("StorageService.deleteFile error:", error);
      throw error;
    }
  }
}

export default StorageService;
