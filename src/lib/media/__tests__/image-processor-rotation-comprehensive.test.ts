/**
 * Image Processor - Rotation, Flip, and Crop Comprehensive Tests
 * Tests transformation functions, edge cases, validation
 * BUG FIX #30: Tests for crop dimension/coordinate validation
 */

import { cropImage, flipImage, rotateImage } from "../image-processor";

// Mock HTML elements
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(() => ({
    drawImage: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn(),
    scale: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    setTransform: jest.fn(),
    getImageData: jest.fn(() => ({
      data: new Uint8ClampedArray(0),
      width: 0,
      height: 0,
    })),
    putImageData: jest.fn(),
  })),
  toBlob: jest.fn((callback: any, format: string, quality: number) => {
    callback(new Blob(["data"], { type: format || "image/jpeg" }));
  }),
};

const mockImage = {
  width: 800,
  height: 600,
  src: "",
  onload: null as (() => void) | null,
  onerror: null as (() => void) | null,
};

describe("Image Processor - Rotation, Flip, Crop Tests", () => {
  beforeAll(() => {
    // Mock document.createElement
    global.document.createElement = jest.fn((tag: string) => {
      if (tag === "canvas") {
        const canvas = { ...mockCanvas };
        // Make width/height assignable
        Object.defineProperty(canvas, "width", {
          get: () => mockCanvas.width,
          set: (val) => {
            mockCanvas.width = val;
          },
          configurable: true,
        });
        Object.defineProperty(canvas, "height", {
          get: () => mockCanvas.height,
          set: (val) => {
            mockCanvas.height = val;
          },
          configurable: true,
        });
        return canvas as any;
      }
      if (tag === "img") {
        return { ...mockImage } as any;
      }
      return {} as any;
    });

    global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
    global.URL.revokeObjectURL = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
    // Reset canvas dimensions
    mockCanvas.width = 0;
    mockCanvas.height = 0;
    // Reset toBlob to default behavior
    mockCanvas.toBlob = jest.fn(
      (callback: any, format: string, quality: number) => {
        callback(new Blob(["data"], { type: format || "image/jpeg" }));
      }
    );
    // Reset getContext to return full mock
    mockCanvas.getContext = jest.fn(() => ({
      drawImage: jest.fn(),
      translate: jest.fn(),
      rotate: jest.fn(),
      scale: jest.fn(),
      save: jest.fn(),
      restore: jest.fn(),
      setTransform: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(0),
        width: 0,
        height: 0,
      })),
      putImageData: jest.fn(),
    }));
  });

  describe("BUG FIX #30 - cropImage Validation", () => {
    it("should reject zero width", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: 0, width: 0, height: 100 };

      await expect(cropImage(file, cropArea)).rejects.toThrow(
        "Crop dimensions must be positive"
      );
    });

    it("should reject zero height", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: 0, width: 100, height: 0 };

      await expect(cropImage(file, cropArea)).rejects.toThrow(
        "Crop dimensions must be positive"
      );
    });

    it("should reject negative width", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: 0, width: -50, height: 100 };

      await expect(cropImage(file, cropArea)).rejects.toThrow(
        "Crop dimensions must be positive"
      );
    });

    it("should reject negative height", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: 0, width: 100, height: -50 };

      await expect(cropImage(file, cropArea)).rejects.toThrow(
        "Crop dimensions must be positive"
      );
    });

    it("should reject negative x coordinate", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: -10, y: 0, width: 100, height: 100 };

      await expect(cropImage(file, cropArea)).rejects.toThrow(
        "Crop coordinates must be non-negative"
      );
    });

    it("should reject negative y coordinate", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: -20, width: 100, height: 100 };

      await expect(cropImage(file, cropArea)).rejects.toThrow(
        "Crop coordinates must be non-negative"
      );
    });

    it("should accept valid crop area", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 10, y: 20, width: 100, height: 100 };

      const promise = cropImage(file, cropArea);

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.onload();

      const blob = await promise;
      expect(blob).toBeInstanceOf(Blob);
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should accept crop at origin", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: 0, width: 100, height: 100 };

      const promise = cropImage(file, cropArea);

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.onload();

      const blob = await promise;
      expect(blob).toBeInstanceOf(Blob);
    });

    it("should accept 1x1 pixel crop", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: 0, width: 1, height: 1 };

      const promise = cropImage(file, cropArea);

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.onload();

      const blob = await promise;
      expect(blob).toBeInstanceOf(Blob);
    });
  });

  describe("cropImage - Edge Cases", () => {
    it("should handle different output formats", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: 0, width: 100, height: 100 };

      const promise = cropImage(file, cropArea, "png", 1.0);

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.onload();

      await promise;

      expect(mockCanvas.toBlob).toHaveBeenCalled();
      const args = (mockCanvas.toBlob as jest.Mock).mock.calls[0];
      expect(args[1]).toBe("image/png");
      expect(args[2]).toBe(1.0);
    });

    it("should handle webp format", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: 0, width: 100, height: 100 };

      const promise = cropImage(file, cropArea, "webp", 0.8);

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.onload();

      await promise;

      const args = (mockCanvas.toBlob as jest.Mock).mock.calls[0];
      expect(args[1]).toBe("image/webp");
      expect(args[2]).toBe(0.8);
    });

    it("should reject when canvas context fails", async () => {
      const originalGetContext = mockCanvas.getContext;
      mockCanvas.getContext = jest.fn(() => null);

      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: 0, width: 100, height: 100 };

      const promise = cropImage(file, cropArea);

      const img = (document.createElement as jest.Mock).mock.results.filter(
        (r: any) => r.value.onload
      )[0].value;
      img.onload();

      await expect(promise).rejects.toThrow("Failed to get canvas context");

      mockCanvas.getContext = originalGetContext;
    });

    it("should reject when blob creation fails", async () => {
      const originalToBlob = mockCanvas.toBlob;
      mockCanvas.toBlob = jest.fn((callback: any) => callback(null));

      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: 0, width: 100, height: 100 };

      const promise = cropImage(file, cropArea);

      const img = (document.createElement as jest.Mock).mock.results.filter(
        (r: any) => r.value.onload
      )[0].value;
      img.onload();

      await expect(promise).rejects.toThrow("Failed to create blob");

      mockCanvas.toBlob = originalToBlob;
    });

    it("should reject when image fails to load", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: 0, width: 100, height: 100 };

      const promise = cropImage(file, cropArea);

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.onerror();

      await expect(promise).rejects.toThrow("Failed to load image");
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should handle large crop areas", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const cropArea = { x: 0, y: 0, width: 10000, height: 10000 };

      const promise = cropImage(file, cropArea);

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.onload();

      await promise;

      expect(mockCanvas.width).toBe(10000);
      expect(mockCanvas.height).toBe(10000);
    });
  });

  describe("rotateImage - Comprehensive Tests", () => {
    it("should rotate 90 degrees clockwise", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });

      const promise = rotateImage(file, 90);

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.width = 800;
      img.height = 600;
      img.onload();

      await promise;

      // Dimensions should be swapped for 90/270 degree rotations
      expect(mockCanvas.width).toBe(600);
      expect(mockCanvas.height).toBe(800);
    });

    it("should rotate 180 degrees", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });

      const promise = rotateImage(file, 180);

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.width = 800;
      img.height = 600;
      img.onload();

      await promise;

      // Dimensions should remain same for 180 degree rotation
      expect(mockCanvas.width).toBe(800);
      expect(mockCanvas.height).toBe(600);
    });

    it("should rotate 270 degrees", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });

      const promise = rotateImage(file, 270);

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.width = 800;
      img.height = 600;
      img.onload();

      await promise;

      // Dimensions should be swapped for 90/270 degree rotations
      expect(mockCanvas.width).toBe(600);
      expect(mockCanvas.height).toBe(800);
    });

    it("should handle different output formats", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });

      const promise = rotateImage(file, 90, "png", 1.0);

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.width = 800;
      img.height = 600;
      img.onload();

      await promise;

      const args = (mockCanvas.toBlob as jest.Mock).mock.calls[0];
      expect(args[1]).toBe("image/png");
    });

    it("should reject when canvas context fails", async () => {
      const originalGetContext = mockCanvas.getContext;
      mockCanvas.getContext = jest.fn(() => null);

      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const promise = rotateImage(file, 90);

      const img = (document.createElement as jest.Mock).mock.results.filter(
        (r: any) => r.value.onload
      )[0].value;
      img.onload();

      await expect(promise).rejects.toThrow("Failed to get canvas context");

      mockCanvas.getContext = originalGetContext;
    });

    it("should reject when image fails to load", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const promise = rotateImage(file, 90);

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.onerror();

      await expect(promise).rejects.toThrow("Failed to load image");
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });

  describe("flipImage - Comprehensive Tests", () => {
    it("should handle flip operation successfully", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });

      const promise = flipImage(file, "horizontal", "png", 1.0);

      const img = (document.createElement as jest.Mock).mock.results.filter(
        (r: any) => r.value.onload
      )[0].value;
      img.width = 800;
      img.height = 600;
      img.onload();

      const blob = await promise;

      expect(blob).toBeInstanceOf(Blob);
    });

    it("should reject when canvas context fails", async () => {
      const originalGetContext = mockCanvas.getContext;
      mockCanvas.getContext = jest.fn(() => null);

      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const promise = flipImage(file, "horizontal");

      const img = (document.createElement as jest.Mock).mock.results.filter(
        (r: any) => r.value.onload
      )[0].value;
      img.onload();

      await expect(promise).rejects.toThrow("Failed to get canvas context");

      mockCanvas.getContext = originalGetContext;
    });

    it("should reject when blob creation fails", async () => {
      const originalToBlob = mockCanvas.toBlob;
      mockCanvas.toBlob = jest.fn((callback: any) => callback(null));

      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const promise = flipImage(file, "horizontal");

      const img = (document.createElement as jest.Mock).mock.results.filter(
        (r: any) => r.value.onload
      )[0].value;
      img.onload();

      await expect(promise).rejects.toThrow("Failed to create blob");

      mockCanvas.toBlob = originalToBlob;
    });

    it("should reject when image fails to load", async () => {
      const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
      const promise = flipImage(file, "horizontal");

      const img = (document.createElement as jest.Mock).mock.results[0].value;
      img.onerror();

      await expect(promise).rejects.toThrow("Failed to load image");
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });
  });
});
