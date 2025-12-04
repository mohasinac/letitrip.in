/// <reference types="@testing-library/jest-dom" />

import { act, renderHook, waitFor } from "@testing-library/react";
import { useMediaUpload } from "./useMediaUpload";

// Mock UploadContext
const mockAddUpload = jest.fn();
const mockUpdateUpload = jest.fn();
const mockRemoveUpload = jest.fn();
const mockRetryUpload = jest.fn();

jest.mock("@/contexts/UploadContext", () => ({
  useUploadContext: () => ({
    addUpload: mockAddUpload,
    updateUpload: mockUpdateUpload,
    removeUpload: mockRemoveUpload,
    retryUpload: mockRetryUpload,
  }),
}));

// Mock XMLHttpRequest
const mockXhr = {
  open: jest.fn(),
  send: jest.fn(),
  addEventListener: jest.fn(),
  upload: {
    addEventListener: jest.fn(),
  },
  status: 200,
  responseText: JSON.stringify({ url: "https://example.com/uploaded.jpg" }),
};

global.XMLHttpRequest = jest.fn(() => mockXhr) as any;

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "blob:mock-url");

// Mock document.querySelector
const mockInput = {
  files: [new File(["test"], "test.jpg", { type: "image/jpeg" })],
};
document.querySelector = jest.fn(() => mockInput) as any;

