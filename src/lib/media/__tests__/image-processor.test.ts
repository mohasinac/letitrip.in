/**
 * Tests for Image Processing Utilities
 */

import type { CropArea, ImageProcessingOptions } from "@/types/media";
import { cropImage, resizeImage } from "../image-processor";

// Mock canvas and Image
const mockCanvas = {
  width: 0,
  height: 0,
  getContext: jest.fn(),
  toBlob: jest.fn(),
};

const mockContext = {
  drawImage: jest.fn(),
  rotate: jest.fn(),
  translate: jest.fn(),
  filter: jest.fn(),
  getImageData: jest.fn(),
  putImageData: jest.fn(),
};

const mockImage = {
  src: "",
  width: 1920,
  height: 1080,
  onload: null as any,
  onerror: null as any,
};

beforeAll(() => {
  // Mock document.createElement
  global.document.createElement = jest.fn((tag: string) => {
    if (tag === "canvas") {
      return mockCanvas as any;
    }
    if (tag === "img") {
      return { ...mockImage } as any;
    }
    return {} as any;
  });

  // Mock URL.createObjectURL and revokeObjectURL
  global.URL.createObjectURL = jest.fn(() => "blob:mock-url");
  global.URL.revokeObjectURL = jest.fn();

  // Setup canvas context mock
  mockCanvas.getContext.mockReturnValue(mockContext);
});

beforeEach(() => {
  jest.clearAllMocks();
  mockCanvas.toBlob.mockImplementation((callback: any) => {
    callback(new Blob(["mock"], { type: "image/jpeg" }));
  });
});

