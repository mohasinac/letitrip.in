/**
 * Media Types
 * Type definitions for media handling throughout the application
 */

export type MediaType = "image" | "video" | "document";

export type MediaSource = "file" | "camera" | "screen";

export type UploadStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface MediaFile {
  id: string;
  file: File;
  type: MediaType;
  source: MediaSource;
  preview: string; // Object URL for preview
  uploadStatus: UploadStatus;
  uploadProgress: number; // 0-100
  error?: string;
  metadata?: MediaMetadata;
}

export interface MediaMetadata {
  slug: string;
  description: string;
  alt?: string;
  caption?: string;
  tags?: string[];
  dimensions?: {
    width: number;
    height: number;
  };
  duration?: number; // For videos in seconds
  size: number; // File size in bytes
  mimeType: string;
  thumbnail?: string; // Thumbnail URL for videos
}

export interface UploadedMedia {
  id: string;
  url: string;
  thumbnailUrl?: string;
  metadata: MediaMetadata;
  storageRef: string; // Firebase storage reference path
  createdAt: Date;
}

export interface EditorState {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotation: number; // 0, 90, 180, 270
  flip: {
    horizontal: boolean;
    vertical: boolean;
  };
  zoom: number; // 1-3
  brightness: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  filter?: "none" | "grayscale" | "sepia" | "vintage" | "cold" | "warm";
  focusPoint?: {
    x: number; // 0-100 percentage from left
    y: number; // 0-100 percentage from top
  };
}

export interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VideoThumbnail {
  timestamp: number; // Time in seconds
  dataUrl: string; // Base64 image data
}

export interface MediaValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface MediaUploadOptions {
  maxFiles?: number;
  maxSizePerFile?: number;
  allowedTypes?: MediaType[];
  allowedFormats?: string[];
  requireMetadata?: boolean;
  autoUpload?: boolean;
  bucket?: string; // Storage bucket path
}

export interface MediaGalleryItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: MediaType;
  metadata: MediaMetadata;
  selected?: boolean;
  isPrimary?: boolean; // For product images
  order?: number;
}

export interface CameraOptions {
  facingMode?: "user" | "environment";
  resolution?: {
    width: number;
    height: number;
  };
  aspectRatio?: number;
}

export interface VideoRecorderOptions {
  source: "camera" | "screen";
  maxDuration?: number; // In seconds
  videoBitsPerSecond?: number;
  audioBitsPerSecond?: number;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: "jpeg" | "png" | "webp";
  maintainAspectRatio?: boolean;
}

export interface ThumbnailGenerationOptions {
  width: number;
  height: number;
  quality?: number;
  format?: "jpeg" | "png" | "webp";
  timestamps?: number[]; // Generate multiple thumbnails at different times
}
