/**
 * Media Service
 * Pure async functions for media upload/crop/trim API calls.
 * Import via `@/services` barrel — NEVER call apiClient directly in components.
 */

import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";

export const mediaService = {
  /** Upload a file to Cloud Storage */
  upload: <T = { url: string }>(formData: FormData) =>
    apiClient.upload<T>(API_ENDPOINTS.MEDIA.UPLOAD, formData),

  /** Crop an image */
  crop: (data: unknown) => apiClient.post(API_ENDPOINTS.MEDIA.CROP, data),

  /** Trim a video */
  trim: (data: unknown) => apiClient.post(API_ENDPOINTS.MEDIA.TRIM, data),
};
