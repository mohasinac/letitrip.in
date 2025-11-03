/**
 * Backend Storage Model
 * Handles Firebase Storage operations with role-based access control
 */

import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { getAdminStorage } from '@/app/api/_lib/database/admin';
import { logger, logPerformance } from '../../../lib/api/middleware/logger';
import {
  validateImageFile,
  validateVideoFile,
  FILE_SIZE_LIMITS,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  type FileMetadata,
} from '../validators/storage.validator';

export interface UploadResult {
  url: string;
  path: string;
  fileName: string;
  size: number;
  contentType: string;
}

export interface UploadOptions {
  folder?: string;
  fileName?: string;
  metadata?: FileMetadata;
  isPublic?: boolean;
}

/**
 * Storage Model - Backend operations
 */
export class StorageModel {
  /**
   * Generate unique filename
   */
  private static generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop();
    return `${originalName.split('.')[0]}-${timestamp}-${randomString}.${extension}`;
  }

  /**
   * Get storage path
   */
  private static getStoragePath(folder: string, fileName: string): string {
    return `${folder}/${fileName}`;
  }

  /**
   * Upload image file (Server-side with Admin SDK)
   */
  static async uploadImageAdmin(
    fileBuffer: Buffer,
    originalName: string,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const perf = logPerformance('Upload Image (Admin)');

    try {
      const storage = getAdminStorage();
      const folder = options.folder || 'uploads';
      const fileName = options.fileName || this.generateFileName(originalName);
      const filePath = this.getStoragePath(folder, fileName);

      logger.info(`Uploading image to ${filePath}`, {
        size: fileBuffer.length,
        folder,
      });

      // Upload file
      const bucket = storage.bucket();
      const file = bucket.file(filePath);

      await file.save(fileBuffer, {
        metadata: {
          contentType: this.getContentTypeFromFileName(originalName),
          metadata: {
            uploadedAt: new Date().toISOString(),
            ...options.metadata,
          },
        },
        public: options.isPublic !== false,
      });

      // Make public if needed
      if (options.isPublic !== false) {
        await file.makePublic();
      }

      // Get download URL
      const [url] = await file.getSignedUrl({
        action: 'read',
        expires: '03-01-2500', // Far future date
      });

      const result: UploadResult = {
        url: options.isPublic !== false ? file.publicUrl() : url,
        path: filePath,
        fileName,
        size: fileBuffer.length,
        contentType: this.getContentTypeFromFileName(originalName),
      };

      logger.info('Image uploaded successfully', { path: filePath });
      perf.end();

      return result;
    } catch (error) {
      logger.error('Failed to upload image', error);
      perf.end();
      throw error;
    }
  }

  /**
   * Upload image file (Client-side)
   */
  static async uploadImage(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const perf = logPerformance('Upload Image');

    try {
      // Validate file
      const validation = validateImageFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const storage = getStorage();
      const folder = options.folder || 'uploads';
      const fileName = options.fileName || this.generateFileName(file.name);
      const filePath = this.getStoragePath(folder, fileName);

      logger.info(`Uploading image to ${filePath}`, {
        size: file.size,
        type: file.type,
      });

      // Create storage reference
      const storageRef = ref(storage, filePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          ...options.metadata,
        } as any,
      });

      // Get download URL
      const url = await getDownloadURL(snapshot.ref);

      const result: UploadResult = {
        url,
        path: filePath,
        fileName,
        size: file.size,
        contentType: file.type,
      };

      logger.info('Image uploaded successfully', { path: filePath });
      perf.end();

      return result;
    } catch (error) {
      logger.error('Failed to upload image', error);
      perf.end();
      throw error;
    }
  }

  /**
   * Upload multiple images
   */
  static async uploadMultipleImages(
    files: File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const perf = logPerformance('Upload Multiple Images');

    try {
      logger.info(`Uploading ${files.length} images`);

      const uploadPromises = files.map((file) =>
        this.uploadImage(file, options)
      );

      const results = await Promise.all(uploadPromises);

      logger.info(`Successfully uploaded ${results.length} images`);
      perf.end();

      return results;
    } catch (error) {
      logger.error('Failed to upload multiple images', error);
      perf.end();
      throw error;
    }
  }

  /**
   * Upload video file
   */
  static async uploadVideo(
    file: File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    const perf = logPerformance('Upload Video');

    try {
      // Validate file
      const validation = validateVideoFile(file);
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const storage = getStorage();
      const folder = options.folder || 'videos';
      const fileName = options.fileName || this.generateFileName(file.name);
      const filePath = this.getStoragePath(folder, fileName);

      logger.info(`Uploading video to ${filePath}`, {
        size: file.size,
        type: file.type,
      });

      // Create storage reference
      const storageRef = ref(storage, filePath);

      // Upload file
      const snapshot = await uploadBytes(storageRef, file, {
        contentType: file.type,
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          ...options.metadata,
        } as any,
      });

      // Get download URL
      const url = await getDownloadURL(snapshot.ref);

      const result: UploadResult = {
        url,
        path: filePath,
        fileName,
        size: file.size,
        contentType: file.type,
      };

      logger.info('Video uploaded successfully', { path: filePath });
      perf.end();

      return result;
    } catch (error) {
      logger.error('Failed to upload video', error);
      perf.end();
      throw error;
    }
  }

  /**
   * Delete file
   */
  static async deleteFile(path: string): Promise<void> {
    const perf = logPerformance('Delete File');

    try {
      logger.info(`Deleting file: ${path}`);

      const storage = getStorage();
      const storageRef = ref(storage, path);

      await deleteObject(storageRef);

      logger.info('File deleted successfully', { path });
      perf.end();
    } catch (error: any) {
      // Ignore if file doesn't exist
      if (error.code === 'storage/object-not-found') {
        logger.warn('File not found, skipping deletion', { path });
        perf.end();
        return;
      }

      logger.error('Failed to delete file', error, { path });
      perf.end();
      throw error;
    }
  }

  /**
   * Delete multiple files
   */
  static async deleteMultipleFiles(paths: string[]): Promise<void> {
    const perf = logPerformance('Delete Multiple Files');

    try {
      logger.info(`Deleting ${paths.length} files`);

      const deletePromises = paths.map((path) => this.deleteFile(path));
      await Promise.allSettled(deletePromises);

      logger.info(`Deleted ${paths.length} files`);
      perf.end();
    } catch (error) {
      logger.error('Failed to delete multiple files', error);
      perf.end();
      throw error;
    }
  }

  /**
   * Delete file by URL
   */
  static async deleteFileByUrl(url: string): Promise<void> {
    try {
      // Extract path from URL
      const path = this.extractPathFromUrl(url);
      if (!path) {
        throw new Error('Invalid storage URL');
      }

      await this.deleteFile(path);
    } catch (error) {
      logger.error('Failed to delete file by URL', error, { url });
      throw error;
    }
  }

  /**
   * List files in folder
   */
  static async listFiles(folder: string): Promise<string[]> {
    const perf = logPerformance('List Files');

    try {
      logger.info(`Listing files in folder: ${folder}`);

      const storage = getStorage();
      const folderRef = ref(storage, folder);

      const result = await listAll(folderRef);
      const urls = await Promise.all(
        result.items.map((item) => getDownloadURL(item))
      );

      logger.info(`Found ${urls.length} files in ${folder}`);
      perf.end();

      return urls;
    } catch (error) {
      logger.error('Failed to list files', error, { folder });
      perf.end();
      throw error;
    }
  }

  /**
   * Get content type from file name
   */
  private static getContentTypeFromFileName(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase();

    const contentTypes: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      mp4: 'video/mp4',
      webm: 'video/webm',
      mov: 'video/quicktime',
      pdf: 'application/pdf',
    };

    return contentTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Extract storage path from URL
   */
  private static extractPathFromUrl(url: string): string | null {
    try {
      // Handle Firebase Storage URLs
      if (url.includes('firebasestorage.googleapis.com')) {
        const matches = url.match(/\/o\/(.+?)\?/);
        if (matches) {
          return decodeURIComponent(matches[1]);
        }
      }

      // Handle public URLs
      if (url.includes('storage.googleapis.com')) {
        const matches = url.match(/\/([^?]+)$/);
        if (matches) {
          return decodeURIComponent(matches[1]);
        }
      }

      return null;
    } catch (error) {
      logger.error('Failed to extract path from URL', error, { url });
      return null;
    }
  }
}
