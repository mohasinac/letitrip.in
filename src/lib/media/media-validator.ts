import {
  FILE_SIZE_LIMITS,
  SUPPORTED_FORMATS,
  IMAGE_CONSTRAINTS,
  VIDEO_CONSTRAINTS,
} from "@/constants/media";
import type { MediaType, MediaValidationResult } from "@/types/media";

/**
 * Media Validation Utilities
 * Validates media files against constraints from constants/media.ts
 */

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  resourceType: keyof typeof FILE_SIZE_LIMITS,
): { isValid: boolean; error?: string } {
  const maxSize = FILE_SIZE_LIMITS[resourceType];

  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      isValid: false,
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  return { isValid: true };
}

/**
 * Validate file type/format
 */
export function validateFileType(
  file: File,
  allowedTypes: MediaType[],
): { isValid: boolean; error?: string } {
  const fileType = file.type;
  const getFormatKey = (type: MediaType): keyof typeof SUPPORTED_FORMATS => {
    if (type === "image") return "IMAGES";
    if (type === "video") return "VIDEOS";
    return "DOCUMENTS";
  };
  const isValid = allowedTypes.some((type) => {
    const formatKey = getFormatKey(type);
    const formats = SUPPORTED_FORMATS[formatKey];
    return (formats.mimeTypes as readonly string[]).includes(fileType);
  });

  if (!isValid) {
    return {
      isValid: false,
      error: `File type "${fileType}" is not supported. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate image dimensions
 */
export async function validateImageDimensions(
  file: File,
  constraintType: keyof typeof IMAGE_CONSTRAINTS,
): Promise<{
  isValid: boolean;
  error?: string;
  dimensions?: { width: number; height: number };
}> {
  if (!file.type.startsWith("image/")) {
    return { isValid: true }; // Skip for non-images
  }

  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const constraints = IMAGE_CONSTRAINTS[constraintType];
      const { width, height } = img;

      // Check minimum dimensions
      if (constraints.minWidth && width < constraints.minWidth) {
        resolve({
          isValid: false,
          error: `Image width (${width}px) is below minimum required (${constraints.minWidth}px)`,
          dimensions: { width, height },
        });
        return;
      }

      if (constraints.minHeight && height < constraints.minHeight) {
        resolve({
          isValid: false,
          error: `Image height (${height}px) is below minimum required (${constraints.minHeight}px)`,
          dimensions: { width, height },
        });
        return;
      }

      // Check maximum dimensions
      if (constraints.maxWidth && width > constraints.maxWidth) {
        resolve({
          isValid: false,
          error: `Image width (${width}px) exceeds maximum allowed (${constraints.maxWidth}px)`,
          dimensions: { width, height },
        });
        return;
      }

      if (constraints.maxHeight && height > constraints.maxHeight) {
        resolve({
          isValid: false,
          error: `Image height (${height}px) exceeds maximum allowed (${constraints.maxHeight}px)`,
          dimensions: { width, height },
        });
        return;
      }

      // Check aspect ratio if recommended
      if (
        constraints.aspectRatio !== null &&
        constraints.aspectRatio !== undefined
      ) {
        const actualRatio = width / height;
        const expectedRatio = constraints.aspectRatio;
        const tolerance = 0.1; // 10% tolerance

        if (Math.abs(actualRatio - expectedRatio) > tolerance) {
          const recommendedRatioStr =
            constraints.recommendedRatio || expectedRatio.toFixed(2);

          resolve({
            isValid: true, // Warning, not error
            error: `Recommended aspect ratio is ${recommendedRatioStr}, but image is ${actualRatio.toFixed(2)}`,
            dimensions: { width, height },
          });
          return;
        }
      }

      resolve({ isValid: true, dimensions: { width, height } });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error: "Failed to load image for validation",
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Validate video constraints
 */
export async function validateVideoConstraints(
  file: File,
  constraintType: keyof typeof VIDEO_CONSTRAINTS,
): Promise<{
  isValid: boolean;
  error?: string;
  metadata?: { duration: number; width: number; height: number };
}> {
  if (!file.type.startsWith("video/")) {
    return { isValid: true }; // Skip for non-videos
  }

  return new Promise((resolve) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);

      const constraints = VIDEO_CONSTRAINTS[constraintType];
      const { duration, videoWidth, videoHeight } = video;

      // Check duration
      if (constraints.maxDuration && duration > constraints.maxDuration) {
        resolve({
          isValid: false,
          error: `Video duration (${duration.toFixed(0)}s) exceeds maximum allowed (${constraints.maxDuration}s)`,
          metadata: { duration, width: videoWidth, height: videoHeight },
        });
        return;
      }

      // Check resolution
      if (constraints.maxWidth && constraints.maxHeight) {
        const maxPixels = constraints.maxWidth * constraints.maxHeight;
        const actualPixels = videoWidth * videoHeight;

        if (actualPixels > maxPixels) {
          resolve({
            isValid: false,
            error: `Video resolution (${videoWidth}x${videoHeight}) exceeds maximum allowed (${constraints.maxWidth}x${constraints.maxHeight})`,
            metadata: { duration, width: videoWidth, height: videoHeight },
          });
          return;
        }
      }

      resolve({
        isValid: true,
        metadata: { duration, width: videoWidth, height: videoHeight },
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error: "Failed to load video for validation",
      });
    };

    video.src = objectUrl;
  });
}

/**
 * Comprehensive media validation
 */
export async function validateMedia(
  file: File,
  resourceType: keyof typeof FILE_SIZE_LIMITS,
  mediaType: MediaType,
  constraintKey?: string,
): Promise<MediaValidationResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate file size
  const sizeValidation = validateFileSize(file, resourceType);
  if (!sizeValidation.isValid && sizeValidation.error) {
    errors.push(sizeValidation.error);
  }

  // Validate file type
  const typeValidation = validateFileType(file, [mediaType]);
  if (!typeValidation.isValid && typeValidation.error) {
    errors.push(typeValidation.error);
  }

  // Validate image dimensions if applicable
  if (
    mediaType === "image" &&
    constraintKey &&
    constraintKey in IMAGE_CONSTRAINTS
  ) {
    const dimensionsValidation = await validateImageDimensions(
      file,
      constraintKey as keyof typeof IMAGE_CONSTRAINTS,
    );
    if (!dimensionsValidation.isValid && dimensionsValidation.error) {
      // Check if it's a warning (aspect ratio)
      if (dimensionsValidation.error.includes("Recommended aspect ratio")) {
        warnings.push(dimensionsValidation.error);
      } else {
        errors.push(dimensionsValidation.error);
      }
    }
  }

  // Validate video constraints if applicable
  if (
    mediaType === "video" &&
    constraintKey &&
    constraintKey in VIDEO_CONSTRAINTS
  ) {
    const videoValidation = await validateVideoConstraints(
      file,
      constraintKey as keyof typeof VIDEO_CONSTRAINTS,
    );
    if (!videoValidation.isValid && videoValidation.error) {
      errors.push(videoValidation.error);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get media type from file
 */
export function getMediaType(file: File): MediaType | null {
  const mimeType = file.type;

  if (
    (SUPPORTED_FORMATS.IMAGES.mimeTypes as readonly string[]).includes(mimeType)
  ) {
    return "image";
  }

  if (
    (SUPPORTED_FORMATS.VIDEOS.mimeTypes as readonly string[]).includes(mimeType)
  ) {
    return "video";
  }

  if (
    (SUPPORTED_FORMATS.DOCUMENTS.mimeTypes as readonly string[]).includes(
      mimeType,
    )
  ) {
    return "document";
  }

  return null;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/**
 * Format duration for display (seconds to MM:SS)
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
