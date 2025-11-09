/**
 * useMediaUploadWithCleanup Hook
 *
 * Hook for media uploads with automatic cleanup on resource creation failure.
 * Tracks uploaded media URLs and provides cleanup functionality if the parent
 * resource (product, shop, hero slide, etc.) fails to create.
 *
 * Also prevents navigation when unsaved media exists.
 */

import { useState, useCallback, useRef } from "react";
import { mediaService } from "@/services/media.service";
import { useNavigationGuard } from "./useNavigationGuard";

export interface UploadedMedia {
  url: string;
  id: string;
  file: File;
  uploadedAt: Date;
}

export interface MediaUploadWithCleanupOptions {
  onUploadSuccess?: (url: string) => void;
  onUploadError?: (error: string) => void;
  onCleanupComplete?: () => void;
  /**
   * Enable navigation guard to prevent leaving page with unsaved media
   * Default: true
   */
  enableNavigationGuard?: boolean;
  /**
   * Custom message for navigation guard
   */
  navigationGuardMessage?: string;
}

export function useMediaUploadWithCleanup(
  options: MediaUploadWithCleanupOptions = {},
) {
  const {
    onUploadSuccess,
    onUploadError,
    onCleanupComplete,
    enableNavigationGuard = true,
    navigationGuardMessage = "You have uploaded media that will be deleted if you leave. Are you sure you want to leave?",
  } = options;

  const [uploadedMedia, setUploadedMedia] = useState<UploadedMedia[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isCleaning, setIsCleaning] = useState(false);
  const uploadedMediaRef = useRef<UploadedMedia[]>([]);

  // Update ref whenever state changes
  uploadedMediaRef.current = uploadedMedia;

  /**
   * Upload a single media file and track it
   */
  const uploadMedia = useCallback(
    async (
      file: File,
      context:
        | "product"
        | "shop"
        | "auction"
        | "review"
        | "return"
        | "avatar"
        | "category",
      contextId?: string,
    ): Promise<string> => {
      setIsUploading(true);

      try {
        const result = await mediaService.upload({
          file,
          context,
          contextId,
        });

        const mediaItem: UploadedMedia = {
          url: result.url,
          id: result.id,
          file,
          uploadedAt: new Date(),
        };

        setUploadedMedia((prev) => [...prev, mediaItem]);
        onUploadSuccess?.(result.url);

        return result.url;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        onUploadError?.(errorMessage);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadSuccess, onUploadError],
  );

  /**
   * Upload multiple media files and track them
   */
  const uploadMultipleMedia = useCallback(
    async (
      files: File[],
      context:
        | "product"
        | "shop"
        | "auction"
        | "review"
        | "return"
        | "avatar"
        | "category",
      contextId?: string,
    ): Promise<string[]> => {
      setIsUploading(true);

      try {
        const uploadPromises = files.map((file) =>
          mediaService.upload({ file, context, contextId }),
        );

        const results = await Promise.all(uploadPromises);

        const mediaItems: UploadedMedia[] = results.map((result, index) => ({
          url: result.url,
          id: result.id,
          file: files[index],
          uploadedAt: new Date(),
        }));

        setUploadedMedia((prev) => [...prev, ...mediaItems]);

        results.forEach((result) => {
          onUploadSuccess?.(result.url);
        });

        return results.map((r) => r.url);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Upload failed";
        onUploadError?.(errorMessage);
        throw error;
      } finally {
        setIsUploading(false);
      }
    },
    [onUploadSuccess, onUploadError],
  );

  /**
   * Clean up all uploaded media (call this if resource creation fails)
   */
  const cleanupUploadedMedia = useCallback(async (): Promise<void> => {
    const mediaToCleanup = uploadedMediaRef.current;

    if (mediaToCleanup.length === 0) {
      return;
    }

    setIsCleaning(true);

    try {
      // Delete all uploaded files from Firebase Storage
      const deletePromises = mediaToCleanup.map((media) =>
        mediaService.deleteByUrl(media.url).catch((error) => {
          console.error(`Failed to delete ${media.url}:`, error);
          // Don't throw, continue with other deletions
        }),
      );

      await Promise.allSettled(deletePromises);

      // Clear the tracked media
      setUploadedMedia([]);
      uploadedMediaRef.current = [];

      onCleanupComplete?.();
    } catch (error) {
      console.error("Cleanup error:", error);
    } finally {
      setIsCleaning(false);
    }
  }, [onCleanupComplete]);

  /**
   * Remove a specific media from tracking (use this after successful resource creation)
   */
  const removeFromTracking = useCallback((url: string) => {
    setUploadedMedia((prev) => prev.filter((m) => m.url !== url));
  }, []);

  /**
   * Clear all tracking without deleting files (use after successful resource creation)
   */
  const clearTracking = useCallback(() => {
    setUploadedMedia([]);
    uploadedMediaRef.current = [];
  }, []);

  /**
   * Get URLs of all uploaded media
   */
  const getUploadedUrls = useCallback((): string[] => {
    return uploadedMedia.map((m) => m.url);
  }, [uploadedMedia]);

  /**
   * Check if any media has been uploaded
   */
  const hasUploadedMedia = uploadedMedia.length > 0;

  /**
   * Navigation guard integration
   */
  const { confirmNavigation } = useNavigationGuard({
    enabled: enableNavigationGuard && hasUploadedMedia,
    message: navigationGuardMessage,
    onNavigate: async () => {
      // Cleanup media when user confirms navigation
      await cleanupUploadedMedia();
    },
  });

  return {
    // Upload functions
    uploadMedia,
    uploadMultipleMedia,

    // Cleanup functions
    cleanupUploadedMedia,
    removeFromTracking,
    clearTracking,

    // State
    uploadedMedia,
    isUploading,
    isCleaning,
    hasUploadedMedia,

    // Utilities
    getUploadedUrls,

    // Navigation guard
    confirmNavigation,
  };
}
