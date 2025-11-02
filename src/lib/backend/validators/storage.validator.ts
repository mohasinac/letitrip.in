/**
 * Backend Storage Validator
 * Zod schemas for file upload validation
 */

import { z } from 'zod';

/**
 * Allowed file types
 */
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/quicktime',
] as const;

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

/**
 * File size limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  VIDEO: 50 * 1024 * 1024, // 50MB
  DOCUMENT: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Upload validation schemas
 */
export const uploadImageSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, 'File is required'),
  folder: z.enum(['products', 'categories', 'users', 'hero', 'banners']).optional(),
  maxSize: z.number().optional().default(FILE_SIZE_LIMITS.IMAGE),
});

export const uploadMultipleImagesSchema = z.object({
  files: z.array(z.custom<File>((val) => val instanceof File)),
  folder: z.enum(['products', 'categories', 'users', 'hero', 'banners']).optional(),
  maxSize: z.number().optional().default(FILE_SIZE_LIMITS.IMAGE),
  maxFiles: z.number().optional().default(10),
});

export const uploadVideoSchema = z.object({
  file: z.custom<File>((val) => val instanceof File, 'File is required'),
  folder: z.enum(['products', 'tutorials']).optional(),
  maxSize: z.number().optional().default(FILE_SIZE_LIMITS.VIDEO),
});

export const deleteFileSchema = z.object({
  url: z.string().url('Invalid file URL'),
  path: z.string().optional(),
});

export const deleteMultipleFilesSchema = z.object({
  urls: z.array(z.string().url()),
  paths: z.array(z.string()).optional(),
});

/**
 * File metadata schema
 */
export const fileMetadataSchema = z.object({
  userId: z.string().optional(),
  productId: z.string().optional(),
  categoryId: z.string().optional(),
  folder: z.string(),
  isPublic: z.boolean().default(true),
  tags: z.array(z.string()).optional(),
});

/**
 * Validation helper functions
 */
export function validateFileType(
  file: File,
  allowedTypes: readonly string[]
): boolean {
  return allowedTypes.includes(file.type as any);
}

export function validateFileSize(file: File, maxSize: number): boolean {
  return file.size <= maxSize;
}

export function validateImageFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!validateFileType(file, ALLOWED_IMAGE_TYPES)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_IMAGE_TYPES.join(', ')}`,
    };
  }

  if (!validateFileSize(file, FILE_SIZE_LIMITS.IMAGE)) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${FILE_SIZE_LIMITS.IMAGE / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

export function validateVideoFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!validateFileType(file, ALLOWED_VIDEO_TYPES)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_VIDEO_TYPES.join(', ')}`,
    };
  }

  if (!validateFileSize(file, FILE_SIZE_LIMITS.VIDEO)) {
    return {
      valid: false,
      error: `File too large. Maximum size: ${FILE_SIZE_LIMITS.VIDEO / 1024 / 1024}MB`,
    };
  }

  return { valid: true };
}

// Type exports
export type UploadImageInput = z.infer<typeof uploadImageSchema>;
export type UploadMultipleImagesInput = z.infer<typeof uploadMultipleImagesSchema>;
export type UploadVideoInput = z.infer<typeof uploadVideoSchema>;
export type DeleteFileInput = z.infer<typeof deleteFileSchema>;
export type DeleteMultipleFilesInput = z.infer<typeof deleteMultipleFilesSchema>;
export type FileMetadata = z.infer<typeof fileMetadataSchema>;
