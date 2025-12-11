/**
 * Video Processor - Comprehensive Edge Case Tests
 * Tests error handling, validation, edge cases for video processing
 * BUG FIX #29: Tests for division by zero, negative values, invalid inputs
 */

import {
  createThumbnailFromBlob,
  extractMultipleThumbnails,
  extractVideoThumbnail,
  generateVideoPreview,
  getVideoMetadata,
} from "../video-processor";

// Mock HTML elements
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
  })),
  toDataURL: jest.fn(() => "data:image/jpeg;base64,mock"),
};

const mockVideo = {
  currentTime: 0,
  duration: 10,
  videoWidth: 1920,
  videoHeight: 1080,
  src: "",
  onloadedmetadata: null as (() => void) | null,
  onseeked: null as (() => void) | null,
  onerror: null as (() => void) | null,
  crossOrigin: "",
};

describe("Video Processor - Comprehensive Tests", () => {
  beforeAll(() => {
    // Mock document.createElement
    global.document.createElement = jest.fn((tag: string) => {
      if (tag === "canvas") {
        return mockCanvas as any;
      }
      if (tag === "video") {
        return { ...mockVideo } as any;
      }
      return {} as any;
    });

    // Mock URL methods
    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("BUG FIX #29 - Input Validation", () => {
    describe("extractVideoThumbnail", () => {
      it("should reject negative timestamp", async () => {
        const file = new File(["video"], "test.mp4", { type: "video/mp4" });

        await expect(extractVideoThumbnail(file, -5)).rejects.toThrow(
          "Timestamp must be non-negative"
        );
      });

      it("should reject negative timestamp even when very small", async () => {
        const file = new File(["video"], "test.mp4", { type: "video/mp4" });

        await expect(extractVideoThumbnail(file, -0.001)).rejects.toThrow(
          "Timestamp must be non-negative"
        );
      });

      it("should accept zero timestamp", async () => {
        const file = new File(["video"], "test.mp4", { type: "video/mp4" });

        const promise = extractVideoThumbnail(file, 0);

        // Simulate video loaded
        const video = (document.createElement as jest.Mock).mock.results[0]
          .value;
        video.onloadedmetadata();
        video.onseeked();

        await expect(promise).resolves.toBe("data:image/jpeg;base64,mock");
      });
    });

    describe("extractMultipleThumbnails", () => {
      it("should reject count of 0", async () => {
        const file = new File(["video"], "test.mp4", { type: "video/mp4" });

        await expect(extractMultipleThumbnails(file, 0)).rejects.toThrow(
          "Count must be a positive number"
        );
      });

      it("should reject negative count", async () => {
        const file = new File(["video"], "test.mp4", { type: "video/mp4" });

        await expect(extractMultipleThumbnails(file, -5)).rejects.toThrow(
          "Count must be a positive number"
        );
      });

      it("should accept count of 1", async () => {
        const file = new File(["video"], "test.mp4", { type: "video/mp4" });

        const promise = extractMultipleThumbnails(file, 1);

        // Simulate video loaded
        const video = (document.createElement as jest.Mock).mock.results[0]
          .value;
        video.duration = 10;
        video.onloadedmetadata();

        // Simulate seek events for all thumbnails
        await new Promise((resolve) => setTimeout(resolve, 0));
        const videoEls = (
          document.createElement as jest.Mock
        ).mock.results.filter((r: any) => r.value.onloadedmetadata);
        videoEls.forEach((el: any) => el.value.onseeked && el.value.onseeked());

        const result = await promise;
        expect(result).toHaveLength(1);
      });
    });

    describe("getVideoMetadata", () => {
      it("should handle zero video height (BUG FIX #29)", async () => {
        const file = new File(["video"], "test.mp4", { type: "video/mp4" });

        const promise = getVideoMetadata(file);

        // Simulate video with zero height
        const video = (document.createElement as jest.Mock).mock.results[0]
          .value;
        video.videoWidth = 1920;
        video.videoHeight = 0; // BUG: Division by zero
        video.duration = 10;
        video.onloadedmetadata();

        const result = await promise;

        expect(result.aspectRatio).toBe(0); // Should not be Infinity or NaN
        expect(result.width).toBe(1920);
        expect(result.height).toBe(0);
      });

      it("should calculate correct aspect ratio for normal video", async () => {
        const file = new File(["video"], "test.mp4", { type: "video/mp4" });

        const promise = getVideoMetadata(file);

        const video = (document.createElement as jest.Mock).mock.results[0]
          .value;
        video.videoWidth = 1920;
        video.videoHeight = 1080;
        video.duration = 10;
        video.onloadedmetadata();

        const result = await promise;

        expect(result.aspectRatio).toBeCloseTo(1.7778, 4); // 16:9
        expect(result.width).toBe(1920);
        expect(result.height).toBe(1080);
      });

      it("should handle very small video dimensions", async () => {
        const file = new File(["video"], "test.mp4", { type: "video/mp4" });

        const promise = getVideoMetadata(file);

        const video = (document.createElement as jest.Mock).mock.results[0]
          .value;
        video.videoWidth = 1;
        video.videoHeight = 1;
        video.duration = 0.1;
        video.onloadedmetadata();

        const result = await promise;

        expect(result.aspectRatio).toBe(1);
        expect(result.width).toBe(1);
        expect(result.height).toBe(1);
      });
    });
  });

  describe("extractVideoThumbnail - Edge Cases", () => {
    it("should handle timestamp exceeding video duration", async () => {
      const file = new File(["video"], "test.mp4", { type: "video/mp4" });

      const promise = extractVideoThumbnail(file, 999999);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.duration = 10;
      video.onloadedmetadata();
      video.onseeked();

      await promise;

      // Should clamp to video duration
      expect(video.currentTime).toBe(10);
    });

    it("should handle custom width and height", async () => {
      const file = new File(["video"], "test.mp4", { type: "video/mp4" });

      const promise = extractVideoThumbnail(file, 5, {
        width: 640,
        height: 360,
      });

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.onloadedmetadata();
      video.onseeked();

      await promise;

      expect(mockCanvas.width).toBe(640);
      expect(mockCanvas.height).toBe(360);
    });

    it("should handle different image formats", async () => {
      const file = new File(["video"], "test.mp4", { type: "video/mp4" });

      const promise = extractVideoThumbnail(file, 5, { format: "png" });

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.onloadedmetadata();
      video.onseeked();

      await promise;

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/png", 0.8);
    });

    it("should handle custom quality", async () => {
      const file = new File(["video"], "test.mp4", { type: "video/mp4" });

      const promise = extractVideoThumbnail(file, 5, { quality: 0.5 });

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.onloadedmetadata();
      video.onseeked();

      await promise;

      expect(mockCanvas.toDataURL).toHaveBeenCalledWith("image/jpeg", 0.5);
    });

    it("should reject when canvas context fails", async () => {
      mockCanvas.getContext = jest.fn(() => null);

      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const promise = extractVideoThumbnail(file, 5);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.onloadedmetadata();
      video.onseeked();

      await expect(promise).rejects.toThrow("Failed to get canvas context");

      // Restore mock
      mockCanvas.getContext = jest.fn(() => ({
        drawImage: jest.fn(),
      }));
    });

    it("should reject when video fails to load", async () => {
      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const promise = extractVideoThumbnail(file, 5);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.onerror();

      await expect(promise).rejects.toThrow("Failed to load video");
    });

    it("should revoke object URL on success", async () => {
      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const promise = extractVideoThumbnail(file, 5);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.onloadedmetadata();
      video.onseeked();

      await promise;

      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("should revoke object URL on error", async () => {
      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const promise = extractVideoThumbnail(file, 5);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.onerror();

      await expect(promise).rejects.toThrow();
      expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe("extractMultipleThumbnails - Edge Cases", () => {
    it("should reject when video fails to load", async () => {
      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const promise = extractMultipleThumbnails(file, 5);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.onerror();

      await expect(promise).rejects.toThrow("Failed to load video");
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe("getVideoMetadata - Edge Cases", () => {
    it("should include file size", async () => {
      const file = new File(["x".repeat(1000)], "test.mp4", {
        type: "video/mp4",
      });

      const promise = getVideoMetadata(file);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.videoWidth = 1920;
      video.videoHeight = 1080;
      video.duration = 10;
      video.onloadedmetadata();

      const result = await promise;

      expect(result.size).toBe(1000);
    });

    it("should reject when video fails to load", async () => {
      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const promise = getVideoMetadata(file);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.onerror();

      await expect(promise).rejects.toThrow("Failed to load video");
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should handle very long duration", async () => {
      const file = new File(["video"], "test.mp4", { type: "video/mp4" });
      const promise = getVideoMetadata(file);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.videoWidth = 1920;
      video.videoHeight = 1080;
      video.duration = 99999; // Very long video
      video.onloadedmetadata();

      const result = await promise;

      expect(result.duration).toBe(99999);
    });
  });

  describe("generateVideoPreview", () => {
    it("should create preview at timestamp 0", async () => {
      const file = new File(["video"], "test.mp4", { type: "video/mp4" });

      const promise = generateVideoPreview(file, 640, 360);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.onloadedmetadata();
      video.onseeked();

      const result = await promise;
      expect(result).toBe("data:image/jpeg;base64,mock");
    });
  });

  describe("createThumbnailFromBlob", () => {
    it("should create thumbnail from blob URL", async () => {
      const promise = createThumbnailFromBlob("blob:test-url", 5, 320, 180);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.duration = 10;
      video.onloadedmetadata();
      video.onseeked();

      const result = await promise;

      expect(result).toBe("data:image/jpeg;base64,mock");
      expect(video.crossOrigin).toBe("anonymous");
      expect(video.src).toBe("blob:test-url");
    });

    it("should handle timestamp exceeding duration", async () => {
      const promise = createThumbnailFromBlob("blob:test-url", 999, 320, 180);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.duration = 10;
      video.onloadedmetadata();
      video.onseeked();

      await promise;

      expect(video.currentTime).toBe(10);
    });

    it("should reject when canvas context fails", async () => {
      mockCanvas.getContext = jest.fn(() => null);

      const promise = createThumbnailFromBlob("blob:test-url", 5, 320, 180);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.onloadedmetadata();
      video.onseeked();

      await expect(promise).rejects.toThrow("Failed to get canvas context");

      mockCanvas.getContext = jest.fn(() => ({
        drawImage: jest.fn(),
      }));
    });

    it("should reject when video fails to load", async () => {
      const promise = createThumbnailFromBlob("blob:test-url", 5, 320, 180);

      const video = (document.createElement as jest.Mock).mock.results[0].value;
      video.onerror();

      await expect(promise).rejects.toThrow("Failed to load video");
    });
  });
});