describe("useMediaUpload", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddUpload.mockReturnValue("upload-1");
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useMediaUpload());

    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBe(null);
    expect(result.current.uploadedUrl).toBe(null);
    expect(result.current.uploadId).toBe(null);
  });

  it("validates file size", async () => {
    const { result } = renderHook(
      () => useMediaUpload({ maxSize: 1024 }) // 1KB
    );

    const largeFile = new File(["x".repeat(2048)], "large.jpg", {
      type: "image/jpeg",
    });

    await expect(result.current.upload(largeFile)).rejects.toThrow(
      "File size (0.00MB) exceeds maximum (0.00MB)"
    );
  });

  it("validates file type", async () => {
    const { result } = renderHook(() =>
      useMediaUpload({ allowedTypes: ["image/jpeg"] })
    );

    const invalidFile = new File(["test"], "test.txt", {
      type: "text/plain",
    });

    await expect(result.current.upload(invalidFile)).rejects.toThrow(
      "File type text/plain is not allowed"
    );
  });

  it("uploads valid file successfully", async () => {
    const { result } = renderHook(() => useMediaUpload());

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    // Mock successful upload
    mockXhr.status = 200;
    mockXhr.responseText = JSON.stringify({
      url: "https://example.com/uploaded.jpg",
    });

    let resolveLoad: () => void;
    const loadPromise = new Promise<void>((resolve) => {
      resolveLoad = resolve;
    });

    mockXhr.addEventListener.mockImplementation((event, handler) => {
      if (event === "load") {
        // Simulate async load
        setTimeout(() => {
          handler();
          resolveLoad();
        }, 0);
      }
    });

    mockXhr.upload.addEventListener.mockImplementation((event, handler) => {
      if (event === "progress") {
        // Simulate progress
        setTimeout(() => {
          handler({ loaded: 50, total: 100, lengthComputable: true });
        }, 0);
      }
    });

    let uploadResult: string = "";
    await act(async () => {
      uploadResult = await result.current.upload(file);
    });

    expect(uploadResult).toBe("https://example.com/uploaded.jpg");
    expect(result.current.uploadedUrl).toBe("https://example.com/uploaded.jpg");
    expect(result.current.progress).toBe(100);
    expect(result.current.isUploading).toBe(false);
    expect(mockAddUpload).toHaveBeenCalledWith(file, "blob:mock-url");
    expect(mockUpdateUpload).toHaveBeenCalledWith("upload-1", {
      status: "uploading",
    });
    expect(mockUpdateUpload).toHaveBeenCalledWith("upload-1", {
      status: "success",
      progress: 100,
      url: "https://example.com/uploaded.jpg",
      uploadedAt: expect.any(Date),
    });
  });

  it("handles upload error", async () => {
    const { result } = renderHook(() => useMediaUpload());

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    // Mock failed upload
    mockXhr.status = 500;
    mockXhr.responseText = JSON.stringify({
      error: { message: "Server error" },
    });

    mockXhr.addEventListener.mockImplementation((event, handler) => {
      if (event === "load") {
        setTimeout(() => handler(), 0);
      }
    });

    await act(async () => {
      await expect(result.current.upload(file)).rejects.toThrow("Server error");
    });

    await waitFor(() => {
      expect(result.current.error).toBe("Server error");
    });
    expect(result.current.isUploading).toBe(false);
    // Upload context tracks the upload start
    expect(mockUpdateUpload).toHaveBeenCalledWith("upload-1", {
      status: "uploading",
    });
  });

  it("calls progress callback", async () => {
    const onProgress = jest.fn();
    const { result } = renderHook(() => useMediaUpload({ onProgress }));

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    mockXhr.status = 200;
    mockXhr.responseText = JSON.stringify({
      url: "https://example.com/uploaded.jpg",
    });

    let resolveLoad: () => void;
    const loadPromise = new Promise<void>((resolve) => {
      resolveLoad = resolve;
    });

    mockXhr.addEventListener.mockImplementation((event, handler) => {
      if (event === "load") {
        setTimeout(() => {
          handler();
          resolveLoad();
        }, 0);
      }
    });

    mockXhr.upload.addEventListener.mockImplementation((event, handler) => {
      if (event === "progress") {
        setTimeout(() => {
          handler({ loaded: 50, total: 100, lengthComputable: true });
        }, 0);
      }
    });

    await act(async () => {
      await result.current.upload(file);
    });

    expect(onProgress).toHaveBeenCalledWith(50);
  });

  it("calls success callback", async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useMediaUpload({ onSuccess }));

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    mockXhr.status = 200;
    mockXhr.responseText = JSON.stringify({
      url: "https://example.com/uploaded.jpg",
    });

    mockXhr.addEventListener.mockImplementation((event, handler) => {
      if (event === "load") {
        setTimeout(() => handler(), 0);
      }
    });

    await act(async () => {
      await result.current.upload(file);
    });

    expect(onSuccess).toHaveBeenCalledWith("https://example.com/uploaded.jpg");
  });

  it("calls error callback", async () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useMediaUpload({ onError }));

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    mockXhr.status = 400;
    mockXhr.responseText = JSON.stringify({
      error: { message: "Bad request" },
    });

    mockXhr.addEventListener.mockImplementation((event, handler) => {
      if (event === "load") {
        setTimeout(() => handler(), 0);
      }
    });

    await expect(result.current.upload(file)).rejects.toThrow("Bad request");

    expect(onError).toHaveBeenCalledWith("Bad request");
  });

  it("cancels upload when upload is in progress", async () => {
    const { result } = renderHook(() => useMediaUpload());

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    // Mock a long-running upload
    mockXhr.status = 200;
    mockXhr.responseText = JSON.stringify({
      url: "https://example.com/uploaded.jpg",
    });

    mockXhr.addEventListener.mockImplementation(() => {
      // Don't resolve - simulate ongoing upload
    });

    // Start the upload (don't await - let it run)
    act(() => {
      result.current.upload(file).catch(() => {}); // Ignore errors
    });

    // Now cancel should work since uploadId is set
    await act(async () => {
      // Wait for addUpload to be called
      await waitFor(() => {
        expect(mockAddUpload).toHaveBeenCalled();
      });
    });

    act(() => {
      result.current.cancel();
    });

    // removeUpload should be called with the uploadId
    expect(mockRemoveUpload).toHaveBeenCalledWith("upload-1");
    expect(result.current.isUploading).toBe(false);
    expect(result.current.progress).toBe(0);
    expect(result.current.error).toBe(null);
  });

  it("resets state", () => {
    const { result } = renderHook(() => useMediaUpload());

    act(() => {
      result.current.reset();
    });

    expect(mockRemoveUpload).not.toHaveBeenCalled(); // No uploadId yet
  });

  it("retry returns null when no upload id exists", async () => {
    const { result } = renderHook(() => useMediaUpload());

    let retryResult: string | null;
    await act(async () => {
      retryResult = await result.current.retry();
    });

    // With no prior upload, retry should return null
    expect(retryResult!).toBe(null);
  });
});
