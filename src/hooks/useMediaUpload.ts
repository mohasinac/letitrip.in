"use client";

import { useApiMutation } from "@/hooks";
import { mediaService } from "@/services";

/**
 * useMediaUpload
 * Wraps `mediaService.upload()` as a `useApiMutation` for ImageUpload component.
 */
export function useMediaUpload() {
  return useApiMutation<{ url: string }, FormData>({
    mutationFn: (formData) => mediaService.upload<{ url: string }>(formData),
  });
}
