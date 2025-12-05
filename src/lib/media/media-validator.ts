/**
 * @fileoverview TypeScript Module
 * @module src/lib/media/media-validator
 * @description This file contains functionality related to media-validator
 * 
 * @created 2025-12-05
 * @author Development Team
 */

import {
  FILE_SIZE_LIMITS,
  IMAGE_CONSTRAINTS,
  SUPPORTED_FORMATS,
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
/**
 * Validates file size
 *
 * @param {File} file - The file
 * @param {keyof typeof FILE_SIZE_LIMITS} resourceType - The resource type
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * validateFileSize(file, resourceType);
 */

/**
 * Validates file size
 *
 * @returns {any} The validatefilesize result
 *
 * @example
 * validateFileSize();
 */

export function validateFileSize(
  /** File */
  file: File,
  /** Resource Type */
  resourceType: keyof typeof FILE_SIZE_LIMITS
): { isValid: boolean; error?: string } {
  const maxSize = FILE_SIZE_LIMITS[resourceType];

  if (file.size > maxSize) {
    /**
     * Performs max size m b operation
     *
     * @returns {any} The maxsizemb result
     */

    /**
     * Performs max size m b operation
     *
     * @returns {any} The maxsizemb result
     */

    const maxSizeMB = (maxSize / (1024 * 1024)).toFixed(2);
    /**
     * Performs file size m b operation
     *
     * @returns {any} The filesizemb result
     */

    /**
     * Performs file size m b operation
     *
     * @returns {any} The filesizemb result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      /** Is Valid */
      isValid: false,
      /** Error */
      error: `File size (${fileSizeMB}MB) exceeds maximum allowed size (${maxSizeMB}MB)`,
    };
  }

  return { isValid: true };
}

/**
 * Validate file type/format
 */
/**
 * Validates file type
 *
 * @param {File} file - The file
 * @param {MediaType[]} allowedTypes - The allowed types
 *
 * @returns {boolean} True if condition is met, false otherwise
 *
 * @example
 * validateFileType(file, allowedTypes);
 */

/**
 * Validates file type
 *
 * @returns {any} The validatefiletype result
 *
 * @example
 * validateFileType();
 */

export function validateFileType(
  /** File */
  file: File,
  /** Allowed Types */
  allowedTypes: MediaType[]
): { isValid: boolean; error?: string } {
  const fileType = file.type;
  /**
   * Retrieves format key
   *
   * @param {MediaType} type - The type
   *
   * @returns {any} The formatkey result
   */

  /**
   * Retrieves format key
   *
   * @param {MediaType} type - The type
   *
   * @returns {any} The formatkey result
   */

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
      /** Is Valid */
      isValid: false,
      /** Error */
      error: `File type "${fileType}" is not supported. Allowed types: ${allowedTypes.join(
        ", "
      )}`,
    };
  }

  return { isValid: true };
}

/**
 * Validate image dimensions
 */
/**
 * Validates image dimensions
 *
 * @param {File} file - The file
 * @param {keyof typeof IMAGE_CONSTRAINTS} constraintType - The constraint type
 *
 * @returns {Promise<any>} Promise resolving to validateimagedimensions result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateImageDimensions(file, constraintType);
 */

/**
 * Validates image dimensions
 *
 * @returns {Promise<any>} Promise resolving to validateimagedimensions result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateImageDimensions();
 */

