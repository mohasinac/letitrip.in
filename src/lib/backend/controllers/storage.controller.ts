/**
 * Storage Controller
 * Handles storage operations with role-based access control
 */

import { NextRequest } from 'next/server';
import { StorageModel, type UploadResult } from '../models/storage.model';
import {
  validateImageFile,
  validateVideoFile,
  type FileMetadata,
} from '../validators/storage.validator';
import {
  AuthenticationError,
  AuthorizationError,
  ValidationError,
} from '@/lib/api/middleware/error-handler';
import { getUserFromToken } from '@/lib/auth/api-middleware';

export interface UploadImageRequest {
  file: File;
  folder?: string;
  metadata?: FileMetadata;
}

export interface UploadMultipleImagesRequest {
  files: File[];
  folder?: string;
  metadata?: FileMetadata;
}

export interface DeleteFileRequest {
  path?: string;
  url?: string;
}

/**
 * Storage Controller
 */
export class StorageController {
  /**
   * Upload single image
   * Roles: authenticated users
   */
  static async uploadImage(
    request: NextRequest,
    data: UploadImageRequest
  ): Promise<UploadResult> {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      throw new AuthenticationError();
    }

    // Validate file
    const validation = validateImageFile(data.file);
    if (!validation.valid) {
      throw new ValidationError({ file: [validation.error!] });
    }

    // Check folder permissions
    const allowedFolders = this.getAllowedFolders(user.role);
    if (data.folder && !allowedFolders.includes(data.folder)) {
      throw new AuthorizationError(
        `You don't have permission to upload to folder: ${data.folder}`
      );
    }

    // Upload file
    const result = await StorageModel.uploadImage(data.file, {
      folder: data.folder,
      metadata: {
        ...data.metadata,
        userId: user.uid,
      },
    });

    return result;
  }

  /**
   * Upload multiple images
   * Roles: authenticated users
   */
  static async uploadMultipleImages(
    request: NextRequest,
    data: UploadMultipleImagesRequest
  ): Promise<UploadResult[]> {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      throw new AuthenticationError();
    }

    // Validate max files
    if (data.files.length > 10) {
      throw new ValidationError({
        files: ['Maximum 10 files allowed per upload'],
      });
    }

    // Validate each file
    const errors: Record<string, string[]> = {};
    data.files.forEach((file, index) => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        errors[`file_${index}`] = [validation.error!];
      }
    });

    if (Object.keys(errors).length > 0) {
      throw new ValidationError(errors);
    }

    // Check folder permissions
    const allowedFolders = this.getAllowedFolders(user.role);
    if (data.folder && !allowedFolders.includes(data.folder)) {
      throw new AuthorizationError(
        `You don't have permission to upload to folder: ${data.folder}`
      );
    }

    // Upload files
    const results = await StorageModel.uploadMultipleImages(data.files, {
      folder: data.folder,
      metadata: {
        ...data.metadata,
        userId: user.uid,
      },
    });

    return results;
  }

  /**
   * Upload video
   * Roles: admin, seller
   */
  static async uploadVideo(
    request: NextRequest,
    data: UploadImageRequest
  ): Promise<UploadResult> {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      throw new AuthenticationError();
    }

    // Check role
    if (!['admin', 'seller'].includes(user.role || '')) {
      throw new AuthorizationError('Only admins and sellers can upload videos');
    }

    // Validate file
    const validation = validateVideoFile(data.file);
    if (!validation.valid) {
      throw new ValidationError({ file: [validation.error!] });
    }

    // Upload file
    const result = await StorageModel.uploadVideo(data.file, {
      folder: data.folder || 'videos',
      metadata: {
        ...data.metadata,
        userId: user.uid,
      },
    });

    return result;
  }

  /**
   * Delete file
   * Roles: admin, or file owner
   */
  static async deleteFile(
    request: NextRequest,
    data: DeleteFileRequest
  ): Promise<void> {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      throw new AuthenticationError();
    }

    // Get file path
    const path = data.path || (data.url ? StorageModel['extractPathFromUrl'](data.url) : null);
    if (!path) {
      throw new ValidationError({ file: ['Invalid file path or URL'] });
    }

    // Check permissions
    const canDelete = await this.canDeleteFile(user, path);
    if (!canDelete) {
      throw new AuthorizationError("You don't have permission to delete this file");
    }

    // Delete file
    await StorageModel.deleteFile(path);
  }

  /**
   * Delete multiple files
   * Roles: admin
   */
  static async deleteMultipleFiles(
    request: NextRequest,
    paths: string[]
  ): Promise<void> {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      throw new AuthenticationError();
    }

    // Only admins can bulk delete
    if (user.role !== 'admin') {
      throw new AuthorizationError('Only admins can delete multiple files');
    }

    // Delete files
    await StorageModel.deleteMultipleFiles(paths);
  }

  /**
   * List files in folder
   * Roles: admin, seller (their own folders)
   */
  static async listFiles(
    request: NextRequest,
    folder: string
  ): Promise<string[]> {
    // Authenticate user
    const user = await getUserFromRequest(request);
    if (!user) {
      throw new AuthenticationError();
    }

    // Check folder permissions
    const allowedFolders = this.getAllowedFolders(user.role);
    if (!allowedFolders.includes(folder)) {
      throw new AuthorizationError(
        `You don't have permission to list files in folder: ${folder}`
      );
    }

    // List files
    const files = await StorageModel.listFiles(folder);
    return files;
  }

  /**
   * Helper: Get allowed folders for user role
   */
  private static getAllowedFolders(role?: string): string[] {
    switch (role) {
      case 'admin':
        return ['products', 'categories', 'users', 'hero', 'banners', 'uploads', 'videos', 'tutorials'];
      case 'seller':
        return ['products', 'uploads'];
      case 'user':
        return ['users', 'uploads'];
      default:
        return ['uploads'];
    }
  }

  /**
   * Helper: Check if user can delete file
   */
  private static async canDeleteFile(
    user: { uid: string; role?: string },
    path: string
  ): Promise<boolean> {
    // Admins can delete anything
    if (user.role === 'admin') {
      return true;
    }

    // Check if file belongs to user (by checking path contains user ID)
    if (path.includes(user.uid)) {
      return true;
    }

    // Sellers can delete files in products folder
    if (user.role === 'seller' && path.startsWith('products/')) {
      return true;
    }

    return false;
  }
}
