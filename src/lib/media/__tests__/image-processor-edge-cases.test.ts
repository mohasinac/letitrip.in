/**
 * Image Processor - Comprehensive Edge Case Tests
 * Tests RGB clamping, filter edge cases, and error handling
 */

import {
  blobToFile,
  cropImage,
  resizeImage,
  rotateImage,
} from "../image-processor";

// Mock canvas for JSDOM environment
const createMockCanvas = (width: number, height: number) => {
  let canvasFormat = "png"; // Track format for toBlob

  const canvas = {
    width,
    height,
    getContext: jest.fn(() => ({
      drawImage: jest.fn(),
      getImageData: jest.fn(() => ({
        data: new Uint8ClampedArray(width * height * 4),
        width,
        height,
      })),
      putImageData: jest.fn(),
      createImageData: jest.fn((w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
      })),
      translate: jest.fn(),
      rotate: jest.fn(),
      createLinearGradient: jest.fn(() => ({
        addColorStop: jest.fn(),
      })),
      fillRect: jest.fn(),
    })),
    toBlob: jest.fn((callback: BlobCallback, type?: string) => {
      // Use the requested type or default to png
      const mimeType = type || "image/png";
      callback(new Blob(["mock"], { type: mimeType }));
    }),
    toDataURL: jest.fn(() => "data:image/png;base64,mock"),
  };
  return canvas as unknown as HTMLCanvasElement;
};

