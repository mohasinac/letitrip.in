/**
 * Firebase Storage Service
 * Handles file uploads for products (images and videos)
 */

import {
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  StorageReference,
  UploadTask,
} from 'firebase/storage';
import { storage } from '@/lib/database/config';

export interface UploadProgress {
  bytesTransferred: number;
  totalBytes: number;
  progress: number;
}

export interface UploadResult {
  url: string;
  path: string;
  metadata?: any;
}

export class StorageService {
  /**
   * Upload a single file (image or video)
   */
  static async uploadFile(
    file: File,
    path: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResult> {
    try {
      const storageRef = ref(storage, path);
      
      if (onProgress) {
        // Use resumable upload for progress tracking
        const uploadTask = uploadBytesResumable(storageRef, file);
        
        return new Promise((resolve, reject) => {
          uploadTask.on('state_changed',
            (snapshot) => {
              const progress = {
                bytesTransferred: snapshot.bytesTransferred,
                totalBytes: snapshot.totalBytes,
                progress: (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
              };
              onProgress(progress);
            },
            (error) => {
              console.error('Upload error:', error);
              reject(new Error('Failed to upload file'));
            },
            async () => {
              try {
                const url = await getDownloadURL(uploadTask.snapshot.ref);
                resolve({
                  url,
                  path,
                  metadata: uploadTask.snapshot.metadata,
                });
              } catch (error) {
                reject(new Error('Failed to get download URL'));
              }
            }
          );
        });
      } else {
        // Simple upload without progress
        const snapshot = await uploadBytes(storageRef, file);
        const url = await getDownloadURL(snapshot.ref);
        
        return {
          url,
          path,
          metadata: snapshot.metadata,
        };
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      throw new Error('Failed to upload file');
    }
  }

  /**
   * Upload multiple product images
   */
  static async uploadProductImages(
    files: File[],
    productId: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    try {
      const results: UploadResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `products/${productId}/images/${Date.now()}_${file.name}`;
        
        const result = await this.uploadFile(
          file,
          path,
          onProgress ? (progress) => onProgress(i, progress) : undefined
        );
        
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error('Error uploading product images:', error);
      throw new Error('Failed to upload product images');
    }
  }

  /**
   * Upload multiple product videos
   */
  static async uploadProductVideos(
    files: File[],
    productId: string,
    onProgress?: (fileIndex: number, progress: UploadProgress) => void
  ): Promise<UploadResult[]> {
    try {
      const results: UploadResult[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const path = `products/${productId}/videos/${Date.now()}_${file.name}`;
        
        const result = await this.uploadFile(
          file,
          path,
          onProgress ? (progress) => onProgress(i, progress) : undefined
        );
        
        results.push(result);
      }
      
      return results;
    } catch (error) {
      console.error('Error uploading product videos:', error);
      throw new Error('Failed to upload product videos');
    }
  }

  /**
   * Delete a file from storage
   */
  static async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      console.error('Error deleting file:', error);
      throw new Error('Failed to delete file');
    }
  }

  /**
   * Delete all files for a product
   */
  static async deleteProductFiles(productId: string): Promise<void> {
    try {
      const productRef = ref(storage, `products/${productId}`);
      const listResult = await listAll(productRef);
      
      // Delete all files in the product folder
      const deletePromises = listResult.items.map(item => deleteObject(item));
      await Promise.all(deletePromises);
      
      // Delete all files in subfolders (images, videos)
      for (const folder of listResult.prefixes) {
        const folderResult = await listAll(folder);
        const folderDeletePromises = folderResult.items.map(item => deleteObject(item));
        await Promise.all(folderDeletePromises);
      }
    } catch (error) {
      console.error('Error deleting product files:', error);
      throw new Error('Failed to delete product files');
    }
  }

  /**
   * Generate video thumbnail (client-side)
   */
  static generateVideoThumbnail(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      video.onloadedmetadata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        video.currentTime = 1; // Seek to 1 second
      };

      video.onseeked = () => {
        ctx.drawImage(video, 0, 0);
        const thumbnailDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(thumbnailDataUrl);
      };

      video.onerror = () => {
        reject(new Error('Failed to load video'));
      };

      video.src = URL.createObjectURL(file);
    });
  }

  /**
   * Validate file type and size
   */
  static validateFile(file: File, type: 'image' | 'video'): { valid: boolean; error?: string } {
    const maxSize = type === 'image' ? 10 * 1024 * 1024 : 100 * 1024 * 1024; // 10MB for images, 100MB for videos
    
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size must be less than ${maxSize / (1024 * 1024)}MB`,
      };
    }

    const allowedTypes = type === 'image' 
      ? ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
      : ['video/mp4', 'video/webm', 'video/quicktime'];

    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `File type ${file.type} is not allowed`,
      };
    }

    return { valid: true };
  }

  /**
   * Upload user avatar
   */
  static async uploadAvatar(file: File, userId: string): Promise<UploadResult> {
    try {
      const validation = this.validateFile(file, 'image');
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const path = `avatars/${userId}/${Date.now()}_${file.name}`;
      return await this.uploadFile(file, path);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  /**
   * Upload category image
   */
  static async uploadCategoryImage(file: File, categoryId: string): Promise<UploadResult> {
    try {
      const validation = this.validateFile(file, 'image');
      if (!validation.valid) {
        throw new Error(validation.error);
      }

      const path = `categories/${categoryId}/${Date.now()}_${file.name}`;
      return await this.uploadFile(file, path);
    } catch (error) {
      console.error('Error uploading category image:', error);
      throw new Error('Failed to upload category image');
    }
  }
}
