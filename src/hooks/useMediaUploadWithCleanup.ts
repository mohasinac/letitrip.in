/**
 * @fileoverview TypeScript Module
 * @module src/hooks/useMediaUploadWithCleanup
 * @description This file contains functionality related to useMediaUploadWithCleanup
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
import { logError } from "@/lib/firebase-error-logger";
import { useNavigationGuard } from "./useNavigationGuard";

/**
 * UploadedMedia interface
 * 
 * @interface
 * @description Defines the structure and contract for UploadedMedia
 */
export interface UploadedMedia {
  /** Url */
  url: string;
  /** Id */
  id: string;
  /** File */
  file: File;
  /** Uploaded At */
  uploadedAt: Date;
}

/**
 * MediaUploadWithCleanupOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for MediaUploadWithCleanupOptions
 */
export interface MediaUploadWithCleanupOptions {
  /** On Upload Success */
  onUploadSuccess?: (url: string) => void;
  /** On Upload Error */
  onUploadError?: (error: string) => void;
  /** On Cleanup Complete */
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

/**
 * Function: Use Media Upload With Cleanup
 */
/**
 * Custom React hook for media upload with cleanup
 *
 * @param {MediaUploadWithCleanupOptions} [options] - Configuration options
 *
 * @returns {any} The usemediauploadwithcleanup result
 *
 * @example
 * useMediaUploadWithCleanup(options);
 */

/**
 * Custom React hook for media upload with cleanup
 *
 * @param {MediaUploadWithCleanupOptions} [/** Options */
  options] - The /**  options */
  options
 *
 * @returns {any} The usemediauploadwithcleanup result
 *
 * @example
 * useMediaUploadWithCleanup(/** Options */
  options);
 */

export function useMediaUploadWithCleanup(
  /** Options */
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
      /** File */
      file: File,
      /** Context */
      context:
        | "product"
        | "shop"
        | "auction"
        | "review"
        | "return"
        | "avatar"
        | "category",
      /** Context Id */
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
          /** Url */
          url: result.url,
          /** Id */
          id: result.id,
          file,
          /** Uploaded At */
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
      /** Files */
      files: File[],
      /** Context */
      context:
        | "product"
        | "shop"
        | "auction"
        | "review"
        | "return"
        | "avatar"
        | "category",
      /** Context Id */
      contextId?: string,
    ): Promise<string[]> => {
      setIsUploading(true);

      try {
        const uploadPromises = files.map((file) =>
          mediaService.upload({ file, context, contextId }),
        );

        const results = await Promise.all(uploadPromises);

        const mediaItems: UploadedMedia[] = results.map((result, index) => ({
          /** Url */
          url: result.url,
          /** Id */
          id: result.id,
          /** File */
          file: files[index],
          /** Uploaded At */
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
        mediaService.deleteByUrl(media.url).catch((error: any) => {
          logError(error as Error, {
            /** Component */
            component: "useMediaUploadWithCleanup.cleanup",
            /** Metadata */
            metadata: { url: media.url },
          });
          // Don't throw, continue with other deletions
        }),
      );

      await Promise.allSettled(deletePromises);

      // Clear the tracked media
      setUploadedMedia([]);
      uploadedMediaRef.current = [];

      onCleanupComplete?.();
    } catch (error: any) {
      logError(error as Error, {
        /** Component */
        component: "useMediaUploadWithCleanup.cleanup.general",
      });
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
    /** Enabled */
    enabled: enableNavigationGuard && hasUploadedMedia,
    /** Message */
    message: navigationGuardMessage,
    /** On Navigate */
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
