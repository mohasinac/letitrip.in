/**
 * useMediaUpload Hook Tests
 */

import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useMediaUpload } from "../useMediaUpload";
import { MockUploadService } from "../../adapters/examples";

describe("useMediaUpload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Initialization", () => {
    it("initializes with default state", () => {
      const uploadService = new MockUploadService();
      const { result } = renderHook(() => useMediaUpload({ uploadService }));

      expect(result.current.isUploading).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.uploadedUrl).toBeNull();
      expect(result.current.uploadId).toBeNull();
    });
  });

  describe("File Upload", () => {
    it("uploads file successfully", async () => {
      const uploadService = new MockUploadService();
      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useMediaUpload({ uploadService, onSuccess })
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      let url: string = "";
      await act(async () => {
        url = await result.current.upload(file);
      });

      expect(url).toContain("mock-url");
      expect(onSuccess).toHaveBeenCalledWith(url);
      expect(result.current.uploadedUrl).toBe(url);
    });

    it("validates file size", async () => {
      const uploadService = new MockUploadService();
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useMediaUpload({
          uploadService,
          maxSize: 1 * 1024 * 1024, // 1MB
          onError,
        })
      );

      // Create 2MB file
      const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      await act(async () => {
        try {
          await result.current.upload(largeFile);
        } catch (error) {
          // Expected
        }
      });

      expect(onError).toHaveBeenCalledWith(expect.stringContaining("size"));
      expect(result.current.error).toContain("size");
    });

    it("validates file type", async () => {
      const uploadService = new MockUploadService();
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useMediaUpload({
          uploadService,
          allowedTypes: ["image/jpeg", "image/png"],
          onError,
        })
      );

      const invalidFile = new File(["test"], "test.txt", { type: "text/plain" });

      await act(async () => {
        try {
          await result.current.upload(invalidFile);
        } catch (error) {
          // Expected
        }
      });

      expect(onError).toHaveBeenCalledWith(expect.stringContaining("type"));
      expect(result.current.error).toContain("type");
    });

    it("tracks upload progress", async () => {
      const uploadService = new MockUploadService(500); // 500ms delay
      const onProgress = vi.fn();
      const { result } = renderHook(() =>
        useMediaUpload({ uploadService, onProgress })
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.upload(file);
      });

      await waitFor(() => {
        expect(result.current.isUploading).toBe(true);
      });

      await waitFor(
        () => {
          expect(result.current.isUploading).toBe(false);
        },
        { timeout: 1000 }
      );

      expect(result.current.progress).toBe(100);
    });

    it("handles upload errors", async () => {
      const uploadService = new MockUploadService(0, true); // Fail immediately
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useMediaUpload({ uploadService, onError })
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        try {
          await result.current.upload(file);
        } catch (error) {
          // Expected
        }
      });

      expect(onError).toHaveBeenCalled();
      expect(result.current.error).toBeTruthy();
    });
  });

  describe("Retry Logic", () => {
    it("retries failed uploads", async () => {
      let attemptCount = 0;
      const flaky UploadService = {
        upload: vi.fn().mockImplementation(async () => {
          attemptCount++;
          if (attemptCount < 2) {
            throw new Error("Upload failed");
          }
          return "mock-url";
        }),
      };

      const { result } = renderHook(() =>
        useMediaUpload({ uploadService: flakyUploadService as any, maxRetries: 3 })
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        await result.current.upload(file);
      });

      expect(attemptCount).toBe(2);
      expect(result.current.uploadedUrl).toBe("mock-url");
    });

    it("fails after max retries", async () => {
      const failingUploadService = new MockUploadService(0, true);
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useMediaUpload({ uploadService: failingUploadService, maxRetries: 2, onError })
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        try {
          await result.current.upload(file);
        } catch (error) {
          // Expected
        }
      });

      expect(onError).toHaveBeenCalled();
      expect(result.current.error).toBeTruthy();
    });

    it("provides retry function", async () => {
      const uploadService = new MockUploadService(0, true);
      const { result } = renderHook(() => useMediaUpload({ uploadService }));

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        try {
          await result.current.upload(file);
        } catch (error) {
          // Expected
        }
      });

      expect(result.current.error).toBeTruthy();

      // Mock success on retry
      const successfulService = new MockUploadService();
      (result.current as any).uploadService = successfulService;

      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.uploadedUrl).toBeTruthy();
    });
  });

  describe("Cancel Functionality", () => {
    it("cancels ongoing upload", async () => {
      const uploadService = new MockUploadService(1000);
      const { result } = renderHook(() => useMediaUpload({ uploadService }));

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.upload(file);
      });

      await waitFor(() => {
        expect(result.current.isUploading).toBe(true);
      });

      act(() => {
        result.current.cancel();
      });

      await waitFor(() => {
        expect(result.current.isUploading).toBe(false);
      });

      expect(result.current.error).toContain("cancel");
    });
  });

  describe("Reset Functionality", () => {
    it("resets hook state", async () => {
      const uploadService = new MockUploadService();
      const { result } = renderHook(() => useMediaUpload({ uploadService }));

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        await result.current.upload(file);
      });

      expect(result.current.uploadedUrl).toBeTruthy();

      act(() => {
        result.current.reset();
      });

      expect(result.current.isUploading).toBe(false);
      expect(result.current.progress).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.uploadedUrl).toBeNull();
    });
  });

  describe("Metadata Support", () => {
    it("passes context and contextId to upload service", async () => {
      const uploadService = {
        upload: vi.fn().mockResolvedValue("mock-url"),
      };

      const { result } = renderHook(() =>
        useMediaUpload({
          uploadService: uploadService as any,
          context: "product",
          contextId: "prod-123",
        })
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        await result.current.upload(file);
      });

      expect(uploadService.upload).toHaveBeenCalledWith(
        file,
        expect.objectContaining({
          context: "product",
          contextId: "prod-123",
        })
      );
    });

    it("supports auto-delete metadata", async () => {
      const uploadService = {
        upload: vi.fn().mockResolvedValue("mock-url"),
      };

      const { result } = renderHook(() =>
        useMediaUpload({
          uploadService: uploadService as any,
          autoDelete: true,
        })
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        await result.current.upload(file);
      });

      expect(uploadService.upload).toHaveBeenCalledWith(
        file,
        expect.objectContaining({
          autoDelete: true,
        })
      );
    });
  });

  describe("Custom Path Patterns", () => {
    it("supports custom upload paths", async () => {
      const uploadService = {
        upload: vi.fn().mockResolvedValue("mock-url"),
      };

      const { result } = renderHook(() =>
        useMediaUpload({
          uploadService: uploadService as any,
          pathPattern: "products/{contextId}/{filename}",
          contextId: "prod-123",
        })
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        await result.current.upload(file);
      });

      expect(uploadService.upload).toHaveBeenCalledWith(
        file,
        expect.objectContaining({
          pathPattern: "products/{contextId}/{filename}",
        })
      );
    });
  });

  describe("Concurrent Uploads", () => {
    it("handles multiple sequential uploads", async () => {
      const uploadService = new MockUploadService(100);
      const { result } = renderHook(() => useMediaUpload({ uploadService }));

      const file1 = new File(["test1"], "test1.jpg", { type: "image/jpeg" });
      const file2 = new File(["test2"], "test2.jpg", { type: "image/jpeg" });

      await act(async () => {
        await result.current.upload(file1);
      });

      const url1 = result.current.uploadedUrl;

      await act(async () => {
        await result.current.upload(file2);
      });

      const url2 = result.current.uploadedUrl;

      expect(url1).toBeTruthy();
      expect(url2).toBeTruthy();
      expect(url1).not.toBe(url2);
    });
  });

  describe("Edge Cases", () => {
    it("handles empty file", async () => {
      const uploadService = new MockUploadService();
      const onError = vi.fn();
      const { result } = renderHook(() =>
        useMediaUpload({ uploadService, onError })
      );

      const emptyFile = new File([], "empty.jpg", { type: "image/jpeg" });

      await act(async () => {
        try {
          await result.current.upload(emptyFile);
        } catch (error) {
          // Expected
        }
      });

      expect(onError).toHaveBeenCalledWith(expect.stringContaining("size"));
    });

    it("handles file without extension", async () => {
      const uploadService = new MockUploadService();
      const { result } = renderHook(() => useMediaUpload({ uploadService }));

      const file = new File(["test"], "testfile", { type: "image/jpeg" });

      await act(async () => {
        await result.current.upload(file);
      });

      expect(result.current.uploadedUrl).toBeTruthy();
    });
  });
});
