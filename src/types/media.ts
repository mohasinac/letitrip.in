/**
 * @fileoverview TypeScript Module
 * @module src/types/media
 * @description This file contains functionality related to media
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Media Types
 * Type definitions for media handling throughout the application
 */

/**
 * Media Type type definition
 * @typedef {MediaType}
 */
export type MediaType = "image" | "video" | "document";

/**
 * MediaSource type
 * 
 * @typedef {Object} MediaSource
 * @description Type definition for MediaSource
 */
export type MediaSource = "file" | "camera" | "screen";

/**
 * UploadStatus type
 * 
 * @typedef {Object} UploadStatus
 * @description Type definition for UploadStatus
 */
export type UploadStatus =
  | "pending"
  | "uploading"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

/**
 * MediaFile interface
 * 
 * @interface
 * @description Defines the structure and contract for MediaFile
 */
export interface MediaFile {
  /** Id */
  id: string;
  /** File */
  file: File;
  /** Type */
  type: MediaType;
  /** Source */
  source: MediaSource;
  /** Preview */
  preview: string; // Object URL for preview
  /** Upload Status */
  uploadStatus: UploadStatus;
  /** UploadProgress */
  uploadProgress: number; // 0-100
  /** Error */
  error?: string;
  /** Metadata */
  metadata?: MediaMetadata;
}

/**
 * MediaMetadata interface
 * 
 * @interface
 * @description Defines the structure and contract for MediaMetadata
 */
export interface MediaMetadata {
  /** Slug */
  slug: string;
  /** Description */
  description: string;
  /** Alt */
  alt?: string;
  /** Caption */
  caption?: string;
  /** Tags */
  tags?: string[];
  /** Dimensions */
  dimensions?: {
    /** Width */
    width: number;
    /** Height */
    height: number;
  };
  /** Duration */
  duration?: number; // For videos in seconds
  /** Size */
  size: number; // File size in bytes
  /** Mime Type */
  mimeType: string;
  /** Thumbnail */
  thumbnail?: string; // Thumbnail URL for videos
  /** FocusX */
  focusX?: number; // Focus point X coordinate (0-100, percentage from left)
  /** FocusY */
  focusY?: number; // Focus point Y coordinate (0-100, percentage from top)
}

/**
 * UploadedMedia interface
 * 
 * @interface
 * @description Defines the structure and contract for UploadedMedia
 */
export interface UploadedMedia {
  /** Id */
  id: string;
  /** Url */
  url: string;
  /** Thumbnail Url */
  thumbnailUrl?: string;
  /** Metadata */
  metadata: MediaMetadata;
  /** StorageRef */
  storageRef: string; // Firebase storage reference path
  /** Created At */
  createdAt: Date;
}

/**
 * EditorState interface
 * 
 * @interface
 * @description Defines the structure and contract for EditorState
 */
export interface EditorState {
  /** Crop */
  crop?: {
    /** X */
    x: number;
    /** Y */
    y: number;
    /** Width */
    width: number;
    /** Height */
    height: number;
  };
  /** Rotation */
  rotation: number; // 0, 90, 180, 270
  /** Flip */
  flip: {
    /** Horizontal */
    horizontal: boolean;
    /** Vertical */
    vertical: boolean;
  };
  /** Zoom */
  zoom: number; // 1-3
  /** Brightness */
  brightness: number; // -100 to 100
  /** Contrast */
  contrast: number; // -100 to 100
  /** Saturation */
  saturation: number; // -100 to 100
  /** Filter */
  filter?: "none" | "grayscale" | "sepia" | "vintage" | "cold" | "warm";
  /** Focus Point */
  focusPoint?: {
    /** X */
    x: number; // 0-100 percentage from left
    /** Y */
    y: number; // 0-100 percentage from top
  };
}

/**
 * CropArea interface
 * 
 * @interface
 * @description Defines the structure and contract for CropArea
 */
export interface CropArea {
  /** X */
  x: number;
  /** Y */
  y: number;
  /** Width */
  width: number;
  /** Height */
  height: number;
}

/**
 * VideoThumbnail interface
 * 
 * @interface
 * @description Defines the structure and contract for VideoThumbnail
 */
export interface VideoThumbnail {
  /** Timestamp */
  timestamp: number; // Time in seconds
  /** DataUrl */
  dataUrl: string; // Base64 image data
}

/**
 * MediaValidationResult interface
 * 
 * @interface
 * @description Defines the structure and contract for MediaValidationResult
 */
export interface MediaValidationResult {
  /** Is Valid */
  isValid: boolean;
  /** Errors */
  errors: string[];
  /** Warnings */
  warnings: string[];
}

/**
 * MediaUploadOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for MediaUploadOptions
 */
export interface MediaUploadOptions {
  /** Max Files */
  maxFiles?: number;
  /** Max Size Per File */
  maxSizePerFile?: number;
  /** Allowed Types */
  allowedTypes?: MediaType[];
  /** Allowed Formats */
  allowedFormats?: string[];
  /** Require Metadata */
  requireMetadata?: boolean;
  /** Auto Upload */
  autoUpload?: boolean;
  /** Bucket */
  bucket?: string; // Storage bucket path
}

/**
 * MediaGalleryItem interface
 * 
 * @interface
 * @description Defines the structure and contract for MediaGalleryItem
 */
export interface MediaGalleryItem {
  /** Id */
  id: string;
  /** Url */
  url: string;
  /** Thumbnail Url */
  thumbnailUrl?: string;
  /** Type */
  type: MediaType;
  /** Metadata */
  metadata: MediaMetadata;
  /** Selected */
  selected?: boolean;
  /** IsPrimary */
  isPrimary?: boolean; // For product images
  /** Order */
  order?: number;
}

/**
 * CameraOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for CameraOptions
 */
export interface CameraOptions {
  /** Facing Mode */
  facingMode?: "user" | "environment";
  /** Resolution */
  resolution?: {
    /** Width */
    width: number;
    /** Height */
    height: number;
  };
  /** Aspect Ratio */
  aspectRatio?: number;
}

/**
 * VideoRecorderOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for VideoRecorderOptions
 */
export interface VideoRecorderOptions {
  /** Source */
  source: "camera" | "screen";
  /** MaxDuration */
  maxDuration?: number; // In seconds
  /** Video Bits Per Second */
  videoBitsPerSecond?: number;
  /** Audio Bits Per Second */
  audioBitsPerSecond?: number;
}

/**
 * ImageProcessingOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for ImageProcessingOptions
 */
export interface ImageProcessingOptions {
  /** Max Width */
  maxWidth?: number;
  /** Max Height */
  maxHeight?: number;
  /** Quality */
  quality?: number; // 0-1
  /** Format */
  format?: "jpeg" | "png" | "webp";
  /** Maintain Aspect Ratio */
  maintainAspectRatio?: boolean;
}

/**
 * ThumbnailGenerationOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for ThumbnailGenerationOptions
 */
export interface ThumbnailGenerationOptions {
  /** Width */
  width: number;
  /** Height */
  height: number;
  /** Quality */
  quality?: number;
  /** Format */
  format?: "jpeg" | "png" | "webp";
  /** Timestamps */
  timestamps?: number[]; // Generate multiple thumbnails at different times
}
