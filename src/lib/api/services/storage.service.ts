/**
 * Storage Service
 * Handles all storage-related API operations (file uploads, downloads, etc.)
 */

import { apiClient } from "../client";

export interface StorageUploadResponse {
  url: string;
  path: string;
  size: number;
  contentType: string;
}

export interface StorageUploadOptions {
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export class StorageService {
  /**
   * Upload a file to storage
   */
  static async uploadFile(
    file: File,
    path: string,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResponse> {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path);
      
      if (options?.folder) {
        formData.append("folder", options.folder);
      }

      const response = await apiClient.upload<StorageUploadResponse>(
        "/api/storage/upload",
        formData
      );

      return response;
    } catch (error) {
      console.error("StorageService.uploadFile error:", error);
      throw error;
    }
  }

  /**
   * Upload multiple files to storage
   */
  static async uploadFiles(
    files: File[],
    folder?: string
  ): Promise<StorageUploadResponse[]> {
    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      
      if (folder) {
        formData.append("folder", folder);
      }

      const response = await apiClient.upload<StorageUploadResponse[]>(
        "/api/storage/upload",
        formData
      );

      return response;
    } catch (error) {
      console.error("StorageService.uploadFiles error:", error);
      throw error;
    }
  }

  /**
   * Get file URL from storage
   */
  static async getFileUrl(path: string): Promise<string> {
    try {
      const response = await apiClient.get<{ url: string }>(
        `/api/storage/get?path=${encodeURIComponent(path)}`
      );

      return response.url;
    } catch (error) {
      console.error("StorageService.getFileUrl error:", error);
      throw error;
    }
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(path: string): Promise<void> {
    try {
      await apiClient.delete(`/api/storage/delete?path=${encodeURIComponent(path)}`);
    } catch (error) {
      console.error("StorageService.deleteFile error:", error);
      throw error;
    }
  }

  /**
   * Upload image and return URL (convenience method)
   */
  static async uploadImage(
    file: File,
    folder: string = "images"
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const path = `${folder}/${timestamp}_${file.name}`;
      const response = await this.uploadFile(file, path);
      return response.url;
    } catch (error) {
      console.error("StorageService.uploadImage error:", error);
      throw error;
    }
  }
}

export default StorageService;
