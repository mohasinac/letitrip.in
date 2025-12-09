/**
 * Unit Tests for useMediaUploadWithCleanup Hook
 *
 * Tests comprehensive media upload functionality with cleanup capabilities.
 * Covers edge cases, error handling, and navigation guard integration.
 */

import { logError } from "@/lib/firebase-error-logger";
import { mediaService } from "@/services/media.service";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useMediaUploadWithCleanup } from "../useMediaUploadWithCleanup";
import { useNavigationGuard } from "../useNavigationGuard";

// Mock dependencies
jest.mock("@/services/media.service");
jest.mock("@/lib/firebase-error-logger");
jest.mock("../useNavigationGuard");

const mockMediaService = mediaService as jest.Mocked<typeof mediaService>;
const mockLogError = logError as jest.MockedFunction<typeof logError>;
const mockUseNavigationGuard = useNavigationGuard as jest.MockedFunction<
  typeof useNavigationGuard
>;

describe("useMediaUploadWithCleanup", () => {
  const mockFile = new File(["test"], "test.jpg", { type: "image/jpeg" });
  const mockFile2 = new File(["test2"], "test2.jpg", { type: "image/jpeg" });
  const mockUploadResult = {
    url: "https://example.com/test.jpg",
    id: "test-id-123",
    path: "uploads/test.jpg",
    metadata: {
      size: 1024,
      contentType: "image/jpeg",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigationGuard.mockReturnValue({
      confirmNavigation: jest.fn(),
      clearNavigationBlock: jest.fn(),
    });
  });

  describe("Basic Upload Functionality", () => {
    it("should upload single media file successfully", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      let uploadedUrl: string = "";

      await act(async () => {
        uploadedUrl = await result.current.uploadMedia(
          mockFile,
          "product",
          "prod-123"
        );
      });

      expect(uploadedUrl).toBe(mockUploadResult.url);
      expect(mockMediaService.upload).toHaveBeenCalledWith({
        file: mockFile,
        context: "product",
        contextId: "prod-123",
      });
      expect(result.current.uploadedMedia).toHaveLength(1);
      expect(result.current.uploadedMedia[0]).toMatchObject({
        url: mockUploadResult.url,
        id: mockUploadResult.id,
        file: mockFile,
      });
      expect(result.current.hasUploadedMedia).toBe(true);
    });

    it("should upload multiple media files successfully", async () => {
      const mockResult2 = {
        ...mockUploadResult,
        url: "https://example.com/test2.jpg",
        id: "test-id-456",
      };

      mockMediaService.upload
        .mockResolvedValueOnce(mockUploadResult)
        .mockResolvedValueOnce(mockResult2);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      let uploadedUrls: string[] = [];

      await act(async () => {
        uploadedUrls = await result.current.uploadMultipleMedia(
          [mockFile, mockFile2],
          "shop",
          "shop-123"
        );
      });

      expect(uploadedUrls).toEqual([mockUploadResult.url, mockResult2.url]);
      expect(mockMediaService.upload).toHaveBeenCalledTimes(2);
      expect(result.current.uploadedMedia).toHaveLength(2);
      expect(result.current.hasUploadedMedia).toBe(true);
    });

    it("should track uploaded media correctly", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      const uploadedUrls = result.current.getUploadedUrls();
      expect(uploadedUrls).toEqual([mockUploadResult.url]);
    });

    it("should handle upload without contextId", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(mockFile, "avatar");
      });

      expect(mockMediaService.upload).toHaveBeenCalledWith({
        file: mockFile,
        context: "avatar",
        contextId: undefined,
      });
    });

    it("should handle all context types", async () => {
      mockMediaService.upload.mockResolvedValue(mockUploadResult);

      const contexts = [
        "product",
        "shop",
        "auction",
        "review",
        "return",
        "avatar",
        "category",
      ] as const;

      for (const context of contexts) {
        const { result } = renderHook(() => useMediaUploadWithCleanup());

        await act(async () => {
          await result.current.uploadMedia(mockFile, context);
        });

        expect(mockMediaService.upload).toHaveBeenCalledWith(
          expect.objectContaining({ context })
        );
      }
    });
  });

  describe("Upload State Management", () => {
    it("should set isUploading to true during upload", async () => {
      let resolveUpload: (value: any) => void;
      const uploadPromise = new Promise((resolve) => {
        resolveUpload = resolve;
      });

      mockMediaService.upload.mockReturnValue(uploadPromise as any);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      act(() => {
        result.current.uploadMedia(mockFile, "product");
      });

      await waitFor(() => {
        expect(result.current.isUploading).toBe(true);
      });

      await act(async () => {
        resolveUpload!(mockUploadResult);
        await uploadPromise;
      });

      expect(result.current.isUploading).toBe(false);
    });

    it("should set isUploading to false after upload completes", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      expect(result.current.isUploading).toBe(false);
    });

    it("should set isUploading to false after upload fails", async () => {
      mockMediaService.upload.mockRejectedValueOnce(new Error("Upload failed"));

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        try {
          await result.current.uploadMedia(mockFile, "product");
        } catch (error) {
          // Expected error
        }
      });

      expect(result.current.isUploading).toBe(false);
    });

    it("should handle concurrent uploads correctly", async () => {
      const mockResult2 = {
        ...mockUploadResult,
        url: "https://example.com/test2.jpg",
        id: "test-id-456",
      };

      mockMediaService.upload
        .mockResolvedValueOnce(mockUploadResult)
        .mockResolvedValueOnce(mockResult2);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await Promise.all([
          result.current.uploadMedia(mockFile, "product"),
          result.current.uploadMedia(mockFile2, "product"),
        ]);
      });

      expect(result.current.uploadedMedia).toHaveLength(2);
    });
  });

  describe("Error Handling", () => {
    it("should handle upload error with Error instance", async () => {
      const uploadError = new Error("Network error");
      mockMediaService.upload.mockRejectedValueOnce(uploadError);

      const onUploadError = jest.fn();
      const { result } = renderHook(() =>
        useMediaUploadWithCleanup({ onUploadError })
      );

      await act(async () => {
        try {
          await result.current.uploadMedia(mockFile, "product");
        } catch (error) {
          expect(error).toBe(uploadError);
        }
      });

      expect(onUploadError).toHaveBeenCalledWith("Network error");
      expect(result.current.uploadedMedia).toHaveLength(0);
    });

    it("should handle upload error with non-Error object", async () => {
      mockMediaService.upload.mockRejectedValueOnce("String error");

      const onUploadError = jest.fn();
      const { result } = renderHook(() =>
        useMediaUploadWithCleanup({ onUploadError })
      );

      await act(async () => {
        try {
          await result.current.uploadMedia(mockFile, "product");
        } catch (error) {
          // Expected error
        }
      });

      expect(onUploadError).toHaveBeenCalledWith("Upload failed");
    });

    it("should handle partial failure in multiple uploads", async () => {
      mockMediaService.upload
        .mockResolvedValueOnce(mockUploadResult)
        .mockRejectedValueOnce(new Error("Second upload failed"));

      const onUploadError = jest.fn();
      const { result } = renderHook(() =>
        useMediaUploadWithCleanup({ onUploadError })
      );

      await act(async () => {
        try {
          await result.current.uploadMultipleMedia(
            [mockFile, mockFile2],
            "product"
          );
        } catch (error) {
          // Expected error
        }
      });

      expect(onUploadError).toHaveBeenCalledWith("Second upload failed");
      // No media should be tracked on failure
      expect(result.current.uploadedMedia).toHaveLength(0);
    });
  });

  describe("Cleanup Functionality", () => {
    it("should cleanup all uploaded media", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);
      mockMediaService.deleteByUrl.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      expect(result.current.uploadedMedia).toHaveLength(1);

      await act(async () => {
        await result.current.cleanupUploadedMedia();
      });

      expect(mockMediaService.deleteByUrl).toHaveBeenCalledWith(
        mockUploadResult.url
      );
      expect(result.current.uploadedMedia).toHaveLength(0);
      expect(result.current.hasUploadedMedia).toBe(false);
    });

    it("should cleanup multiple uploaded media", async () => {
      const mockResult2 = {
        ...mockUploadResult,
        url: "https://example.com/test2.jpg",
        id: "test-id-456",
      };

      mockMediaService.upload
        .mockResolvedValueOnce(mockUploadResult)
        .mockResolvedValueOnce(mockResult2);
      mockMediaService.deleteByUrl.mockResolvedValue(undefined);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMultipleMedia(
          [mockFile, mockFile2],
          "product"
        );
      });

      await act(async () => {
        await result.current.cleanupUploadedMedia();
      });

      expect(mockMediaService.deleteByUrl).toHaveBeenCalledTimes(2);
      expect(mockMediaService.deleteByUrl).toHaveBeenCalledWith(
        mockUploadResult.url
      );
      expect(mockMediaService.deleteByUrl).toHaveBeenCalledWith(
        mockResult2.url
      );
      expect(result.current.uploadedMedia).toHaveLength(0);
    });

    it("should handle cleanup with no uploaded media", async () => {
      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.cleanupUploadedMedia();
      });

      expect(mockMediaService.deleteByUrl).not.toHaveBeenCalled();
    });

    it("should set isCleaning state during cleanup", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      let resolveDelete: () => void;
      const deletePromise = new Promise<void>((resolve) => {
        resolveDelete = resolve;
      });
      mockMediaService.deleteByUrl.mockReturnValue(deletePromise);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      act(() => {
        result.current.cleanupUploadedMedia();
      });

      await waitFor(() => {
        expect(result.current.isCleaning).toBe(true);
      });

      await act(async () => {
        resolveDelete!();
        await deletePromise;
      });

      expect(result.current.isCleaning).toBe(false);
    });

    it("should handle cleanup errors gracefully", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);
      mockMediaService.deleteByUrl.mockRejectedValueOnce(
        new Error("Delete failed")
      );

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      await act(async () => {
        await result.current.cleanupUploadedMedia();
      });

      expect(mockLogError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: "useMediaUploadWithCleanup.cleanup",
          metadata: { url: mockUploadResult.url },
        })
      );
      // Should still clear the tracked media
      expect(result.current.uploadedMedia).toHaveLength(0);
    });

    it("should continue cleanup even if one deletion fails", async () => {
      const mockResult2 = {
        ...mockUploadResult,
        url: "https://example.com/test2.jpg",
        id: "test-id-456",
      };

      mockMediaService.upload
        .mockResolvedValueOnce(mockUploadResult)
        .mockResolvedValueOnce(mockResult2);
      mockMediaService.deleteByUrl
        .mockRejectedValueOnce(new Error("Delete failed"))
        .mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMultipleMedia(
          [mockFile, mockFile2],
          "product"
        );
      });

      await act(async () => {
        await result.current.cleanupUploadedMedia();
      });

      expect(mockMediaService.deleteByUrl).toHaveBeenCalledTimes(2);
      expect(result.current.uploadedMedia).toHaveLength(0);
    });
  });

  describe("Tracking Management", () => {
    it("should remove specific media from tracking", async () => {
      const mockResult2 = {
        ...mockUploadResult,
        url: "https://example.com/test2.jpg",
        id: "test-id-456",
      };

      mockMediaService.upload
        .mockResolvedValueOnce(mockUploadResult)
        .mockResolvedValueOnce(mockResult2);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMultipleMedia(
          [mockFile, mockFile2],
          "product"
        );
      });

      expect(result.current.uploadedMedia).toHaveLength(2);

      act(() => {
        result.current.removeFromTracking(mockUploadResult.url);
      });

      expect(result.current.uploadedMedia).toHaveLength(1);
      expect(result.current.uploadedMedia[0].url).toBe(mockResult2.url);
    });

    it("should clear all tracking without deleting files", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      act(() => {
        result.current.clearTracking();
      });

      expect(result.current.uploadedMedia).toHaveLength(0);
      expect(mockMediaService.deleteByUrl).not.toHaveBeenCalled();
    });

    it("should get uploaded URLs correctly", async () => {
      const mockResult2 = {
        ...mockUploadResult,
        url: "https://example.com/test2.jpg",
        id: "test-id-456",
      };

      mockMediaService.upload
        .mockResolvedValueOnce(mockUploadResult)
        .mockResolvedValueOnce(mockResult2);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMultipleMedia(
          [mockFile, mockFile2],
          "product"
        );
      });

      const urls = result.current.getUploadedUrls();
      expect(urls).toEqual([mockUploadResult.url, mockResult2.url]);
    });
  });

  describe("Callbacks", () => {
    it("should call onUploadSuccess callback", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const onUploadSuccess = jest.fn();
      const { result } = renderHook(() =>
        useMediaUploadWithCleanup({ onUploadSuccess })
      );

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      expect(onUploadSuccess).toHaveBeenCalledWith(mockUploadResult.url);
    });

    it("should call onUploadSuccess for each file in multiple upload", async () => {
      const mockResult2 = {
        ...mockUploadResult,
        url: "https://example.com/test2.jpg",
        id: "test-id-456",
      };

      mockMediaService.upload
        .mockResolvedValueOnce(mockUploadResult)
        .mockResolvedValueOnce(mockResult2);

      const onUploadSuccess = jest.fn();
      const { result } = renderHook(() =>
        useMediaUploadWithCleanup({ onUploadSuccess })
      );

      await act(async () => {
        await result.current.uploadMultipleMedia(
          [mockFile, mockFile2],
          "product"
        );
      });

      expect(onUploadSuccess).toHaveBeenCalledTimes(2);
      expect(onUploadSuccess).toHaveBeenCalledWith(mockUploadResult.url);
      expect(onUploadSuccess).toHaveBeenCalledWith(mockResult2.url);
    });

    it("should call onCleanupComplete callback", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);
      mockMediaService.deleteByUrl.mockResolvedValueOnce(undefined);

      const onCleanupComplete = jest.fn();
      const { result } = renderHook(() =>
        useMediaUploadWithCleanup({ onCleanupComplete })
      );

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      await act(async () => {
        await result.current.cleanupUploadedMedia();
      });

      expect(onCleanupComplete).toHaveBeenCalledTimes(1);
    });
  });

  describe("Navigation Guard Integration", () => {
    it("should enable navigation guard when media is uploaded", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const { result } = renderHook(() =>
        useMediaUploadWithCleanup({ enableNavigationGuard: true })
      );

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      expect(mockUseNavigationGuard).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
        })
      );
    });

    it("should disable navigation guard when no media is uploaded", () => {
      renderHook(() =>
        useMediaUploadWithCleanup({ enableNavigationGuard: true })
      );

      expect(mockUseNavigationGuard).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it("should use custom navigation guard message", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const customMessage = "Custom warning message";
      const { result } = renderHook(() =>
        useMediaUploadWithCleanup({
          enableNavigationGuard: true,
          navigationGuardMessage: customMessage,
        })
      );

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      expect(mockUseNavigationGuard).toHaveBeenCalledWith(
        expect.objectContaining({
          message: customMessage,
        })
      );
    });

    it("should disable navigation guard when explicitly disabled", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const { result } = renderHook(() =>
        useMediaUploadWithCleanup({ enableNavigationGuard: false })
      );

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      expect(mockUseNavigationGuard).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
        })
      );
    });

    it("should cleanup media when navigation is confirmed", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);
      mockMediaService.deleteByUrl.mockResolvedValueOnce(undefined);

      let onNavigateCallback: (() => Promise<void>) | undefined;
      mockUseNavigationGuard.mockImplementation((options: any) => {
        onNavigateCallback = options.onNavigate;
        return {
          confirmNavigation: jest.fn(),
          clearNavigationBlock: jest.fn(),
        };
      });

      const { result } = renderHook(() =>
        useMediaUploadWithCleanup({ enableNavigationGuard: true })
      );

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      expect(onNavigateCallback).toBeDefined();

      await act(async () => {
        await onNavigateCallback!();
      });

      expect(mockMediaService.deleteByUrl).toHaveBeenCalledWith(
        mockUploadResult.url
      );
      expect(result.current.uploadedMedia).toHaveLength(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty file array in multiple upload", async () => {
      const { result } = renderHook(() => useMediaUploadWithCleanup());

      let uploadedUrls: string[] = [];

      await act(async () => {
        uploadedUrls = await result.current.uploadMultipleMedia([], "product");
      });

      expect(uploadedUrls).toEqual([]);
      expect(mockMediaService.upload).not.toHaveBeenCalled();
    });

    it("should handle rapid successive uploads", async () => {
      mockMediaService.upload.mockResolvedValue(mockUploadResult);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
        await result.current.uploadMedia(mockFile, "product");
        await result.current.uploadMedia(mockFile, "product");
      });

      expect(result.current.uploadedMedia).toHaveLength(3);
    });

    it("should handle cleanup being called multiple times", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);
      mockMediaService.deleteByUrl.mockResolvedValue(undefined);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      await act(async () => {
        await result.current.cleanupUploadedMedia();
        await result.current.cleanupUploadedMedia();
      });

      // Should only delete once
      expect(mockMediaService.deleteByUrl).toHaveBeenCalledTimes(1);
    });

    it("should maintain uploaded media reference across re-renders", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const { result, rerender } = renderHook(() =>
        useMediaUploadWithCleanup()
      );

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      rerender();

      expect(result.current.uploadedMedia).toHaveLength(1);
      expect(result.current.hasUploadedMedia).toBe(true);
    });

    it("should handle large file uploads", async () => {
      const largeFile = new File(
        [new ArrayBuffer(10 * 1024 * 1024)],
        "large.jpg",
        {
          type: "image/jpeg",
        }
      );

      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(largeFile, "product");
      });

      expect(mockMediaService.upload).toHaveBeenCalledWith(
        expect.objectContaining({ file: largeFile })
      );
    });

    it("should handle special characters in file names", async () => {
      const specialFile = new File(
        ["test"],
        "file with spaces & special!@#.jpg",
        {
          type: "image/jpeg",
        }
      );

      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(specialFile, "product");
      });

      expect(result.current.uploadedMedia[0].file.name).toBe(
        "file with spaces & special!@#.jpg"
      );
    });

    it("should handle uploads with very long context IDs", async () => {
      const longContextId = "a".repeat(1000);
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product", longContextId);
      });

      expect(mockMediaService.upload).toHaveBeenCalledWith(
        expect.objectContaining({ contextId: longContextId })
      );
    });
  });

  describe("Memory Management", () => {
    it("should properly clear uploadedMediaRef on cleanup", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);
      mockMediaService.deleteByUrl.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      await act(async () => {
        await result.current.cleanupUploadedMedia();
      });

      // Verify ref is cleared by uploading again
      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      expect(result.current.uploadedMedia).toHaveLength(1);
    });

    it("should properly clear uploadedMediaRef on clearTracking", async () => {
      mockMediaService.upload.mockResolvedValueOnce(mockUploadResult);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
      });

      act(() => {
        result.current.clearTracking();
      });

      expect(result.current.uploadedMedia).toHaveLength(0);
      expect(result.current.hasUploadedMedia).toBe(false);
    });
  });

  describe("Type Safety", () => {
    it("should accept all valid context types", async () => {
      mockMediaService.upload.mockResolvedValue(mockUploadResult);

      const { result } = renderHook(() => useMediaUploadWithCleanup());

      // TypeScript should not complain about these
      await act(async () => {
        await result.current.uploadMedia(mockFile, "product");
        await result.current.uploadMedia(mockFile, "shop");
        await result.current.uploadMedia(mockFile, "auction");
        await result.current.uploadMedia(mockFile, "review");
        await result.current.uploadMedia(mockFile, "return");
        await result.current.uploadMedia(mockFile, "avatar");
        await result.current.uploadMedia(mockFile, "category");
      });

      expect(mockMediaService.upload).toHaveBeenCalledTimes(7);
    });
  });
});