export async function validateImageDimensions(
  /** File */
  file: File,
  /** Constraint Type */
  constraintType: keyof typeof IMAGE_CONSTRAINTS
): Promise<{
  /** Is Valid */
  isValid: boolean;
  /** Error */
  error?: string;
  /** Dimensions */
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
          /** Is Valid */
          isValid: false,
          /** Error */
          error: `Image width (${width}px) is below minimum required (${constraints.minWidth}px)`,
          /** Dimensions */
          dimensions: { width, height },
        });
        return;
      }

      if (constraints.minHeight && height < constraints.minHeight) {
        resolve({
          /** Is Valid */
          isValid: false,
          /** Error */
          error: `Image height (${height}px) is below minimum required (${constraints.minHeight}px)`,
          /** Dimensions */
          dimensions: { width, height },
        });
        return;
      }

      // Check maximum dimensions
      if (constraints.maxWidth && width > constraints.maxWidth) {
        resolve({
          /** Is Valid */
          isValid: false,
          /** Error */
          error: `Image width (${width}px) exceeds maximum allowed (${constraints.maxWidth}px)`,
          /** Dimensions */
          dimensions: { width, height },
        });
        return;
      }

      if (constraints.maxHeight && height > constraints.maxHeight) {
        resolve({
          /** Is Valid */
          isValid: false,
          /** Error */
          error: `Image height (${height}px) exceeds maximum allowed (${constraints.maxHeight}px)`,
          /** Dimensions */
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
            /** Error */
            error: `Recommended aspect ratio is ${recommendedRatioStr}, but image is ${actualRatio.toFixed(
              2
            )}`,
            /** Dimensions */
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
        /** Is Valid */
        isValid: false,
        /** Error */
        error: "Failed to load image for validation",
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Validate video constraints
 */
/**
 * Validates video constraints
 *
 * @param {File} file - The file
 * @param {keyof typeof VIDEO_CONSTRAINTS} constraintType - The constraint type
 *
 * @returns {Promise<any>} Promise resolving to validatevideoconstraints result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateVideoConstraints(file, constraintType);
 */

/**
 * Validates video constraints
 *
 * @returns {Promise<any>} Promise resolving to validatevideoconstraints result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateVideoConstraints();
 */

export async function validateVideoConstraints(
  /** File */
  file: File,
  /** Constraint Type */
  constraintType: keyof typeof VIDEO_CONSTRAINTS
): Promise<{
  /** Is Valid */
  isValid: boolean;
  /** Error */
  error?: string;
  /** Metadata */
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
          /** Is Valid */
          isValid: false,
          /** Error */
          error: `Video duration (${duration.toFixed(
            0
          )}s) exceeds maximum allowed (${constraints.maxDuration}s)`,
          /** Metadata */
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
            /** Is Valid */
            isValid: false,
            /** Error */
            error: `Video resolution (${videoWidth}x${videoHeight}) exceeds maximum allowed (${constraints.maxWidth}x${constraints.maxHeight})`,
            /** Metadata */
            metadata: { duration, width: videoWidth, height: videoHeight },
          });
          return;
        }
      }

      resolve({
        /** Is Valid */
        isValid: true,
        /** Metadata */
        metadata: { duration, width: videoWidth, height: videoHeight },
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        /** Is Valid */
        isValid: false,
        /** Error */
        error: "Failed to load video for validation",
      });
    };

    video.src = objectUrl;
  });
}

/**
 * Comprehensive media validation
 */
/**
 * Validates media
 *
 * @returns {Promise<any>} Promise resolving to validatemedia result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateMedia();
 */

/**
 * Validates media
 *
 * @returns {Promise<any>} Promise resolving to validatemedia result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * validateMedia();
 */

export async function validateMedia(
  /** File */
  file: File,
  /** Resource Type */
  resourceType: keyof typeof FILE_SIZE_LIMITS,
  /** Media Type */
  mediaType: MediaType,
  /** Constraint Key */
  constraintKey?: string
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
      constraintKey as keyof typeof IMAGE_CONSTRAINTS
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
      constraintKey as keyof typeof VIDEO_CONSTRAINTS
    );
    if (!videoValidation.isValid && videoValidation.error) {
      errors.push(videoValidation.error);
    }
  }

  return {
    /** Is Valid */
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Get media type from file
 */
/**
 * Retrieves media type
 *
 * @param {File} file - The file
 *
 * @returns {any} The mediatype result
 *
 * @example
 * getMediaType(file);
 */

/**
 * Retrieves media type
 *
 * @param {File} file - The file
 *
 * @returns {any} The mediatype result
 *
 * @example
 * getMediaType(file);
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
      mimeType
    )
  ) {
    return "document";
  }

  return null;
}
