/**
 * Tests for Media Validation Utilities
 */

import { FILE_SIZE_LIMITS } from "@/constants/media";
import {
  getMediaType,
  validateFileSize,
  validateFileType,
  validateImageDimensions,
  validateMedia,
  validateVideoConstraints,
} from "../media-validator";

// Mock Image
const mockImage = {
  src: "",
  width: 1920,
  height: 1080,
  onload: null as any,
  onerror: null as any,
};

// Mock Video
const mockVideo = {
  src: "",
  duration: 60,
  videoWidth: 1920,
  videoHeight: 1080,
  onloadedmetadata: null as any,
  onerror: null as any,
};

beforeAll(() => {
  // Mock document.createElement
  global.document.createElement = jest.fn((tag: string) => {
    if (tag === "img") {
      return { ...mockImage } as any;
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

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Media Validator", () => {
  describe("validateFileSize", () => {
    it("should validate file size within limits", () => {
      const file = new File(["x".repeat(1024 * 1024)], "test.jpg", {
        type: "image/jpeg",
      }); // 1MB

      const result = validateFileSize(file, "PRODUCT_IMAGE");
      expect(result.isValid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject file size exceeding limits", () => {
      const file = new File(["x".repeat(11 * 1024 * 1024)], "test.jpg", {
        type: "image/jpeg",
      }); // 11MB (exceeds 10MB limit)

      const result = validateFileSize(file, "PRODUCT_IMAGE");
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("exceeds maximum allowed size");
    });

    it("should handle different resource types", () => {
      const resourceTypes: Array<keyof typeof FILE_SIZE_LIMITS> = [
        "PRODUCT_IMAGE",
        "PRODUCT_VIDEO",
        "USER_AVATAR",
        "SHOP_BANNER",
      ];

      resourceTypes.forEach((type) => {
        const maxSize = FILE_SIZE_LIMITS[type];
        const file = new File(["x".repeat(maxSize - 1)], "test.jpg", {
          type: "image/jpeg",
        });

        const result = validateFileSize(file, type);
        expect(result.isValid).toBe(true);
      });
    });

    it("should handle zero-byte files", () => {
      const file = new File([], "empty.jpg", { type: "image/jpeg" });

      const result = validateFileSize(file, "PRODUCT_IMAGE");
      expect(result.isValid).toBe(true);
    });
  });

  describe("validateFileType", () => {
    it("should validate image file types", () => {
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

      validTypes.forEach((type) => {
        const file = new File(["mock"], "test", { type });
        const result = validateFileType(file, ["image"]);
        expect(result.isValid).toBe(true);
      });
    });

    it("should validate video file types", () => {
      const validTypes = ["video/mp4", "video/webm"];

      validTypes.forEach((type) => {
        const file = new File(["mock"], "test", { type });
        const result = validateFileType(file, ["video"]);
        expect(result.isValid).toBe(true);
      });
    });

    it("should reject unsupported file types", () => {
      const file = new File(["mock"], "test.exe", {
        type: "application/x-msdownload",
      });
      const result = validateFileType(file, ["image"]);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("not supported");
    });

    it("should handle multiple allowed types", () => {
      const imageFile = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const videoFile = new File(["mock"], "test.mp4", { type: "video/mp4" });

      expect(validateFileType(imageFile, ["image", "video"]).isValid).toBe(
        true
      );
      expect(validateFileType(videoFile, ["image", "video"]).isValid).toBe(
        true
      );
    });
  });

  describe("validateImageDimensions", () => {
    it("should validate image dimensions within constraints", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });

      const promise = validateImageDimensions(file, "PRODUCT");

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.width = 800;
        img.height = 600;
        img.onload();
      }

      const result = await promise;
      expect(result.isValid).toBe(true);
      expect(result.dimensions).toEqual({ width: 800, height: 600 });
    });

    it("should reject images below minimum width", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });

      const promise = validateImageDimensions(file, "PRODUCT");

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.width = 200;
        img.height = 600;
        img.onload();
      }

      const result = await promise;
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("below minimum required");
    });

    it("should skip validation for non-image files", async () => {
      const file = new File(["mock"], "test.txt", { type: "text/plain" });

      const result = await validateImageDimensions(file, "PRODUCT");
      expect(result.isValid).toBe(true);
    });

    it("should handle image load error", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });

      const promise = validateImageDimensions(file, "PRODUCT");

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onerror
      )?.value;
      if (img?.onerror) {
        img.onerror();
      }

      const result = await promise;
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Failed to load image");
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe("validateVideoConstraints", () => {
    it("should validate video within constraints", async () => {
      const file = new File(["mock"], "test.mp4", { type: "video/mp4" });

      const promise = validateVideoConstraints(file, "PRODUCT");

      const createElement = document.createElement as jest.Mock;
      const video = createElement.mock.results.find(
        (r: any) => r.value.onloadedmetadata
      )?.value;
      if (video?.onloadedmetadata) {
        video.duration = 30;
        video.videoWidth = 1920;
        video.videoHeight = 1080;
        video.onloadedmetadata();
      }

      const result = await promise;
      expect(result.isValid).toBe(true);
      expect(result.metadata).toEqual({
        duration: 30,
        width: 1920,
        height: 1080,
      });
    });

    it("should reject video exceeding maximum duration", async () => {
      const file = new File(["mock"], "test.mp4", { type: "video/mp4" });

      const promise = validateVideoConstraints(file, "PRODUCT");

      const createElement = document.createElement as jest.Mock;
      const video = createElement.mock.results.find(
        (r: any) => r.value.onloadedmetadata
      )?.value;
      if (video?.onloadedmetadata) {
        video.duration = 400; // Exceeds 300s limit
        video.videoWidth = 1920;
        video.videoHeight = 1080;
        video.onloadedmetadata();
      }

      const result = await promise;
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("exceeds maximum allowed");
    });

    it("should skip validation for non-video files", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });

      const result = await validateVideoConstraints(file, "PRODUCT");
      expect(result.isValid).toBe(true);
    });

    it("should handle video load error", async () => {
      const file = new File(["mock"], "test.mp4", { type: "video/mp4" });

      const promise = validateVideoConstraints(file, "PRODUCT");

      const createElement = document.createElement as jest.Mock;
      const video = createElement.mock.results.find(
        (r: any) => r.value.onerror
      )?.value;
      if (video?.onerror) {
        video.onerror();
      }

      const result = await promise;
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Failed to load video");
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe("validateMedia", () => {
    it("should perform comprehensive image validation", async () => {
      const file = new File(["x".repeat(1024 * 1024)], "test.jpg", {
        type: "image/jpeg",
      });

      const promise = validateMedia(file, "PRODUCT_IMAGE", "image", "PRODUCT");

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.width = 800;
        img.height = 600;
        img.onload();
      }

      const result = await promise;
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should collect multiple errors", async () => {
      const file = new File(["x".repeat(15 * 1024 * 1024)], "test.exe", {
        type: "application/x-msdownload",
      });

      const result = await validateMedia(file, "PRODUCT_IMAGE", "image");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should separate errors and warnings", async () => {
      const file = new File(["x".repeat(1024 * 1024)], "test.jpg", {
        type: "image/jpeg",
      });

      const promise = validateMedia(file, "PRODUCT_IMAGE", "image", "PRODUCT");

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.width = 800;
        img.height = 600;
        img.onload();
      }

      const result = await promise;
      expect(result).toHaveProperty("errors");
      expect(result).toHaveProperty("warnings");
    });
  });

  describe("getMediaType", () => {
    it("should detect image files", () => {
      const imageTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

      imageTypes.forEach((type) => {
        const file = new File(["mock"], "test", { type });
        expect(getMediaType(file)).toBe("image");
      });
    });

    it("should detect video files", () => {
      const videoTypes = ["video/mp4", "video/webm"];

      videoTypes.forEach((type) => {
        const file = new File(["mock"], "test", { type });
        expect(getMediaType(file)).toBe("video");
      });
    });

    it("should detect document files", () => {
      const docTypes = ["application/pdf"];

      docTypes.forEach((type) => {
        const file = new File(["mock"], "test", { type });
        expect(getMediaType(file)).toBe("document");
      });
    });

    it("should return null for unsupported types", () => {
      const file = new File(["mock"], "test.txt", { type: "text/plain" });
      expect(getMediaType(file)).toBeNull();
    });
  });
});
