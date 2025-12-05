/**
 * @fileoverview TypeScript Module
 * @module src/constants/media
 * @description This file contains functionality related to media
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Media Upload Configuration
 * Validation rules, formats, and limits for media uploads
 */

/**
 * File Size Limits (in bytes)
 */
export const FILE_SIZE_LIMITS = {
  // Images
  PRODUCT_IMAGE: 10 * 1024 * 1024, // 10MB
  SHOP_LOGO: 2 * 1024 * 1024, // 2MB
  SHOP_BANNER: 5 * 1024 * 1024, // 5MB
  CATEGORY_IMAGE: 5 * 1024 * 1024, // 5MB
  USER_AVATAR: 2 * 1024 * 1024, // 2MB
  REVIEW_IMAGE: 5 * 1024 * 1024, // 5MB
  RETURN_IMAGE: 10 * 1024 * 1024, // 10MB

  // Videos
  PRODUCT_VIDEO: 100 * 1024 * 1024, // 100MB
  REVIEW_VIDEO: 50 * 1024 * 1024, // 50MB
  RETURN_VIDEO: 100 * 1024 * 1024, // 100MB

  // Documents
  INVOICE: 5 * 1024 * 1024, // 5MB
  TICKET_ATTACHMENT: 10 * 1024 * 1024, // 10MB
} as const;

/**
 * Supported File Formats
 */
export const SUPPORTED_FORMATS = {
  /** I M A G E S */
  IMAGES: {
    /** Mime Types */
    mimeTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
    ],
    /** Extensions */
    extensions: [".jpg", ".jpeg", ".png", ".webp", ".gif"],
    /** Display Name */
    displayName: "JPG, PNG, WebP, or GIF",
  },

  /** V I D E O S */
  VIDEOS: {
    /** Mime Types */
    mimeTypes: [
      "video/mp4",
      "video/webm",
      "video/quicktime",
      "video/x-msvideo",
    ],
    /** Extensions */
    extensions: [".mp4", ".webm", ".mov", ".avi"],
    /** Display Name */
    displayName: "MP4, WebM, MOV, or AVI",
  },

  /** D O C U M E N T S */
  DOCUMENTS: {
    /** Mime Types */
    mimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ],
    /** Extensions */
    extensions: [".pdf", ".doc", ".docx", ".xls", ".xlsx"],
    /** Display Name */
    displayName: "PDF, DOC, DOCX, XLS, or XLSX",
  },
} as const;

/**
 * Image Upload Constraints
 */
export const IMAGE_CONSTRAINTS = {
  // Product images
  /** P R O D U C T */
  PRODUCT: {
    /** Min Width */
    minWidth: 500,
    /** Min Height */
    minHeight: 500,
    /** Max Width */
    maxWidth: 4000,
    /** Max Height */
    maxHeight: 4000,
    aspectRatio: null, // Any aspect ratio
    /** Recommended Ratio */
    recommendedRatio: "1:1",
  },

  // Shop logo (must be square)
  SHOP_LOGO: {
    /** Min Width */
    minWidth: 200,
    /** Min Height */
    minHeight: 200,
    /** Max Width */
    maxWidth: 1000,
    /** Max Height */
    maxHeight: 1000,
    aspectRatio: 1, // Must be square (1:1)
    /** Recommended Ratio */
    recommendedRatio: "1:1",
  },

  // Shop banner
  SHOP_BANNER: {
    /** Min Width */
    minWidth: 1200,
    /** Min Height */
    minHeight: 300,
    /** Max Width */
    maxWidth: 4000,
    /** Max Height */
    maxHeight: 1000,
    /** Aspect Ratio */
    aspectRatio: null,
    /** Recommended Ratio */
    recommendedRatio: "4:1",
  },

  // Category image
  /** C A T E G O R Y */
  CATEGORY: {
    /** Min Width */
    minWidth: 400,
    /** Min Height */
    minHeight: 400,
    /** Max Width */
    maxWidth: 2000,
    /** Max Height */
    maxHeight: 2000,
    aspectRatio: 1, // Must be square
    /** Recommended Ratio */
    recommendedRatio: "1:1",
  },

  // User avatar (must be square)
  /** A V A T A R */
  AVATAR: {
    /** Min Width */
    minWidth: 100,
    /** Min Height */
    minHeight: 100,
    /** Max Width */
    maxWidth: 1000,
    /** Max Height */
    maxHeight: 1000,
    aspectRatio: 1, // Must be square
    /** Recommended Ratio */
    recommendedRatio: "1:1",
  },

  // Review images
  /** R E V I E W */
  REVIEW: {
    /** Min Width */
    minWidth: 400,
    /** Min Height */
    minHeight: 400,
    /** Max Width */
    maxWidth: 4000,
    /** Max Height */
    maxHeight: 4000,
    /** Aspect Ratio */
    aspectRatio: null,
    /** Recommended Ratio */
    recommendedRatio: "1:1 or 4:3",
  },
} as const;

