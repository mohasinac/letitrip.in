"use client";

import { useMutation } from "@tanstack/react-query";
import { mediaService } from "@/services";

/**
 * useMediaUpload
 * Wraps `mediaService.upload()` as a `useApiMutation`.
 *
 * Use `upload(file, folder?)` as the `onUpload` prop for `<ImageUpload>` and
 * `<MediaUploadField>` — it builds FormData internally and returns the URL.
 */
export function useMediaUpload() {
  const mutation = useMutation<{ url: string }, Error, FormData>({
    mutationFn: (formData) => mediaService.upload<{ url: string }>(formData),
  });

  const upload = async (
    file: File,
    folder = "uploads",
    isPublic = true,
  ): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);
    formData.append("public", isPublic.toString());
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
    mutationFn: (data) => mediaService.crop(data),
  });
}

/**
 * useMediaTrim
 * Wraps `mediaService.trim()` as a `useApiMutation`.
 */
export function useMediaTrim<TResult = { url: string }>() {
  return useMutation<TResult, Error, unknown>({
    mutationFn: (data) => mediaService.trim(data),
  });
}
