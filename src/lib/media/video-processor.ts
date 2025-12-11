/**
 * Video Processing Utilities
 * Handles video thumbnail extraction and metadata
 */

import type { ThumbnailGenerationOptions, VideoThumbnail } from "@/types/media";

/**
 * Extract video thumbnail at specific timestamp
 */
export async function extractVideoThumbnail(
  file: File,
  timestamp: number = 0,
  options?: Partial<ThumbnailGenerationOptions>
): Promise<string> {
  const {
    width = 320,
    height = 180,
    quality = 0.8,
    format = "jpeg",
  } = options || {};

  // BUG FIX #29: Validate timestamp is non-negative
  if (timestamp < 0) {
    return Promise.reject(new Error("Timestamp must be non-negative"));
  }

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
export async function extractMultipleThumbnails(
  file: File,
  count: number = 5,
  options?: Partial<ThumbnailGenerationOptions>
): Promise<VideoThumbnail[]> {
  // BUG FIX #29: Validate count is positive
  if (count <= 0) {
    return Promise.reject(new Error("Count must be a positive number"));
  }

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
export async function getVideoMetadata(file: File): Promise<{
  duration: number;
  width: number;
  height: number;
  aspectRatio: number;
  size: number;
}> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.onloadedmetadata = () => {
      // BUG FIX #29: Prevent division by zero when video height is 0
      const aspectRatio =
        video.videoHeight > 0 ? video.videoWidth / video.videoHeight : 0;

      const metadata = {
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
        aspectRatio,
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
export async function generateVideoPreview(
  file: File,
  width: number = 640,
  height: number = 360
): Promise<string> {
  return extractVideoThumbnail(file, 0, { width, height });
}

/**
 * Create video thumbnail from blob URL
 */
export function createThumbnailFromBlob(
  blobUrl: string,
  timestamp: number = 0,
  width: number = 320,
  height: number = 180
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
