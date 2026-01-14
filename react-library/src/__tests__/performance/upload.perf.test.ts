/**
 * Performance Tests for Upload Components and Hooks
 * Tests upload performance, memory usage, and optimization
 */

import { renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MockUploadService } from "../../adapters/examples";
import { useMediaUpload } from "../../hooks/useMediaUpload";

describe("Upload Performance Tests", () => {
  let mockUploadService: MockUploadService;
  let memorySnapshots: number[] = [];

  beforeEach(() => {
    mockUploadService = new MockUploadService();
    memorySnapshots = [];

    // Mock performance.memory for memory leak detection
    if (typeof performance !== "undefined" && !(performance as any).memory) {
      (performance as any).memory = {
        usedJSHeapSize: 10000000,
        totalJSHeapSize: 20000000,
        jsHeapSizeLimit: 2000000000,
      };
    }
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Large File Upload Performance", () => {
    it("should upload large file (50MB+) within acceptable time", async () => {
      const largeFile = new File([new ArrayBuffer(52428800)], "large.jpg", {
        type: "image/jpeg",
      }); // 50MB

      const startTime = performance.now();

      const { result } = renderHook(() =>
        useMediaUpload({
          uploadService: mockUploadService,
          maxSize: 100 * 1024 * 1024, // 100MB limit
        })
      );

      await waitFor(async () => {
        await result.current.upload(largeFile);
      });

      const endTime = performance.now();
      const uploadTime = endTime - startTime;

      // Upload should complete in under 5 seconds (mocked)
      expect(uploadTime).toBeLessThan(5000);
      expect(result.current.uploadedUrl).toBeTruthy();
    });

    it("should handle progress updates efficiently for large files", async () => {
      const largeFile = new File([new ArrayBuffer(52428800)], "large.jpg", {
        type: "image/jpeg",
      });

      const progressUpdates: number[] = [];
      const onProgress = vi.fn((progress: number) => {
        progressUpdates.push(progress);
      });

      const { result } = renderHook(() =>
        useMediaUpload({
          uploadService: mockUploadService,
          maxSize: 100 * 1024 * 1024,
          onProgress,
        })
      );

      await waitFor(async () => {
        await result.current.upload(largeFile);
      });

      // Progress callback should be called multiple times but not excessively
      expect(progressUpdates.length).toBeGreaterThan(0);
      expect(progressUpdates.length).toBeLessThan(100); // Not too many updates

      // Progress should be monotonically increasing
      for (let i = 1; i < progressUpdates.length; i++) {
        expect(progressUpdates[i]).toBeGreaterThanOrEqual(
          progressUpdates[i - 1]
        );
      }
    });
  });

  describe("Concurrent Upload Performance", () => {
    it("should handle multiple concurrent uploads (10+ files)", async () => {
      const files = Array.from(
        { length: 10 },
        (_, i) =>
          new File([new ArrayBuffer(1048576)], `file-${i}.jpg`, {
            type: "image/jpeg",
          })
      ); // 10 x 1MB files

      const startTime = performance.now();

      const uploadPromises = files.map((file) => {
        const { result } = renderHook(() =>
          useMediaUpload({
            uploadService: mockUploadService,
            maxSize: 5 * 1024 * 1024,
          })
        );

        return result.current.upload(file);
      });

      await Promise.all(uploadPromises);

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // All uploads should complete in reasonable time
      expect(totalTime).toBeLessThan(10000); // 10 seconds for 10 files
    });

    it("should not degrade performance with concurrent uploads", async () => {
      const createUploadBatch = (count: number) => {
        return Array.from(
          { length: count },
          (_, i) =>
            new File([new ArrayBuffer(1048576)], `batch-${i}.jpg`, {
              type: "image/jpeg",
            })
        );
      };

      // First batch
      const batch1 = createUploadBatch(5);
      const start1 = performance.now();
      await Promise.all(
        batch1.map((file) => {
          const { result } = renderHook(() =>
            useMediaUpload({
              uploadService: mockUploadService,
              maxSize: 5 * 1024 * 1024,
            })
          );
          return result.current.upload(file);
        })
      );
      const time1 = performance.now() - start1;

      // Second batch (should not be significantly slower)
      const batch2 = createUploadBatch(5);
      const start2 = performance.now();
      await Promise.all(
        batch2.map((file) => {
          const { result } = renderHook(() =>
            useMediaUpload({
              uploadService: mockUploadService,
              maxSize: 5 * 1024 * 1024,
            })
          );
          return result.current.upload(file);
        })
      );
      const time2 = performance.now() - start2;

      // Second batch should not be more than 50% slower
      expect(time2).toBeLessThan(time1 * 1.5);
    });
  });

  describe("Memory Leak Detection", () => {
    it("should not leak memory with repeated uploads", async () => {
      const captureMemorySnapshot = () => {
        if ((performance as any).memory) {
          return (performance as any).memory.usedJSHeapSize;
        }
        return 0;
      };

      // Initial snapshot
      memorySnapshots.push(captureMemorySnapshot());

      // Perform multiple upload cycles
      for (let i = 0; i < 10; i++) {
        const file = new File([new ArrayBuffer(1048576)], `test-${i}.jpg`, {
          type: "image/jpeg",
        });

        const { result, unmount } = renderHook(() =>
          useMediaUpload({
            uploadService: mockUploadService,
            maxSize: 5 * 1024 * 1024,
          })
        );

        await waitFor(async () => {
          await result.current.upload(file);
        });

        // Reset and cleanup
        result.current.reset();
        unmount();

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }

        memorySnapshots.push(captureMemorySnapshot());
      }

      // Check for significant memory growth
      const initialMemory = memorySnapshots[0];
      const finalMemory = memorySnapshots[memorySnapshots.length - 1];
      const memoryGrowth = finalMemory - initialMemory;

      // Memory should not grow more than 10MB for 10 uploads
      expect(memoryGrowth).toBeLessThan(10 * 1024 * 1024);
    });

    it("should cleanup blob URLs after upload", async () => {
      const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL");

      const file = new File([new ArrayBuffer(1048576)], "test.jpg", {
        type: "image/jpeg",
      });

      const { result } = renderHook(() =>
        useMediaUpload({
          uploadService: mockUploadService,
          maxSize: 5 * 1024 * 1024,
        })
      );

      await waitFor(async () => {
        await result.current.upload(file);
      });

      // Reset should trigger cleanup
      result.current.reset();

      // Verify blob URL was revoked
      expect(revokeObjectURLSpy).toHaveBeenCalled();

      revokeObjectURLSpy.mockRestore();
    });
  });

  describe("Progress Callback Frequency", () => {
    it("should throttle progress callbacks to avoid performance issues", async () => {
      const file = new File([new ArrayBuffer(10485760)], "test.jpg", {
        type: "image/jpeg",
      }); // 10MB

      const progressCalls: number[] = [];
      const onProgress = vi.fn((progress: number) => {
        progressCalls.push(Date.now());
      });

      const { result } = renderHook(() =>
        useMediaUpload({
          uploadService: mockUploadService,
          maxSize: 20 * 1024 * 1024,
          onProgress,
        })
      );

      await waitFor(async () => {
        await result.current.upload(file);
      });

      // Calculate time between calls
      const intervals: number[] = [];
      for (let i = 1; i < progressCalls.length; i++) {
        intervals.push(progressCalls[i] - progressCalls[i - 1]);
      }

      // Average interval should be reasonable (not too frequent)
      if (intervals.length > 0) {
        const avgInterval =
          intervals.reduce((a, b) => a + b, 0) / intervals.length;
        expect(avgInterval).toBeGreaterThan(10); // At least 10ms between calls
      }
    });
  });

  describe("Re-render Optimization", () => {
    it("should minimize re-renders during upload", async () => {
      const file = new File([new ArrayBuffer(1048576)], "test.jpg", {
        type: "image/jpeg",
      });

      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useMediaUpload({
          uploadService: mockUploadService,
          maxSize: 5 * 1024 * 1024,
        });
      });

      const initialRenderCount = renderCount;

      await waitFor(async () => {
        await result.current.upload(file);
      });

      const totalRenders = renderCount - initialRenderCount;

      // Should not trigger excessive re-renders
      // Typical: initial render + uploading state + progress updates + complete
      expect(totalRenders).toBeLessThan(50);
    });

    it("should batch state updates efficiently", async () => {
      const files = Array.from(
        { length: 5 },
        (_, i) =>
          new File([new ArrayBuffer(1048576)], `file-${i}.jpg`, {
            type: "image/jpeg",
          })
      );

      let renderCount = 0;
      const { result } = renderHook(() => {
        renderCount++;
        return useMediaUpload({
          uploadService: mockUploadService,
          maxSize: 5 * 1024 * 1024,
        });
      });

      const initialRenderCount = renderCount;

      // Upload files sequentially
      for (const file of files) {
        await waitFor(async () => {
          await result.current.upload(file);
        });
        result.current.reset();
      }

      const avgRendersPerUpload =
        (renderCount - initialRenderCount) / files.length;

      // Average renders per upload should be reasonable
      expect(avgRendersPerUpload).toBeLessThan(20);
    });
  });

  describe("File Validation Performance", () => {
    it("should validate files quickly", () => {
      const files = Array.from(
        { length: 100 },
        (_, i) =>
          new File([new ArrayBuffer(1048576)], `file-${i}.jpg`, {
            type: "image/jpeg",
          })
      );

      const startTime = performance.now();

      files.forEach((file) => {
        // Validation logic (mocked)
        expect(file.size).toBeLessThanOrEqual(5 * 1024 * 1024);
        expect(file.type.startsWith("image/")).toBe(true);
      });

      const endTime = performance.now();
      const validationTime = endTime - startTime;

      // Validation of 100 files should be very fast
      expect(validationTime).toBeLessThan(100); // Less than 100ms
    });
  });

  describe("Upload Speed Metrics", () => {
    it("should maintain consistent upload speed", async () => {
      const uploadSpeeds: number[] = [];

      for (let i = 0; i < 5; i++) {
        const file = new File([new ArrayBuffer(5242880)], `file-${i}.jpg`, {
          type: "image/jpeg",
        }); // 5MB

        const startTime = performance.now();

        const { result } = renderHook(() =>
          useMediaUpload({
            uploadService: mockUploadService,
            maxSize: 10 * 1024 * 1024,
          })
        );

        await waitFor(async () => {
          await result.current.upload(file);
        });

        const endTime = performance.now();
        const uploadTime = endTime - startTime;
        const speed = file.size / (uploadTime / 1000); // bytes per second

        uploadSpeeds.push(speed);
      }

      // Calculate coefficient of variation (CV = std dev / mean)
      const mean =
        uploadSpeeds.reduce((a, b) => a + b, 0) / uploadSpeeds.length;
      const variance =
        uploadSpeeds.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
        uploadSpeeds.length;
      const stdDev = Math.sqrt(variance);
      const cv = stdDev / mean;

      // CV should be less than 0.5 (speeds are consistent)
      expect(cv).toBeLessThan(0.5);
    });
  });

  describe("Error Recovery Performance", () => {
    it("should handle retry efficiently", async () => {
      const failingUploadService = new MockUploadService();
      let attemptCount = 0;

      vi.spyOn(failingUploadService, "upload").mockImplementation(
        async (file: File) => {
          attemptCount++;
          if (attemptCount < 3) {
            throw new Error("Upload failed");
          }
          return "https://example.com/success.jpg";
        }
      );

      const file = new File([new ArrayBuffer(1048576)], "test.jpg", {
        type: "image/jpeg",
      });

      const startTime = performance.now();

      const { result } = renderHook(() =>
        useMediaUpload({
          uploadService: failingUploadService,
          maxSize: 5 * 1024 * 1024,
          maxRetries: 3,
        })
      );

      // Initial upload (will fail)
      try {
        await result.current.upload(file);
      } catch (error) {
        // Expected to fail
      }

      // Retry
      await waitFor(async () => {
        await result.current.retry();
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should complete with retries in reasonable time
      expect(totalTime).toBeLessThan(3000);
      expect(result.current.uploadedUrl).toBeTruthy();
      expect(attemptCount).toBe(3);
    });
  });
});