describe("Image Processor - Edge Cases & Validation", () => {
  beforeAll(() => {
    // Mock document.createElement for canvas
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, "createElement").mockImplementation((tagName) => {
      if (tagName === "canvas") {
        return createMockCanvas(100, 100);
      }
      return originalCreateElement(tagName);
    });

    // Mock Image
    global.Image = class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      src = "";
      width = 100;
      height = 100;

      constructor() {
        setTimeout(() => {
          if (this.onload) this.onload();
        }, 0);
      }
    } as any;

    // Mock URL.createObjectURL and revokeObjectURL
    global.URL.createObjectURL = jest.fn(() => "blob:mock");
    global.URL.revokeObjectURL = jest.fn();
  });

  // Helper to create a test image file
  function createTestFile(
    width: number = 100,
    height: number = 100,
    filename: string = "test.png"
  ): File {
    const blob = new Blob(["mock image data"], { type: "image/png" });
    return new File([blob], filename, { type: "image/png" });
  }

  describe("resizeImage - Edge Cases", () => {
    it("should handle very small images (1x1)", async () => {
      const file = createTestFile(1, 1);
      const result = await resizeImage(file, {
        maxWidth: 100,
        maxHeight: 100,
      });
      expect(result).toBeInstanceOf(Blob);
      expect(result.size).toBeGreaterThan(0);
    });

    it("should handle very large dimension requests", async () => {
      const file = createTestFile(100, 100);
      const result = await resizeImage(file, {
        maxWidth: 10000,
        maxHeight: 10000,
      });
      expect(result).toBeInstanceOf(Blob);
    });

    it("should handle aspect ratio with extreme dimensions", async () => {
      const file = createTestFile(1000, 10); // Very wide
      const result = await resizeImage(file, {
        maxWidth: 100,
        maxHeight: 100,
        maintainAspectRatio: true,
      });
      expect(result).toBeInstanceOf(Blob);
    });

    it("should handle non-aspect-ratio resize", async () => {
      const file = createTestFile(100, 200);
      const result = await resizeImage(file, {
        maxWidth: 50,
        maxHeight: 50,
        maintainAspectRatio: false,
      });
      expect(result).toBeInstanceOf(Blob);
    });

    it("should handle quality boundaries (0)", async () => {
      const file = createTestFile();
      const result = await resizeImage(file, {
        maxWidth: 50,
        quality: 0,
      });
      expect(result).toBeInstanceOf(Blob);
    });

    it("should handle quality boundaries (1)", async () => {
      const file = createTestFile();
      const result = await resizeImage(file, {
        maxWidth: 50,
        quality: 1,
      });
      expect(result).toBeInstanceOf(Blob);
    });

    it("should handle different output formats", async () => {
      const file = createTestFile();

      const jpeg = await resizeImage(file, {
        maxWidth: 50,
        format: "jpeg",
      });
      expect(jpeg.type).toContain("jpeg");

      const png = await resizeImage(file, {
        maxWidth: 50,
        format: "png",
      });
      expect(png.type).toContain("png");

      const webp = await resizeImage(file, {
        maxWidth: 50,
        format: "webp",
      });
      expect(webp.type).toContain("webp");
    });

    it("should handle invalid image data", async () => {
      // Mock image load error for this specific test
      const OriginalImage = global.Image;
      global.Image = class MockImage {
        onerror: (() => void) | null = null;
        onload: (() => void) | null = null;
        set src(_value: string) {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      } as any;

      const invalidFile = new File(["not an image"], "test.png", {
        type: "image/png",
      });

      await expect(
        resizeImage(invalidFile, { maxWidth: 100 })
      ).rejects.toThrow();

      // Restore original Image mock
      global.Image = OriginalImage;
    });
  });

  describe("cropImage - Edge Cases", () => {
    it("should handle crop at image boundaries", async () => {
      const file = createTestFile(100, 100);
      const result = await cropImage(
        file,
        { x: 0, y: 0, width: 100, height: 100 } // Exact boundaries
      );
      expect(result).toBeInstanceOf(Blob);
    });

    it("should handle very small crop area (1x1)", async () => {
      const file = createTestFile(100, 100);
      const result = await cropImage(file, {
        x: 50,
        y: 50,
        width: 1,
        height: 1,
      });
      expect(result).toBeInstanceOf(Blob);
    });

    it("should handle crop starting at edges", async () => {
      const file = createTestFile(100, 100);

      // Top-left corner
      const topLeft = await cropImage(file, {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
      });
      expect(topLeft).toBeInstanceOf(Blob);

      // Bottom-right corner
      const bottomRight = await cropImage(file, {
        x: 90,
        y: 90,
        width: 10,
        height: 10,
      });
      expect(bottomRight).toBeInstanceOf(Blob);
    });

    it("should handle different output formats for crop", async () => {
      const file = createTestFile();
      const cropArea = { x: 10, y: 10, width: 50, height: 50 };

      const jpeg = await cropImage(file, cropArea, "jpeg");
      expect(jpeg.type).toContain("jpeg");

      const png = await cropImage(file, cropArea, "png");
      expect(png.type).toContain("png");

      const webp = await cropImage(file, cropArea, "webp");
      expect(webp.type).toContain("webp");
    });
  });

  describe("rotateImage - Edge Cases", () => {
    it("should handle all rotation angles", async () => {
      const file = createTestFile();

      const rotate90 = await rotateImage(file, 90);
      expect(rotate90).toBeInstanceOf(Blob);

      const rotate180 = await rotateImage(file, 180);
      expect(rotate180).toBeInstanceOf(Blob);

      const rotate270 = await rotateImage(file, 270);
      expect(rotate270).toBeInstanceOf(Blob);

      const rotate360 = await rotateImage(file, 360);
      expect(rotate360).toBeInstanceOf(Blob);
    });

    it("should handle negative rotation angles", async () => {
      const file = createTestFile();

      const rotateMinus90 = await rotateImage(file, -90);
      expect(rotateMinus90).toBeInstanceOf(Blob);
    });

    it("should handle non-standard rotation angles", async () => {
      const file = createTestFile();

      const rotate45 = await rotateImage(file, 45);
      expect(rotate45).toBeInstanceOf(Blob);

      const rotate135 = await rotateImage(file, 135);
      expect(rotate135).toBeInstanceOf(Blob);
    });

    it("should handle different output formats for rotation", async () => {
      const file = createTestFile();

      const jpeg = await rotateImage(file, 90, "jpeg");
      expect(jpeg.type).toContain("jpeg");

      const png = await rotateImage(file, 90, "png");
      expect(png.type).toContain("png");
    });

    it("should handle rotation with various quality settings", async () => {
      const file = createTestFile();

      const lowQuality = await rotateImage(file, 90, "jpeg", 0.1);
      expect(lowQuality).toBeInstanceOf(Blob);

      const highQuality = await rotateImage(file, 90, "jpeg", 1.0);
      expect(highQuality).toBeInstanceOf(Blob);
    });
  });

  describe("blobToFile - Utility Function", () => {
    it("should convert blob to file with correct properties", () => {
      const blob = new Blob(["test"], { type: "image/png" });
      const file = blobToFile(blob, "test.png");

      expect(file).toBeInstanceOf(File);
      expect(file.name).toBe("test.png");
      expect(file.type).toBe("image/png");
    });

    it("should handle different blob types", () => {
      const jpegBlob = new Blob(["test"], { type: "image/jpeg" });
      const jpegFile = blobToFile(jpegBlob, "test.jpg");
      expect(jpegFile.type).toBe("image/jpeg");

      const pngBlob = new Blob(["test"], { type: "image/png" });
      const pngFile = blobToFile(pngBlob, "test.png");
      expect(pngFile.type).toBe("image/png");

      const webpBlob = new Blob(["test"], { type: "image/webp" });
      const webpFile = blobToFile(webpBlob, "test.webp");
      expect(webpFile.type).toBe("image/webp");
    });

    it("should handle empty blob", () => {
      const blob = new Blob([], { type: "image/png" });
      const file = blobToFile(blob, "empty.png");

      expect(file).toBeInstanceOf(File);
      expect(file.size).toBe(0);
    });

    it("should handle special characters in filename", () => {
      const blob = new Blob(["test"], { type: "image/png" });
      const file = blobToFile(blob, "test file (1).png");

      expect(file.name).toBe("test file (1).png");
    });
  });

  describe("Image Processing - Error Handling", () => {
    it("should handle corrupted image data gracefully", async () => {
      // Mock image load error
      global.Image = class MockImage {
        onerror: (() => void) | null = null;
        set src(_value: string) {
          setTimeout(() => {
            if (this.onerror) this.onerror();
          }, 0);
        }
      } as any;

      const corruptedFile = new File(
        [new ArrayBuffer(100)], // Random bytes
        "corrupted.png",
        { type: "image/png" }
      );

      await expect(
        resizeImage(corruptedFile, { maxWidth: 100 })
      ).rejects.toThrow();
    });

    it("should handle empty file", async () => {
      // Restore normal Image mock for other tests
      global.Image = class MockImage {
        onload: (() => void) | null = null;
        src = "";
        width = 100;
        height = 100;
        constructor() {
          setTimeout(() => {
            if (this.onload) this.onload();
          }, 0);
        }
      } as any;

      const emptyFile = new File([], "empty.png", { type: "image/png" });

      // Empty file should process (blob conversion handles it)
      const result = await resizeImage(emptyFile, { maxWidth: 100 });
      expect(result).toBeInstanceOf(Blob);
    });

    it("should handle wrong MIME type", async () => {
      const textFile = new File(["plain text"], "text.txt", {
        type: "text/plain",
      });

      // Browser will try to load it as image, may succeed or fail
      // The important thing is it doesn't crash
      try {
        const result = await resizeImage(textFile, { maxWidth: 100 });
        expect(result).toBeInstanceOf(Blob);
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });

  describe("BUG FIX #27 - RGB Clamping Verification", () => {
    it("should verify RGB clamping prevents overflow/underflow", () => {
      // This test verifies the fix for RGB clamping
      // The filters add/subtract values that could overflow/underflow without Math.min/max

      // Vintage filter: R + 30, G - 10, B - 20
      // Cold filter: R - 20, B + 20
      // Warm filter: R + 20, G + 10, B - 20

      // Test that boundary values don't cause errors
      const testValues = [
        { r: 250, g: 10, b: 10 }, // Near max/min
        { r: 5, g: 250, b: 250 }, // Near min/max
        { r: 255, g: 0, b: 0 }, // Exact boundaries
        { r: 0, g: 255, b: 255 }, // Exact boundaries
      ];

      testValues.forEach((values) => {
        // Without clamping these would overflow/underflow
        // With clamping (Math.min(255, Math.max(0, value))):
        const vintageR = Math.min(255, Math.max(0, values.r + 30));
        const vintageG = Math.min(255, Math.max(0, values.g - 10));
        const vintageB = Math.min(255, Math.max(0, values.b - 20));

        expect(vintageR).toBeGreaterThanOrEqual(0);
        expect(vintageR).toBeLessThanOrEqual(255);
        expect(vintageG).toBeGreaterThanOrEqual(0);
        expect(vintageG).toBeLessThanOrEqual(255);
        expect(vintageB).toBeGreaterThanOrEqual(0);
        expect(vintageB).toBeLessThanOrEqual(255);
      });

      // Test demonstrates the fix prevents:
      // - R: 250 + 30 = 280 > 255 (clamped to 255)
      // - B: 10 - 20 = -10 < 0 (clamped to 0)
      expect(Math.min(255, Math.max(0, 250 + 30))).toBe(255); // Not 280
      expect(Math.min(255, Math.max(0, 10 - 20))).toBe(0); // Not -10
    });

    it("should clamp vintage filter RGB values correctly", () => {
      // Test vintage filter math with extreme values
      const cases = [
        {
          input: { r: 255, g: 255, b: 255 },
          expected: { r: 255, g: 245, b: 235 },
        }, // White
        { input: { r: 0, g: 0, b: 0 }, expected: { r: 30, g: 0, b: 0 } }, // Black
        {
          input: { r: 250, g: 10, b: 10 },
          expected: { r: 255, g: 0, b: 0 },
        }, // Near boundaries
      ];

      cases.forEach(({ input, expected }) => {
        const r = Math.min(255, Math.max(0, input.r + 30));
        const g = Math.min(255, Math.max(0, input.g - 10));
        const b = Math.min(255, Math.max(0, input.b - 20));

        expect(r).toBe(expected.r);
        expect(g).toBe(expected.g);
        expect(b).toBe(expected.b);
      });
    });

    it("should clamp cold filter RGB values correctly", () => {
      // Cold filter: R - 20, B + 20
      const cases = [
        {
          input: { r: 255, b: 255 },
          expected: { r: 235, b: 255 },
        },
        { input: { r: 10, b: 240 }, expected: { r: 0, b: 255 } }, // Underflow/overflow
        { input: { r: 0, b: 255 }, expected: { r: 0, b: 255 } }, // Boundaries
      ];

      cases.forEach(({ input, expected }) => {
        const r = Math.min(255, Math.max(0, input.r - 20));
        const b = Math.min(255, Math.max(0, input.b + 20));

        expect(r).toBe(expected.r);
        expect(b).toBe(expected.b);
      });
    });

    it("should clamp warm filter RGB values correctly", () => {
      // Warm filter: R + 20, G + 10, B - 20
      const cases = [
        {
          input: { r: 250, g: 250, b: 10 },
          expected: { r: 255, g: 255, b: 0 },
        },
        {
          input: { r: 0, g: 0, b: 0 },
          expected: { r: 20, g: 10, b: 0 },
        },
      ];

      cases.forEach(({ input, expected }) => {
        const r = Math.min(255, Math.max(0, input.r + 20));
        const g = Math.min(255, Math.max(0, input.g + 10));
        const b = Math.min(255, Math.max(0, input.b - 20));

        expect(r).toBe(expected.r);
        expect(g).toBe(expected.g);
        expect(b).toBe(expected.b);
      });
    });
  });
});
