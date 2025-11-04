/**
 * Upload Service
 * Handles file upload operations
 */

import { apiClient } from "../client";

export interface UploadResponse {
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

export interface UploadOptions {
  folder?: string;
  maxSize?: number;
  allowedTypes?: string[];
}

export class UploadService {
  /**
   * Upload a single file
   */
  static async uploadFile(
    file: File,
    options?: UploadOptions
  ): Promise<UploadResponse> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      if (options?.folder) {
        formData.append('folder', options.folder);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error("UploadService.uploadFile error:", error);
      throw error;
    }
  }

  /**
   * Upload multiple files
   */
  static async uploadFiles(
    files: File[],
    options?: UploadOptions
  ): Promise<UploadResponse[]> {
    try {
      const uploadPromises = files.map(file =>
        this.uploadFile(file, options)
      );

      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error("UploadService.uploadFiles error:", error);
      throw error;
    }
  }

  /**
   * Upload image file (with validation)
   */
  static async uploadImage(
    file: File,
    maxSize: number = 5 * 1024 * 1024 // 5MB default
  ): Promise<UploadResponse> {
    try {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Only images are allowed.');
      }

      // Validate file size
      if (file.size > maxSize) {
        throw new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit.`);
      }

      return await this.uploadFile(file, {
        folder: 'images',
        allowedTypes,
        maxSize
      });
    } catch (error) {
      console.error("UploadService.uploadImage error:", error);
      throw error;
    }
  }

  /**
   * Get upload URL for storage
   */
  static async getUploadUrl(fileName: string): Promise<{ url: string; uploadUrl: string }> {
    try {
      const response = await apiClient.post<{ url: string; uploadUrl: string }>(
        '/api/storage/upload',
        { fileName }
      );
      return response;
    } catch (error) {
      console.error("UploadService.getUploadUrl error:", error);
      throw error;
    }
  }

  /**
   * Get file from storage
   */
  static async getFile(fileName: string): Promise<Blob> {
    try {
      const response = await fetch(`/api/storage/get?file=${encodeURIComponent(fileName)}`);

      if (!response.ok) {
        throw new Error('Failed to get file');
      }

      return await response.blob();
    } catch (error) {
      console.error("UploadService.getFile error:", error);
      throw error;
    }
  }

  /**
   * Delete file from storage
   */
  static async deleteFile(fileName: string): Promise<void> {
    try {
      await apiClient.delete<void>(`/api/storage/delete?file=${encodeURIComponent(fileName)}`);
    } catch (error) {
      console.error("UploadService.deleteFile error:", error);
      throw error;
    }
  }
}

export default UploadService;