describe("Image Processor", () => {
  describe("resizeImage", () => {
    it("should resize image maintaining aspect ratio", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const options: ImageProcessingOptions = {
        maxWidth: 800,
        maxHeight: 600,
        quality: 0.9,
        format: "jpeg",
        maintainAspectRatio: true,
      };

      const promise = resizeImage(file, options);

      // Trigger image load
      const createElement = document.createElement as jest.Mock;
      const imgCall = createElement.mock.calls.find(
        (call: any) => call[0] === "img"
      );
      if (imgCall) {
        const img = createElement.mock.results.find(
          (r: any) => r.value.onload
        )?.value;
        if (img?.onload) {
          img.onload();
        }
      }

      const blob = await promise;
      expect(blob).toBeInstanceOf(Blob);
      expect(mockContext.drawImage).toHaveBeenCalled();
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should handle maxWidth constraint", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const options: ImageProcessingOptions = {
        maxWidth: 800,
        maintainAspectRatio: true,
      };

      const promise = resizeImage(file, options);

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.onload();
      }

      await promise;

      // Verify canvas width is set to maxWidth
      expect(mockCanvas.width).toBeLessThanOrEqual(800);
    });

    it("should handle maxHeight constraint", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const options: ImageProcessingOptions = {
        maxHeight: 600,
        maintainAspectRatio: true,
      };

      const promise = resizeImage(file, options);

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.onload();
      }

      await promise;

      expect(mockCanvas.height).toBeLessThanOrEqual(600);
    });

    it("should handle image load error", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const options: ImageProcessingOptions = { maxWidth: 800 };

      const promise = resizeImage(file, options);

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onerror
      )?.value;
      if (img?.onerror) {
        img.onerror();
      }

      await expect(promise).rejects.toThrow("Failed to load image");
      expect(URL.revokeObjectURL).toHaveBeenCalled();
    });

    it("should handle canvas context error", async () => {
      mockCanvas.getContext.mockReturnValueOnce(null);

      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const options: ImageProcessingOptions = { maxWidth: 800 };

      const promise = resizeImage(file, options);

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.onload();
      }

      await expect(promise).rejects.toThrow("Failed to get canvas context");
    });

    it("should handle blob creation error", async () => {
      mockCanvas.toBlob.mockImplementationOnce((callback: any) => {
        callback(null);
      });

      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const options: ImageProcessingOptions = { maxWidth: 800 };

      const promise = resizeImage(file, options);

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.onload();
      }

      await expect(promise).rejects.toThrow("Failed to create blob");
    });

    it("should support different image formats", async () => {
      const formats: Array<"jpeg" | "png" | "webp"> = ["jpeg", "png", "webp"];

      for (const format of formats) {
        jest.clearAllMocks();

        const file = new File(["mock"], `test.${format}`, {
          type: `image/${format}`,
        });
        const options: ImageProcessingOptions = {
          maxWidth: 800,
          format,
          quality: 0.8,
        };

        mockCanvas.toBlob.mockImplementationOnce(
          (callback: any, mimeType: string) => {
            expect(mimeType).toBe(`image/${format}`);
            callback(new Blob(["mock"], { type: mimeType }));
          }
        );

        const promise = resizeImage(file, options);

        const createElement = document.createElement as jest.Mock;
        const img = createElement.mock.results.find(
          (r: any) => r.value.onload
        )?.value;
        if (img?.onload) {
          img.onload();
        }

        await promise;
      }
    });

    it("should respect quality parameter", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const options: ImageProcessingOptions = {
        maxWidth: 800,
        quality: 0.5,
      };

      mockCanvas.toBlob.mockImplementationOnce(
        (callback: any, mimeType: string, quality: number) => {
          expect(quality).toBe(0.5);
          callback(new Blob(["mock"], { type: mimeType }));
        }
      );

      const promise = resizeImage(file, options);

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.onload();
      }

      await promise;
    });
  });

  describe("cropImage", () => {
    it("should crop image to specified area", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const cropArea: CropArea = {
        x: 100,
        y: 100,
        width: 400,
        height: 300,
      };

      const promise = cropImage(file, cropArea);

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.onload();
      }

      const blob = await promise;
      expect(blob).toBeInstanceOf(Blob);
      expect(mockCanvas.width).toBe(400);
      expect(mockCanvas.height).toBe(300);
      expect(mockContext.drawImage).toHaveBeenCalledWith(
        expect.anything(),
        100,
        100,
        400,
        300,
        0,
        0,
        400,
        300
      );
    });

    it("should handle different output formats", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const cropArea: CropArea = { x: 0, y: 0, width: 200, height: 200 };

      mockCanvas.toBlob.mockImplementationOnce(
        (callback: any, mimeType: string) => {
          expect(mimeType).toBe("image/png");
          callback(new Blob(["mock"], { type: mimeType }));
        }
      );

      const promise = cropImage(file, cropArea, "png", 0.9);

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.onload();
      }

      await promise;
    });

    it("should handle crop errors gracefully", async () => {
      mockCanvas.getContext.mockReturnValueOnce(null);

      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const cropArea: CropArea = { x: 0, y: 0, width: 200, height: 200 };

      const promise = cropImage(file, cropArea);

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.onload();
      }

      await expect(promise).rejects.toThrow("Failed to get canvas context");
    });
  });

  describe("Edge Cases", () => {
    it("should handle very large images", async () => {
      const createElement = document.createElement as jest.Mock;
      createElement.mockImplementation((tag: string) => {
        if (tag === "img") {
          return {
            ...mockImage,
            width: 8000,
            height: 6000,
          } as any;
        }
        return mockCanvas as any;
      });

      const file = new File(["mock"], "large.jpg", { type: "image/jpeg" });
      const options: ImageProcessingOptions = {
        maxWidth: 1920,
        maxHeight: 1080,
        maintainAspectRatio: true,
      };

      const promise = resizeImage(file, options);

      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.onload();
      }

      const blob = await promise;
      expect(blob).toBeInstanceOf(Blob);
    });

    it("should handle small crop areas", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const cropArea: CropArea = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
      };

      const promise = cropImage(file, cropArea);

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.onload();
      }

      const blob = await promise;
      expect(blob).toBeInstanceOf(Blob);
      expect(mockCanvas.width).toBe(10);
      expect(mockCanvas.height).toBe(10);
    });

    it("should handle zero quality parameter", async () => {
      const file = new File(["mock"], "test.jpg", { type: "image/jpeg" });
      const options: ImageProcessingOptions = {
        maxWidth: 800,
        quality: 0,
      };

      mockCanvas.toBlob.mockImplementationOnce(
        (callback: any, mimeType: string, quality: number) => {
          expect(quality).toBe(0);
          callback(new Blob(["mock"], { type: mimeType }));
        }
      );

      const promise = resizeImage(file, options);

      const createElement = document.createElement as jest.Mock;
      const img = createElement.mock.results.find(
        (r: any) => r.value.onload
      )?.value;
      if (img?.onload) {
        img.onload();
      }

      await promise;
    });
  });
});
