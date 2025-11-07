/**
 * Media Library Utilities
 * Export all media processing and validation utilities
 */

// Validation
export {
  validateFileSize,
  validateFileType,
  validateImageDimensions,
  validateVideoConstraints,
  validateMedia,
  getMediaType,
  formatFileSize,
  formatDuration,
} from './media-validator';

// Image Processing
export {
  resizeImage,
  cropImage,
  rotateImage,
  flipImage,
  applyImageEdits,
  blobToFile,
} from './image-processor';

// Video Processing
export {
  extractVideoThumbnail,
  extractMultipleThumbnails,
  getVideoMetadata,
  generateVideoPreview,
  createThumbnailFromBlob,
} from './video-processor';