/**
 * Video Upload Constraints
 */
export const VIDEO_CONSTRAINTS = {
  // Product videos
  /** P R O D U C T */
  PRODUCT: {
    maxDuration: 300, // 5 minutes in seconds
    minDuration: 5, // 5 seconds
    /** Max Width */
    maxWidth: 1920,
    /** Max Height */
    maxHeight: 1080,
    /** Max Frame Rate */
    maxFrameRate: 60,
  },

  // Review videos
  /** R E V I E W */
  REVIEW: {
    maxDuration: 180, // 3 minutes
    minDuration: 10, // 10 seconds
    /** Max Width */
    maxWidth: 1920,
    /** Max Height */
    maxHeight: 1080,
    /** Max Frame Rate */
    maxFrameRate: 30,
  },

  // Return/dispute videos
  /** R E T U R N */
  RETURN: {
    maxDuration: 300, // 5 minutes
    minDuration: 10, // 10 seconds
    /** Max Width */
    maxWidth: 1920,
    /** Max Height */
    maxHeight: 1080,
    /** Max Frame Rate */
    maxFrameRate: 30,
  },
} as const;

/**
 * Upload Limits by Resource Type
 */
export const UPLOAD_LIMITS = {
  // Maximum number of files per upload
  PRODUCT_IMAGES: 10,
  PRODUCT_VIDEOS: 1,
  REVIEW_IMAGES: 5,
  REVIEW_VIDEOS: 1,
  RETURN_IMAGES: 10,
  RETURN_VIDEOS: 2,
  TICKET_ATTACHMENTS: 5,

  // Maximum total size for all files in a single upload
  TOTAL_SIZE_LIMIT: 200 * 1024 * 1024, // 200MB
} as const;

/**
 * Media Processing Options
 */
export const PROCESSING_OPTIONS = {
  // Image optimization
  /** I M A G E */
  IMAGE: {
    // Generate multiple sizes
    /** Generate Thumbnail */
    generateThumbnail: true,
    /** Generate Small */
    generateSmall: true,
    /** Generate Medium */
    generateMedium: true,
    /** Generate Large */
    generateLarge: false,

    // Compression
    /** Quality */
    quality: 85,
    format: "webp", // Convert to WebP for better compression
    /** Fallback Format */
    fallbackFormat: "jpeg",

    // Metadata
    stripMetadata: true, // Remove EXIF data for privacy
    /** Preserve Orientation */
    preserveOrientation: true,
  },

  // Video processing
  /** V I D E O */
  VIDEO: {
    // Generate thumbnail
    /** Generate Thumbnail */
    generateThumbnail: true,
    thumbnailTimestamp: 1, // Extract at 1 second

    // Compression
    /** Codec */
    codec: "h264",
    /** Quality */
    quality: "medium",

    // Validation
    /** Validate Duration */
    validateDuration: true,
    /** Validate Resolution */
    validateResolution: true,
  },
} as const;

/**
 * Upload Validation Messages
 */
export const VALIDATION_MESSAGES = {
  FILE_TOO_LARGE: (maxSize: number) =>
    `File size exceeds ${formatFileSize(maxSize)}`,

  INVALID_FILE_TYPE: (allowedTypes: string) =>
    `Invalid file type. Allowed: ${allowedTypes}`,

  IMAGE_TOO_SMALL: (minWidth: number, minHeight: number) =>
    `Image must be at least ${minWidth}x${minHeight} pixels`,

  IMAGE_TOO_LARGE: (maxWidth: number, maxHeight: number) =>
    `Image must not exceed ${maxWidth}x${maxHeight} pixels`,

  INVALID_ASPECT_RATIO: (requiredRatio: string) =>
    `Image must have a ${requiredRatio} aspect ratio`,

  VIDEO_TOO_LONG: (maxDuration: number) =>
    `Video must not exceed ${formatDuration(maxDuration)}`,

  VIDEO_TOO_SHORT: (minDuration: number) =>
    `Video must be at least ${formatDuration(minDuration)}`,

  TOO_MANY_FILES: (maxFiles: number) =>
    `Maximum ${maxFiles} file${maxFiles > 1 ? "s" : ""} allowed`,

  TOTAL_SIZE_EXCEEDED: (maxSize: number) =>
    `Total upload size exceeds ${formatFileSize(maxSize)}`,
} as const;

