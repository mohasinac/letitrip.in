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
  IMAGES: {
    mimeTypes: [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ],
    extensions: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    displayName: 'JPG, PNG, WebP, or GIF',
  },
  
  VIDEOS: {
    mimeTypes: [
      'video/mp4',
      'video/webm',
      'video/quicktime',
      'video/x-msvideo',
    ],
    extensions: ['.mp4', '.webm', '.mov', '.avi'],
    displayName: 'MP4, WebM, MOV, or AVI',
  },
  
  DOCUMENTS: {
    mimeTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ],
    extensions: ['.pdf', '.doc', '.docx', '.xls', '.xlsx'],
    displayName: 'PDF, DOC, DOCX, XLS, or XLSX',
  },
} as const;

/**
 * Image Upload Constraints
 */
export const IMAGE_CONSTRAINTS = {
  // Product images
  PRODUCT: {
    minWidth: 500,
    minHeight: 500,
    maxWidth: 4000,
    maxHeight: 4000,
    aspectRatio: null, // Any aspect ratio
    recommendedRatio: '1:1',
  },
  
  // Shop logo (must be square)
  SHOP_LOGO: {
    minWidth: 200,
    minHeight: 200,
    maxWidth: 1000,
    maxHeight: 1000,
    aspectRatio: 1, // Must be square (1:1)
    recommendedRatio: '1:1',
  },
  
  // Shop banner
  SHOP_BANNER: {
    minWidth: 1200,
    minHeight: 300,
    maxWidth: 4000,
    maxHeight: 1000,
    aspectRatio: null,
    recommendedRatio: '4:1',
  },
  
  // Category image
  CATEGORY: {
    minWidth: 400,
    minHeight: 400,
    maxWidth: 2000,
    maxHeight: 2000,
    aspectRatio: 1, // Must be square
    recommendedRatio: '1:1',
  },
  
  // User avatar (must be square)
  AVATAR: {
    minWidth: 100,
    minHeight: 100,
    maxWidth: 1000,
    maxHeight: 1000,
    aspectRatio: 1, // Must be square
    recommendedRatio: '1:1',
  },
  
  // Review images
  REVIEW: {
    minWidth: 400,
    minHeight: 400,
    maxWidth: 4000,
    maxHeight: 4000,
    aspectRatio: null,
    recommendedRatio: '1:1 or 4:3',
  },
} as const;

/**
 * Video Upload Constraints
 */
export const VIDEO_CONSTRAINTS = {
  // Product videos
  PRODUCT: {
    maxDuration: 300, // 5 minutes in seconds
    minDuration: 5, // 5 seconds
    maxWidth: 1920,
    maxHeight: 1080,
    maxFrameRate: 60,
  },
  
  // Review videos
  REVIEW: {
    maxDuration: 180, // 3 minutes
    minDuration: 10, // 10 seconds
    maxWidth: 1920,
    maxHeight: 1080,
    maxFrameRate: 30,
  },
  
  // Return/dispute videos
  RETURN: {
    maxDuration: 300, // 5 minutes
    minDuration: 10, // 10 seconds
    maxWidth: 1920,
    maxHeight: 1080,
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
  IMAGE: {
    // Generate multiple sizes
    generateThumbnail: true,
    generateSmall: true,
    generateMedium: true,
    generateLarge: false,
    
    // Compression
    quality: 85,
    format: 'webp', // Convert to WebP for better compression
    fallbackFormat: 'jpeg',
    
    // Metadata
    stripMetadata: true, // Remove EXIF data for privacy
    preserveOrientation: true,
  },
  
  // Video processing
  VIDEO: {
    // Generate thumbnail
    generateThumbnail: true,
    thumbnailTimestamp: 1, // Extract at 1 second
    
    // Compression
    codec: 'h264',
    quality: 'medium',
    
    // Validation
    validateDuration: true,
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
    `Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`,
  
  TOTAL_SIZE_EXCEEDED: (maxSize: number) => 
    `Total upload size exceeds ${formatFileSize(maxSize)}`,
} as const;

/**
 * Upload Status
 */
export const UPLOAD_STATUS = {
  IDLE: 'idle',
  VALIDATING: 'validating',
  UPLOADING: 'uploading',
  PROCESSING: 'processing',
  SUCCESS: 'success',
  ERROR: 'error',
  CANCELLED: 'cancelled',
} as const;

/**
 * Helper Functions
 */

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  
  if (minutes === 0) {
    return `${secs} second${secs !== 1 ? 's' : ''}`;
  }
  
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
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
  type: (file: File, allowedTypes: string[]): boolean => {
    return allowedTypes.includes(file.type);
  },
  
  /**
   * Check if file extension is allowed
   */
  extension: (filename: string, allowedExtensions: string[]): boolean => {
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return allowedExtensions.includes(ext);
  },
  
  /**
   * Check if image dimensions are within constraints
   */
  imageDimensions: async (
    file: File,
    constraints: { minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number }
  ): Promise<{ valid: boolean; width: number; height: number; error?: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        
        const { width, height } = img;
        
        if (constraints.minWidth && width < constraints.minWidth) {
          resolve({ valid: false, width, height, error: `Width must be at least ${constraints.minWidth}px` });
          return;
        }
        
        if (constraints.minHeight && height < constraints.minHeight) {
          resolve({ valid: false, width, height, error: `Height must be at least ${constraints.minHeight}px` });
          return;
        }
        
        if (constraints.maxWidth && width > constraints.maxWidth) {
          resolve({ valid: false, width, height, error: `Width must not exceed ${constraints.maxWidth}px` });
          return;
        }
        
        if (constraints.maxHeight && height > constraints.maxHeight) {
          resolve({ valid: false, width, height, error: `Height must not exceed ${constraints.maxHeight}px` });
          return;
        }
        
        resolve({ valid: true, width, height });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ valid: false, width: 0, height: 0, error: 'Failed to load image' });
      };
      
      img.src = url;
    });
  },
};

export type UploadStatus = typeof UPLOAD_STATUS[keyof typeof UPLOAD_STATUS];
