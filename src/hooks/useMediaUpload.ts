"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";
import type { MediaFilenameContext } from "@/utils";

/**
 * useMediaUpload
 * Wraps `mediaService.upload()` as a `useApiMutation`.
 *
 * Use `upload(file, folder?, isPublic?, context?)` as the `onUpload` prop for
 * `<ImageUpload>` and `<MediaUploadField>`.  Pass a `MediaFilenameContext` to
 * get an SEO-friendly filename like `product-iphone-15-pro-image-1.webp`.
 */
export function useMediaUpload() {
  const mutation = useMutation<{ url: string }, Error, FormData>({
    mutationFn: (formData) =>
      apiClient.upload<{ url: string }>(API_ENDPOINTS.MEDIA.UPLOAD, formData),
  });

  const upload = async (
    file: File,
    folder = "uploads",
    isPublic = true,
    context?: MediaFilenameContext,
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("public", isPublic.toString());
    if (context) {
      formData.append("context", JSON.stringify(context));
    }
    const data = await mutation.mutateAsync(formData);
    return data!.url;
  };

  return { ...mutation, upload };
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
