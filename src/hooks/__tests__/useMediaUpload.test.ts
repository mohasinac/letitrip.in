/**
 * Unit Tests for useMediaUpload Hook
 *
 * Tests file validation, upload progress tracking, retry logic,
 * error handling, and XHR-based uploads
 */

import { useUploadContext } from "@/contexts/UploadContext";
import { act, renderHook, waitFor } from "@testing-library/react";
import { useMediaUpload } from "../useMediaUpload";

// Mock dependencies
jest.mock("@/contexts/UploadContext");

const mockUseUploadContext = useUploadContext as jest.MockedFunction<
  typeof useUploadContext
>;

describe("useMediaUpload", () => {
  let mockXhr: any;
  let xhrRequests: any[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    xhrRequests = [];

    // Mock XMLHttpRequest
    mockXhr = {
      open: jest.fn(),
      send: jest.fn(),
      setRequestHeader: jest.fn(),
      upload: { addEventListener: jest.fn() },
      addEventListener: jest.fn(),
      status: 200,
      responseText: JSON.stringify({ url: "https://example.com/image.jpg" }),
    };

    (global as any).XMLHttpRequest = jest.fn(() => {
      xhrRequests.push(mockXhr);
      return mockXhr;
    });

    // Mock upload context
    mockUseUploadContext.mockReturnValue({
      addUpload: jest.fn().mockReturnValue("upload-id-123"),
      updateUpload: jest.fn(),
      removeUpload: jest.fn(),
      retryUpload: jest.fn(),
      uploads: [],
    } as any);

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  describe("File Validation", () => {
    it("should reject files exceeding max size", async () => {
      const { result } = renderHook(() =>
        useMediaUpload({
          maxSize: 1024 * 1024, // 1MB
        })
      );

      const largeFile = new File(["x".repeat(2 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      await act(async () => {
        try {
          await result.current.upload(largeFile);
          fail("Should have thrown error");
        } catch (error: any) {
          expect(error.message).toContain("exceeds maximum");
        }
      });
    });

    it("should accept files within max size", async () => {
      const { result } = renderHook(() =>
        useMediaUpload({
          maxSize: 5 * 1024 * 1024, // 5MB
        })
      );

      const validFile = new File(["test content"], "test.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.upload(validFile);
      });

      // Should proceed with upload (not throw immediately)
      await waitFor(() => {
        expect(mockXhr.open).toHaveBeenCalled();
      });
    });

    it("should reject files with disallowed MIME types", async () => {
      const { result } = renderHook(() =>
        useMediaUpload({
          allowedTypes: ["image/jpeg", "image/png"],
        })
      );

      const invalidFile = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      await act(async () => {
        try {
          await result.current.upload(invalidFile);
          fail("Should have thrown error");
        } catch (error: any) {
          expect(error.message).toContain("not allowed");
        }
      });
    });

    it("should accept files with allowed MIME types", async () => {
      const { result } = renderHook(() =>
        useMediaUpload({
          allowedTypes: ["image/jpeg", "image/png"],
        })
      );

      const validFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      act(() => {
        result.current.upload(validFile);
      });

      await waitFor(() => {
        expect(mockXhr.open).toHaveBeenCalled();
      });
    });

    it("should format file size in error messages correctly", async () => {
      const { result } = renderHook(() =>
        useMediaUpload({
          maxSize: 1024 * 1024, // 1MB
        })
      );

      const file = new File(["x".repeat(2 * 1024 * 1024)], "test.jpg", {
        type: "image/jpeg",
      });

      await act(async () => {
        try {
          await result.current.upload(file);
        } catch (error: any) {
          expect(error.message).toMatch(/\d+\.\d+MB.*exceeds.*\d+\.\d+MB/);
        }
      });
    });
  });

  describe("Upload Progress Tracking", () => {
    it("should track upload progress", async () => {
      const onProgress = jest.fn();
      const { result } = renderHook(() => useMediaUpload({ onProgress }));

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.upload(file);
      });

      // Simulate progress events
      const progressCallback = mockXhr.upload.addEventListener.mock.calls.find(
        (call: any) => call[0] === "progress"
      )?.[1];

      expect(progressCallback).toBeDefined();

      act(() => {
        progressCallback?.({ lengthComputable: true, loaded: 50, total: 100 });
      });

      expect(onProgress).toHaveBeenCalledWith(50);
      expect(result.current.progress).toBe(50);

      act(() => {
        progressCallback?.({ lengthComputable: true, loaded: 100, total: 100 });
      });

      expect(onProgress).toHaveBeenCalledWith(100);
      expect(result.current.progress).toBe(100);
    });

    it("should handle non-computable progress", async () => {
      const onProgress = jest.fn();
      const { result } = renderHook(() => useMediaUpload({ onProgress }));

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.upload(file);
      });

      const progressCallback = mockXhr.upload.addEventListener.mock.calls.find(
        (call: any) => call[0] === "progress"
      )?.[1];

      act(() => {
        progressCallback?.({ lengthComputable: false });
      });

      // Should not call onProgress if lengthComputable is false
      expect(onProgress).not.toHaveBeenCalled();
    });

    it("should update upload context with progress", async () => {
      const mockUpdateUpload = jest.fn();
      mockUseUploadContext.mockReturnValue({
        addUpload: jest.fn().mockReturnValue("upload-123"),
        updateUpload: mockUpdateUpload,
        removeUpload: jest.fn(),
        retryUpload: jest.fn(),
        uploads: [],
      } as any);

      const { result } = renderHook(() => useMediaUpload());

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.upload(file);
      });

      const progressCallback = mockXhr.upload.addEventListener.mock.calls.find(
        (call: any) => call[0] === "progress"
      )?.[1];

      act(() => {
        progressCallback?.({ lengthComputable: true, loaded: 75, total: 100 });
      });

      expect(mockUpdateUpload).toHaveBeenCalledWith("upload-123", {
        progress: 75,
      });
    });
  });

  describe("Successful Upload", () => {
    it("should handle successful upload", async () => {
      const onSuccess = jest.fn();
      const { result } = renderHook(() => useMediaUpload({ onSuccess }));

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      const uploadPromise = act(async () => {
        return result.current.upload(file);
      });

      // Simulate successful response
      const loadCallback = mockXhr.addEventListener.mock.calls.find(
        (call: any) => call[0] === "load"
      )?.[1];

      act(() => {
        loadCallback?.();
      });

      const url = await uploadPromise;

      expect(url).toBe("https://example.com/image.jpg");
      expect(onSuccess).toHaveBeenCalledWith("https://example.com/image.jpg");
      expect(result.current.uploadedUrl).toBe("https://example.com/image.jpg");
      expect(result.current.isUploading).toBe(false);
    });

    it("should handle response with nested data.url structure", async () => {
      mockXhr.responseText = JSON.stringify({
        data: { url: "https://example.com/nested.jpg" },
      });

      const { result } = renderHook(() => useMediaUpload());

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      const uploadPromise = act(async () => {
        return result.current.upload(file);
      });

      const loadCallback = mockXhr.addEventListener.mock.calls.find(
        (call: any) => call[0] === "load"
      )?.[1];

      act(() => {
        loadCallback?.();
      });

      const url = await uploadPromise;

      expect(url).toBe("https://example.com/nested.jpg");
    });

    it("should create preview for image files", async () => {
      const mockAddUpload = jest.fn().mockReturnValue("upload-123");
      mockUseUploadContext.mockReturnValue({
        addUpload: mockAddUpload,
        updateUpload: jest.fn(),
        removeUpload: jest.fn(),
        retryUpload: jest.fn(),
        uploads: [],
      } as any);

      // Mock URL.createObjectURL
      global.URL.createObjectURL = jest.fn().mockReturnValue("blob:preview");

      const { result } = renderHook(() => useMediaUpload());

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.upload(file);
      });

      expect(mockAddUpload).toHaveBeenCalledWith(file, "blob:preview");
    });

    it("should not create preview for non-image files", async () => {
      const mockAddUpload = jest.fn().mockReturnValue("upload-123");
      mockUseUploadContext.mockReturnValue({
        addUpload: mockAddUpload,
        updateUpload: jest.fn(),
        removeUpload: jest.fn(),
        retryUpload: jest.fn(),
        uploads: [],
      } as any);

      const { result } = renderHook(() => useMediaUpload());

      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      act(() => {
        result.current.upload(file);
      });

      expect(mockAddUpload).toHaveBeenCalledWith(file, undefined);
    });
  });

  describe("Upload Errors", () => {
    it("should handle HTTP error responses", async () => {
      const { result } = renderHook(() => useMediaUpload());

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      // Mock XHR to fail after it's created
      (global as any).XMLHttpRequest = jest.fn(() => {
        const xhr = {
          open: jest.fn(),
          send: jest.fn(),
          setRequestHeader: jest.fn(),
          upload: { addEventListener: jest.fn() },
          addEventListener: jest.fn((event, callback) => {
            if (event === "load") {
              setTimeout(() => callback(), 0);
            }
          }),
          status: 500,
          responseText: JSON.stringify({ error: { message: "Server error" } }),
        };
        return xhr;
      });

      await expect(result.current.upload(file)).rejects.toThrow("Server error");
    });

    it("should handle network errors", async () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useMediaUpload({ onError }));

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      const uploadPromise = act(async () => {
        return result.current.upload(file);
      });

      const errorCallback = mockXhr.addEventListener.mock.calls.find(
        (call: any) => call[0] === "error"
      )?.[1];

      act(() => {
        errorCallback?.();
      });

      await expect(uploadPromise).rejects.toThrow("Network error");
      expect(onError).toHaveBeenCalledWith("Network error during upload");
    });

    it("should handle upload abort", async () => {
      const onError = jest.fn();
      const { result } = renderHook(() => useMediaUpload({ onError }));

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      const uploadPromise = act(async () => {
        return result.current.upload(file);
      });

      const abortCallback = mockXhr.addEventListener.mock.calls.find(
        (call: any) => call[0] === "abort"
      )?.[1];

      act(() => {
        abortCallback?.();
      });

      await expect(uploadPromise).rejects.toThrow("Upload aborted");
    });

    it("should handle missing URL in successful response", async () => {
      mockXhr.responseText = JSON.stringify({ success: true });

      const { result } = renderHook(() => useMediaUpload());

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      const uploadPromise = act(async () => {
        return result.current.upload(file);
      });

      const loadCallback = mockXhr.addEventListener.mock.calls.find(
        (call: any) => call[0] === "load"
      )?.[1];

      act(() => {
        loadCallback?.();
      });

      await expect(uploadPromise).rejects.toThrow("No URL returned");
    });
  });

  describe("Upload State Management", () => {
    it("should set isUploading to true during upload", async () => {
      const { result } = renderHook(() => useMediaUpload());

      expect(result.current.isUploading).toBe(false);

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      act(() => {
        result.current.upload(file);
      });

      expect(result.current.isUploading).toBe(true);
    });

    it("should reset error state on new upload", async () => {
      mockXhr.status = 500;

      const { result } = renderHook(() => useMediaUpload());

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      // First upload fails
      const uploadPromise1 = act(async () => {
        return result.current.upload(file);
      });

      const loadCallback1 = mockXhr.addEventListener.mock.calls.find(
        (call: any) => call[0] === "load"
      )?.[1];

      act(() => {
        loadCallback1?.();
      });

      await expect(uploadPromise1).rejects.toThrow();

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      // Reset for second upload
      mockXhr.status = 200;
      mockXhr.responseText = JSON.stringify({
        url: "https://example.com/image.jpg",
      });

      // Second upload should clear error
      act(() => {
        result.current.upload(file);
      });

      expect(result.current.error).toBeNull();
    });

    it("should reset progress on new upload", async () => {
      const { result } = renderHook(() => useMediaUpload());

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      // First upload with progress
      act(() => {
        result.current.upload(file);
      });

      const progressCallback = mockXhr.upload.addEventListener.mock.calls.find(
        (call: any) => call[0] === "progress"
      )?.[1];

      act(() => {
        progressCallback?.({ lengthComputable: true, loaded: 50, total: 100 });
      });

      expect(result.current.progress).toBe(50);

      // New upload should reset progress
      act(() => {
        result.current.upload(file);
      });

      expect(result.current.progress).toBe(0);
    });
  });

  describe("Integration with Upload Context", () => {
    it("should update upload context as successful", async () => {
      const mockUpdateUpload = jest.fn();
      mockUseUploadContext.mockReturnValue({
        addUpload: jest.fn().mockReturnValue("upload-123"),
        updateUpload: mockUpdateUpload,
        removeUpload: jest.fn(),
        retryUpload: jest.fn(),
        uploads: [],
      } as any);

      const { result } = renderHook(() => useMediaUpload());

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      const uploadPromise = act(async () => {
        return result.current.upload(file);
      });

      const loadCallback = mockXhr.addEventListener.mock.calls.find(
        (call: any) => call[0] === "load"
      )?.[1];

      act(() => {
        loadCallback?.();
      });

      await uploadPromise;

      expect(mockUpdateUpload).toHaveBeenCalledWith("upload-123", {
        status: "success",
        progress: 100,
        url: "https://example.com/image.jpg",
        uploadedAt: expect.any(Date),
      });
    });

    it("should update upload context as failed on error", async () => {
      mockXhr.status = 500;
      mockXhr.responseText = JSON.stringify({ error: { message: "Error" } });

      const mockUpdateUpload = jest.fn();
      mockUseUploadContext.mockReturnValue({
        addUpload: jest.fn().mockReturnValue("upload-123"),
        updateUpload: mockUpdateUpload,
        removeUpload: jest.fn(),
        retryUpload: jest.fn(),
        uploads: [],
      } as any);

      const { result } = renderHook(() => useMediaUpload());

      const file = new File(["content"], "test.jpg", { type: "image/jpeg" });

      const uploadPromise = act(async () => {
        return result.current.upload(file);
      });

      const loadCallback = mockXhr.addEventListener.mock.calls.find(
        (call: any) => call[0] === "load"
      )?.[1];

      act(() => {
        loadCallback?.();
      });

      await expect(uploadPromise).rejects.toThrow();

      expect(mockUpdateUpload).toHaveBeenCalledWith(
        "upload-123",
        expect.objectContaining({
          status: "error",
          error: expect.any(String),
        })
      );
    });
  });
});
