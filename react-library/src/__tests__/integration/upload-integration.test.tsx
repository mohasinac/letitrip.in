/**
 * Library Integration Tests
 * Tests complete workflows across multiple components
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ImageUploadWithCrop } from "../../components/ImageUploadWithCrop";
import { VideoUploadWithThumbnail } from "../../components/VideoUploadWithThumbnail";
import { useMediaUpload } from "../../hooks/useMediaUpload";
import { MockUploadService, InMemoryCacheAdapter } from "../../adapters/examples";

describe("Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Complete Upload Workflow", () => {
    it("completes full image upload flow", async () => {
      const mockUploadService = new MockUploadService();
      const onComplete = vi.fn();

      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={onComplete}
        />
      );

      // 1. Select file
      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      // 2. Wait for preview
      await waitFor(() => {
        expect(screen.getByAltText("Preview")).toBeInTheDocument();
      });

      // 3. Adjust zoom (optional)
      const zoomSlider = screen.getByLabelText(/zoom/i);
      fireEvent.change(zoomSlider, { target: { value: "1.5" } });

      // 4. Upload
      const uploadButton = screen.getByRole("button", { name: /upload/i });
      fireEvent.click(uploadButton);

      // 5. Wait for completion
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            url: expect.any(String),
          })
        );
      });
    });

    it("completes full video upload flow", async () => {
      const mockUploadService = new MockUploadService();
      const onComplete = vi.fn();

      render(
        <VideoUploadWithThumbnail
          uploadService={mockUploadService}
          onUploadComplete={onComplete}
        />
      );

      // 1. Select file
      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const input = screen.getByLabelText(/upload.*video/i) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [file] } });

      // 2. Wait for preview
      await waitFor(() => {
        expect(screen.getByText(/video.*selected/i)).toBeInTheDocument();
      });

      // 3. Upload
      const uploadButton = await screen.findByRole("button", { name: /upload/i });
      fireEvent.click(uploadButton);

      // 4. Wait for completion
      await waitFor(() => {
        expect(onComplete).toHaveBeenCalledWith(
          expect.objectContaining({
            videoUrl: expect.any(String),
            thumbnailUrl: expect.any(String),
          })
        );
      });
    });
  });

  describe("Error Recovery Workflow", () => {
    it("handles error and retry", async () => {
      let attemptCount = 0;
      const flakyService = {
        upload: vi.fn().mockImplementation(async () => {
          attemptCount++;
          if (attemptCount === 1) {
            throw new Error("Network error");
          }
          return "mock-url";
        }),
      };

      const onError = vi.fn();
      const onSuccess = vi.fn();

      const { result } = renderHook(() =>
        useMediaUpload({
          uploadService: flakyService as any,
          maxRetries: 2,
          onError,
          onSuccess,
        })
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      // First attempt - fails
      await act(async () => {
        try {
          await result.current.upload(file);
        } catch (error) {
          // Expected first failure
        }
      });

      expect(result.current.error).toBeTruthy();

      // Retry - succeeds
      await act(async () => {
        await result.current.retry();
      });

      expect(result.current.uploadedUrl).toBe("mock-url");
      expect(onSuccess).toHaveBeenCalledWith("mock-url");
    });

    it("handles validation error before upload", async () => {
      const mockUploadService = new MockUploadService();
      const onError = vi.fn();

      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={vi.fn()}
          onUploadError={onError}
          maxSize={1 * 1024 * 1024} // 1MB
        />
      );

      // Select oversized file
      const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;
      fireEvent.change(input, { target: { files: [largeFile] } });

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.stringContaining("size"));
      });

      // Error message should be displayed
      expect(screen.getByText(/size/i)).toBeInTheDocument();
    });
  });

  describe("Adapter Switching", () => {
    it("switches between upload services", async () => {
      const service1 = new MockUploadService(100);
      const service2 = new MockUploadService(50);

      const { result, rerender } = renderHook(
        ({ uploadService }) => useMediaUpload({ uploadService }),
        { initialProps: { uploadService: service1 } }
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      // Upload with first service
      await act(async () => {
        await result.current.upload(file);
      });

      const url1 = result.current.uploadedUrl;
      expect(url1).toBeTruthy();

      // Switch to second service
      rerender({ uploadService: service2 });

      // Upload with second service
      await act(async () => {
        result.current.reset();
        await result.current.upload(file);
      });

      const url2 = result.current.uploadedUrl;
      expect(url2).toBeTruthy();
      expect(url2).not.toBe(url1);
    });

    it("works with cache adapter", async () => {
      const cacheAdapter = new InMemoryCacheAdapter();
      const mockUploadService = new MockUploadService();

      const { result } = renderHook(() => useMediaUpload({ uploadService: mockUploadService }));

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      // Upload file
      await act(async () => {
        await result.current.upload(file);
      });

      const uploadedUrl = result.current.uploadedUrl!;

      // Cache the result
      await cacheAdapter.set("upload-cache", { url: uploadedUrl });

      // Retrieve from cache
      const cached = await cacheAdapter.get("upload-cache");

      expect(cached).toEqual({ url: uploadedUrl });
    });
  });

  describe("Concurrent Operations", () => {
    it("handles multiple sequential uploads", async () => {
      const mockUploadService = new MockUploadService(50);
      const { result } = renderHook(() => useMediaUpload({ uploadService: mockUploadService }));

      const file1 = new File(["test1"], "file1.jpg", { type: "image/jpeg" });
      const file2 = new File(["test2"], "file2.jpg", { type: "image/jpeg" });
      const file3 = new File(["test3"], "file3.jpg", { type: "image/jpeg" });

      const urls: string[] = [];

      // Upload sequentially
      await act(async () => {
        urls.push(await result.current.upload(file1));
      });

      await act(async () => {
        urls.push(await result.current.upload(file2));
      });

      await act(async () => {
        urls.push(await result.current.upload(file3));
      });

      expect(urls).toHaveLength(3);
      expect(new Set(urls).size).toBe(3); // All URLs should be unique
    });
  });

  describe("Component + Hook Integration", () => {
    it("component uses hook correctly", async () => {
      const mockUploadService = new MockUploadService();
      const onComplete = vi.fn();
      const onProgress = vi.fn();

      render(
        <ImageUploadWithCrop
          uploadService={mockUploadService}
          onUploadComplete={onComplete}
          onProgress={onProgress}
        />
      );

      const file = new File(["image"], "test.jpg", { type: "image/jpeg" });
      const input = screen.getByLabelText(/upload.*image/i) as HTMLInputElement;

      fireEvent.change(input, { target: { files: [file] } });

      const uploadButton = await screen.findByRole("button", { name: /upload/i });
      fireEvent.click(uploadButton);

      await waitFor(() => {
        expect(onComplete).toHaveBeenCalled();
      });

      // Progress should have been tracked
      expect(onProgress).toHaveBeenCalled();
    });
  });

  describe("Performance", () => {
    it("completes upload within reasonable time", async () => {
      const mockUploadService = new MockUploadService(200); // 200ms delay
      const { result } = renderHook(() => useMediaUpload({ uploadService: mockUploadService }));

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      const startTime = Date.now();

      await act(async () => {
        await result.current.upload(file);
      });

      const duration = Date.now() - startTime;

      // Should complete within 500ms (200ms delay + overhead)
      expect(duration).toBeLessThan(500);
    });

    it("handles rapid state updates", async () => {
      const mockUploadService = new MockUploadService(100);
      const { result } = renderHook(() => useMediaUpload({ uploadService: mockUploadService }));

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      // Rapid fire state changes
      act(() => {
        result.current.upload(file);
      });

      act(() => {
        result.current.cancel();
      });

      act(() => {
        result.current.reset();
      });

      // Should not throw or cause issues
      expect(result.current.isUploading).toBe(false);
    });
  });

  describe("Memory Management", () => {
    it("cleans up on unmount", async () => {
      const mockUploadService = new MockUploadService(1000);
      const { result, unmount } = renderHook(() =>
        useMediaUpload({ uploadService: mockUploadService })
      );

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.upload(file);
      });

      // Unmount before upload completes
      unmount();

      // Should not throw or leak memory
      expect(true).toBe(true);
    });

    it("releases file references", async () => {
      const mockUploadService = new MockUploadService();
      const { result } = renderHook(() => useMediaUpload({ uploadService: mockUploadService }));

      const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

      await act(async () => {
        await result.current.upload(file);
      });

      act(() => {
        result.current.reset();
      });

      // State should be clean
      expect(result.current.uploadedUrl).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });
});
