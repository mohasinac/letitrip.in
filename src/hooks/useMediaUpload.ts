"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import { API_ENDPOINTS } from "@/constants";
/**
 * useMediaAbort
 * Calls DELETE /api/media/delete?url=... for each staged (tmp) URL.
 * Wire to MediaUploadList / MediaUploadField onAbort props so
 * orphaned files are cleaned up when a form is cancelled without saving.
 */
export function useMediaAbort() {
  return async (stagedUrls: string[]): Promise<void> => {
    await Promise.allSettled(
      stagedUrls.map((url) =>
        apiClient.delete(
          `${API_ENDPOINTS.MEDIA.DELETE}?url=${encodeURIComponent(url)}`,
        ),
      ),
    );
  };
}

/**
 * useMediaCrop
 * Wraps `mediaService.crop()` as a `useApiMutation`.
 */
export function useMediaCrop<TResult = { url: string }>() {
  return useMutation<TResult, Error, unknown>({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.MEDIA.CROP, data),
  });
}

/**
 * useMediaTrim
 * Wraps `mediaService.trim()` as a `useApiMutation`.
 */
export function useMediaTrim<TResult = { url: string }>() {
  return useMutation<TResult, Error, unknown>({
    mutationFn: (data) => apiClient.post(API_ENDPOINTS.MEDIA.TRIM, data),
  });
}
