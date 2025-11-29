/// <reference types="@testing-library/jest-dom" />

import { renderHook, act, waitFor } from "@testing-library/react";

// Mock mediaService
jest.mock("@/services/media.service", () => ({
  mediaService: {
    upload: jest.fn(),
    deleteByUrl: jest.fn(),
  },
}));

// Mock useNavigationGuard
jest.mock("./useNavigationGuard", () => ({
  useNavigationGuard: jest.fn(() => ({
    confirmNavigation: jest.fn(),
    isNavigating: false,
  })),
}));

import { useMediaUploadWithCleanup } from "./useMediaUploadWithCleanup";
import { mediaService } from "@/services/media.service";
import { useNavigationGuard } from "./useNavigationGuard";

const mediaServiceMock = mediaService as jest.Mocked<typeof mediaService>;
const mockUseNavigationGuard = useNavigationGuard as jest.MockedFunction<
  typeof useNavigationGuard
>;

describe("useMediaUploadWithCleanup", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock mediaService.upload to return object with url and id
    mediaServiceMock.upload.mockResolvedValue({
      url: "https://example.com/uploaded.jpg",
      id: "media-1",
    });
    mediaServiceMock.deleteByUrl.mockResolvedValue(undefined);
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() => useMediaUploadWithCleanup());

    expect(result.current.uploadedMedia).toEqual([]);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.isCleaning).toBe(false);
    expect(result.current.hasUploadedMedia).toBe(false);
    expect(typeof result.current.uploadMedia).toBe("function");
    expect(typeof result.current.uploadMultipleMedia).toBe("function");
    expect(typeof result.current.cleanupUploadedMedia).toBe("function");
    expect(typeof result.current.removeFromTracking).toBe("function");
    expect(typeof result.current.clearTracking).toBe("function");
    expect(typeof result.current.getUploadedUrls).toBe("function");
    expect(typeof result.current.confirmNavigation).toBe("function");
  });

  it("uploads single media successfully", async () => {
    const { result } = renderHook(() => useMediaUploadWithCleanup());

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    let uploadResult: string;
    await act(async () => {
      uploadResult = await result.current.uploadMedia(file, "product");
    });

    expect(uploadResult).toBe("https://example.com/uploaded.jpg");
    expect(result.current.uploadedMedia).toHaveLength(1);
    expect(result.current.uploadedMedia[0]).toEqual({
      url: "https://example.com/uploaded.jpg",
      id: "media-1",
      file,
      uploadedAt: expect.any(Date),
    });
    expect(result.current.hasUploadedMedia).toBe(true);
    expect(mediaServiceMock.upload).toHaveBeenCalledWith({
      file,
      context: "product",
    });
  });

  it("uploads multiple media successfully", async () => {
    const { result } = renderHook(() => useMediaUploadWithCleanup());

    const files = [
      new File(["test1"], "test1.jpg", { type: "image/jpeg" }),
      new File(["test2"], "test2.jpg", { type: "image/jpeg" }),
    ];

    mediaServiceMock.upload
      .mockResolvedValueOnce({
        url: "https://example.com/uploaded1.jpg",
        id: "media-1",
      })
      .mockResolvedValueOnce({
        url: "https://example.com/uploaded2.jpg",
        id: "media-2",
      });

    let uploadResults: string[];
    await act(async () => {
      uploadResults = await result.current.uploadMultipleMedia(
        files,
        "product",
      );
    });

    expect(uploadResults).toEqual([
      "https://example.com/uploaded1.jpg",
      "https://example.com/uploaded2.jpg",
    ]);
    expect(result.current.uploadedMedia).toHaveLength(2);
    expect(result.current.hasUploadedMedia).toBe(true);
  });

  it("handles upload error", async () => {
    const { result } = renderHook(() => useMediaUploadWithCleanup());

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    mediaServiceMock.upload.mockRejectedValue(new Error("Upload failed"));

    await expect(result.current.uploadMedia(file, "product")).rejects.toThrow(
      "Upload failed",
    );

    expect(result.current.uploadedMedia).toHaveLength(0);
    expect(result.current.hasUploadedMedia).toBe(false);
  });

  it("cleans up uploaded media", async () => {
    const { result } = renderHook(() => useMediaUploadWithCleanup());

    // First upload some media
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.uploadMedia(file, "product");
    });

    expect(result.current.uploadedMedia).toHaveLength(1);

    // Now cleanup
    await act(async () => {
      await result.current.cleanupUploadedMedia();
    });

    expect(result.current.uploadedMedia).toHaveLength(0);
    expect(result.current.hasUploadedMedia).toBe(false);
    expect(mediaServiceMock.deleteByUrl).toHaveBeenCalledWith(
      "https://example.com/uploaded.jpg",
    );
  });

  it("removes specific media from tracking", async () => {
    const { result } = renderHook(() => useMediaUploadWithCleanup());

    // Upload media
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.uploadMedia(file, "product");
    });

    expect(result.current.uploadedMedia).toHaveLength(1);

    // Remove from tracking
    act(() => {
      result.current.removeFromTracking("https://example.com/uploaded.jpg");
    });

    expect(result.current.uploadedMedia).toHaveLength(0);
    expect(result.current.hasUploadedMedia).toBe(false);
  });

  it("clears all tracking", async () => {
    const { result } = renderHook(() => useMediaUploadWithCleanup());

    // Upload media
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.uploadMedia(file, "product");
    });

    expect(result.current.uploadedMedia).toHaveLength(1);

    // Clear tracking
    act(() => {
      result.current.clearTracking();
    });

    expect(result.current.uploadedMedia).toHaveLength(0);
    expect(result.current.hasUploadedMedia).toBe(false);
  });

  it("gets uploaded URLs", async () => {
    const { result } = renderHook(() => useMediaUploadWithCleanup());

    // Upload media
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.uploadMedia(file, "product");
    });

    const urls = result.current.getUploadedUrls();
    expect(urls).toEqual(["https://example.com/uploaded.jpg"]);
  });

  it("calls success callback", async () => {
    const onUploadSuccess = jest.fn();
    const { result } = renderHook(() =>
      useMediaUploadWithCleanup({ onUploadSuccess }),
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.uploadMedia(file, "product");
    });

    expect(onUploadSuccess).toHaveBeenCalledWith(
      "https://example.com/uploaded.jpg",
    );
  });

  it("calls error callback", async () => {
    const onUploadError = jest.fn();
    const { result } = renderHook(() =>
      useMediaUploadWithCleanup({ onUploadError }),
    );

    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    mediaServiceMock.upload.mockRejectedValue(new Error("Upload failed"));

    await expect(result.current.uploadMedia(file, "product")).rejects.toThrow(
      "Upload failed",
    );

    expect(onUploadError).toHaveBeenCalledWith("Upload failed");
  });

  it("calls cleanup complete callback", async () => {
    const onCleanupComplete = jest.fn();
    const { result } = renderHook(() =>
      useMediaUploadWithCleanup({ onCleanupComplete }),
    );

    // Upload media
    const file = new File(["test"], "test.jpg", { type: "image/jpeg" });

    await act(async () => {
      await result.current.uploadMedia(file, "product");
    });

    // Cleanup
    await act(async () => {
      await result.current.cleanupUploadedMedia();
    });

    expect(onCleanupComplete).toHaveBeenCalled();
  });

  it("integrates with navigation guard", () => {
    const { result } = renderHook(() => useMediaUploadWithCleanup());

    expect(typeof result.current.confirmNavigation).toBe("function");
    expect(mockUseNavigationGuard).toHaveBeenCalled();
  });
});
