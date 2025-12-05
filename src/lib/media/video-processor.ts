/**
 * @fileoverview TypeScript Module
 * @module src/lib/media/video-processor
 * @description This file contains functionality related to video-processor
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Video Processing Utilities
 * Handles video thumbnail extraction and metadata
 */

import type { VideoThumbnail, ThumbnailGenerationOptions } from "@/types/media";

/**
 * Extract video thumbnail at specific timestamp
 */
/**
 * Performs extract video thumbnail operation
 *
 * @param {File} file - The file
 * @param {number} [timestamp] - The timestamp
 * @param {Partial<ThumbnailGenerationOptions>} [options] - Configuration options
 *
 * @returns {Promise<any>} Promise resolving to extractvideothumbnail result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * extractVideoThumbnail(file, 123, options);
 */

/**
 * Performs extract video thumbnail operation
 *
 * @returns {Promise<any>} Promise resolving to extractvideothumbnail result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * extractVideoThumbnail();
 */

export async function extractVideoThumbnail(
  /** File */
  file: File,
  /** Timestamp */
  timestamp: number = 0,
  /** Options */
  options?: Partial<ThumbnailGenerationOptions>,
): Promise<string> {
  const {
    width = 320,
    height = 180,
    quality = 0.8,
    format = "jpeg",
  } = options || {};

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      // Ensure timestamp is within video duration
      video.currentTime = Math.min(timestamp, video.duration);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw video frame
        ctx.drawImage(video, 0, 0, width, height);

        // Convert to data URL
        const dataUrl = canvas.toDataURL(`image/${format}`, quality);

        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load video"));
    };

    video.src = objectUrl;
  });
}

/**
 * Extract multiple thumbnails from video
 */
/**
 * Performs extract multiple thumbnails operation
 *
 * @param {File} file - The file
 * @param {number} [count] - The count
 * @param {Partial<ThumbnailGenerationOptions>} [options] - Configuration options
 *
 * @returns {Promise<any>} Promise resolving to extractmultiplethumbnails result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * extractMultipleThumbnails(file, 123, options);
 */

/**
 * Performs extract multiple thumbnails operation
 *
 * @returns {Promise<any>} Promise resolving to extractmultiplethumbnails result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * extractMultipleThumbnails();
 */

export async function extractMultipleThumbnails(
  /** File */
  file: File,
  /** Count */
  count: number = 5,
  /** Options */
  options?: Partial<ThumbnailGenerationOptions>,
): Promise<VideoThumbnail[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);
    const thumbnails: VideoThumbnail[] = [];

    video.onloadedmetadata = async () => {
      const duration = video.duration;
      const interval = duration / (count + 1);
      const timestamps: number[] = [];

      for (let i = 1; i <= count; i++) {
        timestamps.push(interval * i);
      }

      try {
        for (const timestamp of timestamps) {
          const dataUrl = await extractVideoThumbnail(file, timestamp, options);
          thumbnails.push({ timestamp, dataUrl });
        }

        URL.revokeObjectURL(objectUrl);
        resolve(thumbnails);
      } catch (error) {
        URL.revokeObjectURL(objectUrl);
        reject(error);
      }
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load video"));
    };

    video.src = objectUrl;
  });
}

/**
 * Get video metadata
 */
/**
 * Retrieves video metadata
 *
 * @param {File} file - The file
 *
 * @returns {Promise<any>} Promise resolving to videometadata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getVideoMetadata(file);
 */

/**
 * Retrieves video metadata
 *
 * @param {File} file - The file
 *
 * @returns {Promise<any>} Promise resolving to videometadata result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * getVideoMetadata(file);
 */

export async function getVideoMetadata(file: File): Promise<{
  /** Duration */
  duration: number;
  /** Width */
  width: number;
  /** Height */
  height: number;
  /** Aspect Ratio */
  aspectRatio: number;
  /** Size */
  size: number;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      const metadata = {
        /** Duration */
        duration: video.duration,
        /** Width */
        width: video.videoWidth,
        /** Height */
        height: video.videoHeight,
        /** Aspect Ratio */
        aspectRatio: video.videoWidth / video.videoHeight,
        /** Size */
        size: file.size,
      };

      URL.revokeObjectURL(objectUrl);
      resolve(metadata);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load video"));
    };

    video.src = objectUrl;
  });
}

/**
 * Generate video preview (first frame)
 */
/**
 * Performs generate video preview operation
 *
 * @param {File} file - The file
 * @param {number} [width] - The width
 * @param {number} [height] - The height
 *
 * @returns {Promise<any>} Promise resolving to generatevideopreview result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * generateVideoPreview(file, 123, 123);
 */

/**
 * Performs generate video preview operation
 *
 * @returns {Promise<any>} Promise resolving to generatevideopreview result
 *
 * @throws {Error} When operation fails or validation errors occur
 *
 * @example
 * generateVideoPreview();
 */

export async function generateVideoPreview(
  /** File */
  file: File,
  /** Width */
  width: number = 640,
  /** Height */
  height: number = 360,
): Promise<string> {
  return extractVideoThumbnail(file, 0, { width, height });
}

/**
 * Create video thumbnail from blob URL
 */
/**
 * Creates a new thumbnail from blob
 *
 * @returns {string} The thumbnailfromblob result
 *
 * @example
 * createThumbnailFromBlob();
 */

/**
 * Creates a new thumbnail from blob
 *
 * @returns {string} The thumbnailfromblob result
 *
 * @example
 * createThumbnailFromBlob();
 */

export function createThumbnailFromBlob(
  /** Blob Url */
  blobUrl: string,
  /** Timestamp */
  timestamp: number = 0,
  /** Width */
  width: number = 320,
  /** Height */
  height: number = 180,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";

    video.onloadedmetadata = () => {
      video.currentTime = Math.min(timestamp, video.duration);
    };

    video.onseeked = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.8);

        resolve(dataUrl);
      } catch (error) {
        reject(error);
      }
    };

    video.onerror = () => {
      reject(new Error("Failed to load video"));
    };

    video.src = blobUrl;
  });
}