/**
 * Upload Status
 */
export const UPLOAD_STATUS = {
  /** I D L E */
  IDLE: "idle",
  /** V A L I D A T I N G */
  VALIDATING: "validating",
  /** U P L O A D I N G */
  UPLOADING: "uploading",
  /** P R O C E S S I N G */
  PROCESSING: "processing",
  /** S U C C E S S */
  SUCCESS: "success",
  /** E R R O R */
  ERROR: "error",
  /** C A N C E L L E D */
  CANCELLED: "cancelled",
} as const;

/**
 * Helper Functions
 */

/**
 * Formats file size
 *
 * @param {number} bytes - The bytes
 *
 * @returns {string} The formatfilesize result
 */

/**
 * Formats file size
 *
 * @param {number} bytes - The bytes
 *
 * @returns {string} The formatfilesize result
 */

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/**
 * Function: Format Duration
 */
/**
 * Formats duration
 *
 * @param {number} seconds - The seconds
 *
 * @returns {string} The formatduration result
 */

/**
 * Formats duration
 *
 * @param {number} seconds - The seconds
 *
 * @returns {string} The formatduration result
 */

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  if (minutes === 0) {
    return `${secs} second${secs !== 1 ? "s" : ""}`;
  }

  return `${minutes} minute${minutes !== 1 ? "s" : ""}`;
}

/**
 * Validation Helper Functions
 */
export const validateFile = {
  /**
   * Check if file size is within limit
   */
  size: (file: File, maxSize: number): boolean => {
    return file.size <= maxSize;
  },

  /**
   * Check if file type is allowed
   */
  /** Type */
  type: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },

  /**
   * Check if file extension is allowed
   */
  /** Extension */
  extension: (filename: string, allowedExtensions: string[]): boolean => {
    /**
 * Performs ext operation
 *
 * @returns {Promise<} The ext result
 *
 */
const ext = filename.toLowerCase().substring(filename.lastIndexOf("."));
    return allowedExtensions.includes(ext);
  },

  /**
   * Check if image dimensions are within constraints
   */
  /** ImageDimensions */
  imageDimensions: async (
    /** File */
    file: File,
    /** Constraints */
    constraints: {
      /** Min Width */
      minWidth?: number;
      /** Min Height */
      minHeight?: number;
      /** Max Width */
      maxWidth?: number;
      /** Max Height */
      maxHeight?: number;
    },
  ): Promise<{
    /** Valid */
    valid: boolean;
    /** Width */
    width: number;
    /** Height */
    height: number;
    /** Error */
    error?: string;
  }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(url);

        const { width, height } = img;

        if (constraints.minWidth && width < constraints.minWidth) {
          resolve({
            /** Valid */
            valid: false,
            width,
            height,
            /** Error */
            error: `Width must be at least ${constraints.minWidth}px`,
          });
          return;
        }

        if (constraints.minHeight && height < constraints.minHeight) {
          resolve({
            /** Valid */
            valid: false,
            width,
            height,
            /** Error */
            error: `Height must be at least ${constraints.minHeight}px`,
          });
          return;
        }

        if (constraints.maxWidth && width > constraints.maxWidth) {
          resolve({
            /** Valid */
            valid: false,
            width,
            height,
            /** Error */
            error: `Width must not exceed ${constraints.maxWidth}px`,
          });
          return;
        }

        if (constraints.maxHeight && height > constraints.maxHeight) {
          resolve({
            /** Valid */
            valid: false,
            width,
            height,
            /** Error */
            error: `Height must not exceed ${constraints.maxHeight}px`,
          });
          return;
        }

        resolve({ valid: true, width, height });
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({
          /** Valid */
          valid: false,
          /** Width */
          width: 0,
          /** Height */
          height: 0,
          /** Error */
          error: "Failed to load image",
        });
      };

      img.src = url;
    });
  },
};

/**
 * UploadStatus type
 * 
 * @typedef {Object} UploadStatus
 * @description Type definition for UploadStatus
 */
export type UploadStatus = (typeof UPLOAD_STATUS)[keyof typeof UPLOAD_STATUS];
