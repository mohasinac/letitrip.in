/**
 * Media Service Unit Tests
 * Tests file upload, validation, and media management functionality
 */

import { apiService } from "@/services/api.service";
import { mediaService, type MediaItem } from "@/services/media.service";

jest.mock("@/services/api.service");

// Mock fetch for file uploads
global.fetch = jest.fn();

describe("MediaService", () => {
  const mockFile = new File(["content"], "test.jpg", { type: "image/jpeg" });
  const mockVideoFile = new File(["video"], "test.mp4", { type: "video/mp4" });

  const mockMediaItem: MediaItem = {
    id: "media-1",
    url: "https://storage.example.com/test.jpg",
    thumbnailUrl: "https://storage.example.com/test-thumb.jpg",
    type: "image",
    size: 1024000,
    mimeType: "image/jpeg",
    slug: "test-image",
    description: "Test image",
    context: "product",
    contextId: "prod-1",
    uploadedBy: "user-1",
    createdAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe("upload", () => {
    it("should upload single file successfully", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          url: "https://storage.example.com/test.jpg",
          id: "media-1",
          thumbnailUrl: "https://storage.example.com/test-thumb.jpg",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await mediaService.upload({
        file: mockFile,
        context: "product",
        contextId: "prod-1",
        slug: "test-product",
        description: "Product image",
      });

      expect(result.url).toBe("https://storage.example.com/test.jpg");
      expect(result.id).toBe("media-1");
      expect(result.thumbnailUrl).toBe(
        "https://storage.example.com/test-thumb.jpg"
      );
      expect(global.fetch).toHaveBeenCalledWith("/api/media/upload", {
        method: "POST",
        body: expect.any(FormData),
      });
    });

    it("should upload without optional fields", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          url: "https://storage.example.com/test.jpg",
          id: "media-2",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await mediaService.upload({
        file: mockFile,
        context: "avatar",
      });

      expect(result.url).toBeDefined();
      expect(result.id).toBe("media-2");
    });

    it("should handle upload failure", async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: "Upload failed",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        mediaService.upload({
          file: mockFile,
          context: "product",
        })
      ).rejects.toThrow("Upload failed");
    });

    it("should handle API error response", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: false,
          error: "File too large",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        mediaService.upload({
          file: mockFile,
          context: "product",
        })
      ).rejects.toThrow("File too large");
    });

    it("should handle network errors", async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(
        mediaService.upload({
          file: mockFile,
          context: "product",
        })
      ).rejects.toThrow("Network error");
    });

    it("should handle malformed JSON response", async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        mediaService.upload({
          file: mockFile,
          context: "product",
        })
      ).rejects.toThrow("Failed to upload media");
    });
  });

  describe("uploadMultiple", () => {
    it("should upload multiple files", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          uploads: [
            { url: "url1.jpg", id: "media-1" },
            { url: "url2.jpg", id: "media-2" },
          ],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const files = [
        mockFile,
        new File(["content2"], "test2.jpg", { type: "image/jpeg" }),
      ];
      const result = await mediaService.uploadMultiple(
        files,
        "product",
        "prod-1"
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("media-1");
      expect(result[1].id).toBe("media-2");
    });

    it("should handle empty file array", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          uploads: [],
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await mediaService.uploadMultiple([], "product");

      expect(result).toEqual([]);
    });

    it("should handle partial upload failures", async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: "Some files failed",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        mediaService.uploadMultiple([mockFile], "product")
      ).rejects.toThrow("Some files failed");
    });
  });

  describe("getById", () => {
    it("should get media by ID", async () => {
      (apiService.get as jest.Mock).mockResolvedValue(mockMediaItem);

      const result = await mediaService.getById("media-1");

      expect(result).toEqual(mockMediaItem);
      expect(apiService.get).toHaveBeenCalledWith("/media/media-1");
    });

    it("should handle media not found", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Media not found")
      );

      await expect(mediaService.getById("invalid")).rejects.toThrow(
        "Media not found"
      );
    });
  });

  describe("updateMetadata", () => {
    it("should update media metadata", async () => {
      const updates = {
        slug: "updated-slug",
        description: "Updated description",
      };

      (apiService.patch as jest.Mock).mockResolvedValue({
        ...mockMediaItem,
        ...updates,
      });

      const result = await mediaService.updateMetadata("media-1", updates);

      expect(result.slug).toBe("updated-slug");
      expect(result.description).toBe("Updated description");
      expect(apiService.patch).toHaveBeenCalledWith("/media/media-1", updates);
    });

    it("should handle unauthorized updates", async () => {
      (apiService.patch as jest.Mock).mockRejectedValue(new Error("Forbidden"));

      await expect(
        mediaService.updateMetadata("media-1", { slug: "new" })
      ).rejects.toThrow("Forbidden");
    });
  });

  describe("delete", () => {
    it("should delete media by ID", async () => {
      (apiService.delete as jest.Mock).mockResolvedValue({
        message: "Deleted successfully",
      });

      const result = await mediaService.delete("media-1");

      expect(result.message).toBe("Deleted successfully");
      expect(apiService.delete).toHaveBeenCalledWith("/media/media-1");
    });

    it("should handle deletion errors", async () => {
      (apiService.delete as jest.Mock).mockRejectedValue(
        new Error("Delete failed")
      );

      await expect(mediaService.delete("media-1")).rejects.toThrow(
        "Delete failed"
      );
    });
  });

  describe("deleteByUrl", () => {
    it("should delete media by URL", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          message: "Deleted",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await mediaService.deleteByUrl(
        "https://storage.example.com/test.jpg"
      );

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith("/api/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://storage.example.com/test.jpg" }),
      });
    });

    it("should handle delete by URL failure", async () => {
      const mockResponse = {
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: "File not found",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        mediaService.deleteByUrl("https://example.com/missing.jpg")
      ).rejects.toThrow("File not found");
    });
  });

  describe("deleteByPath", () => {
    it("should delete media by path", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          message: "Deleted",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await mediaService.deleteByPath(
        "uploads/products/test.jpg"
      );

      expect(result.success).toBe(true);
      expect(global.fetch).toHaveBeenCalledWith("/api/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "uploads/products/test.jpg" }),
      });
    });
  });

  describe("getByContext", () => {
    it("should get media by context", async () => {
      (apiService.get as jest.Mock).mockResolvedValue([mockMediaItem]);

      const result = await mediaService.getByContext("product", "prod-1");

      expect(result).toHaveLength(1);
      expect(apiService.get).toHaveBeenCalledWith(
        "/media/context/product/prod-1"
      );
    });

    it("should return empty array for no media", async () => {
      (apiService.get as jest.Mock).mockResolvedValue([]);

      const result = await mediaService.getByContext("product", "prod-2");

      expect(result).toEqual([]);
    });
  });

  describe("getUploadUrl", () => {
    it("should generate signed upload URL", async () => {
      (apiService.post as jest.Mock).mockResolvedValue({
        uploadUrl: "https://storage.example.com/upload?signature=abc",
        fileUrl: "https://storage.example.com/file.jpg",
      });

      const result = await mediaService.getUploadUrl(
        "test.jpg",
        "image/jpeg",
        "product"
      );

      expect(result.uploadUrl).toBeDefined();
      expect(result.fileUrl).toBeDefined();
      expect(apiService.post).toHaveBeenCalledWith("/media/upload-url", {
        fileName: "test.jpg",
        fileType: "image/jpeg",
        context: "product",
      });
    });
  });

  describe("confirmUpload", () => {
    it("should confirm upload after using signed URL", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockMediaItem);

      const result = await mediaService.confirmUpload(
        "https://storage.example.com/file.jpg",
        {
          context: "product",
          contextId: "prod-1",
          slug: "test",
          description: "Test",
        }
      );

      expect(result).toEqual(mockMediaItem);
      expect(apiService.post).toHaveBeenCalledWith("/media/confirm-upload", {
        fileUrl: "https://storage.example.com/file.jpg",
        context: "product",
        contextId: "prod-1",
        slug: "test",
        description: "Test",
      });
    });
  });

  describe("validateFile", () => {
    it("should validate file within size limit", () => {
      const result = mediaService.validateFile(mockFile, 5, [
        "image/jpeg",
        "image/png",
      ]);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject file exceeding size limit", () => {
      const largeFile = new File(["x".repeat(6 * 1024 * 1024)], "large.jpg", {
        type: "image/jpeg",
      });

      const result = mediaService.validateFile(largeFile, 5, ["image/jpeg"]);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds 5MB limit");
    });

    it("should reject file with invalid type", () => {
      const invalidFile = new File(["content"], "test.txt", {
        type: "text/plain",
      });

      const result = mediaService.validateFile(invalidFile, 5, ["image/jpeg"]);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("not allowed");
    });

    it("should validate multiple allowed types", () => {
      const result = mediaService.validateFile(mockFile, 5, [
        "image/jpeg",
        "image/png",
        "image/webp",
      ]);

      expect(result.valid).toBe(true);
    });

    it("should handle zero size files", () => {
      const emptyFile = new File([], "empty.jpg", { type: "image/jpeg" });

      const result = mediaService.validateFile(emptyFile, 5, ["image/jpeg"]);

      expect(result.valid).toBe(true);
    });
  });

  describe("getConstraints", () => {
    it("should get product constraints", () => {
      const constraints = mediaService.getConstraints("product");

      expect(constraints.maxSizeMB).toBe(5);
      expect(constraints.allowedTypes).toContain("image/jpeg");
      expect(constraints.allowedTypes).toContain("video/mp4");
      expect(constraints.maxFiles).toBe(10);
    });

    it("should get avatar constraints", () => {
      const constraints = mediaService.getConstraints("avatar");

      expect(constraints.maxSizeMB).toBe(1);
      expect(constraints.allowedTypes).not.toContain("video/mp4");
      expect(constraints.maxFiles).toBe(1);
    });

    it("should get shop constraints", () => {
      const constraints = mediaService.getConstraints("shop");

      expect(constraints.maxSizeMB).toBe(2);
      expect(constraints.maxFiles).toBe(2);
    });

    it("should get auction constraints", () => {
      const constraints = mediaService.getConstraints("auction");

      expect(constraints.maxSizeMB).toBe(5);
      expect(constraints.maxFiles).toBe(10);
    });

    it("should get review constraints", () => {
      const constraints = mediaService.getConstraints("review");

      expect(constraints.maxSizeMB).toBe(3);
      expect(constraints.maxFiles).toBe(5);
    });

    it("should get return constraints", () => {
      const constraints = mediaService.getConstraints("return");

      expect(constraints.maxSizeMB).toBe(3);
      expect(constraints.maxFiles).toBe(5);
    });

    it("should get category constraints", () => {
      const constraints = mediaService.getConstraints("category");

      expect(constraints.maxSizeMB).toBe(2);
      expect(constraints.maxFiles).toBe(1);
    });

    it("should default to product constraints for unknown context", () => {
      const constraints = mediaService.getConstraints("unknown");

      expect(constraints.maxSizeMB).toBe(5);
      expect(constraints.maxFiles).toBe(10);
    });
  });

  describe("Edge Cases", () => {
    it("should handle video file upload", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          url: "https://storage.example.com/video.mp4",
          id: "media-video-1",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await mediaService.upload({
        file: mockVideoFile,
        context: "product",
      });

      expect(result.url).toContain(".mp4");
    });

    it("should handle special characters in filename", async () => {
      const specialFile = new File(["content"], "test @#$%.jpg", {
        type: "image/jpeg",
      });

      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          url: "https://storage.example.com/test.jpg",
          id: "media-special",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await expect(
        mediaService.upload({
          file: specialFile,
          context: "product",
        })
      ).resolves.toBeDefined();
    });

    it("should handle very long filenames", () => {
      const longName = "x".repeat(300) + ".jpg";
      const longFile = new File(["content"], longName, { type: "image/jpeg" });

      const result = mediaService.validateFile(longFile, 5, ["image/jpeg"]);

      expect(result.valid).toBe(true);
    });

    it("should handle concurrent uploads", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          url: "https://storage.example.com/test.jpg",
          id: "media-1",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const promises = [
        mediaService.upload({ file: mockFile, context: "product" }),
        mediaService.upload({ file: mockFile, context: "avatar" }),
        mediaService.upload({ file: mockFile, context: "review" }),
      ];

      await expect(Promise.all(promises)).resolves.toBeDefined();
    });

    it("should validate file at exact size limit", () => {
      const exactSizeFile = new File(
        ["x".repeat(5 * 1024 * 1024)],
        "exact.jpg",
        {
          type: "image/jpeg",
        }
      );

      const result = mediaService.validateFile(exactSizeFile, 5, [
        "image/jpeg",
      ]);

      expect(result.valid).toBe(true);
    });

    it("should handle missing thumbnail in response", async () => {
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          url: "https://storage.example.com/test.jpg",
          id: "media-1",
          // No thumbnailUrl
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await mediaService.upload({
        file: mockFile,
        context: "product",
      });

      expect(result.thumbnailUrl).toBeUndefined();
    });
  });

  describe("Integration Scenarios", () => {
    it("should complete full upload workflow", async () => {
      // 1. Validate file
      const validation = mediaService.validateFile(mockFile, 5, ["image/jpeg"]);
      expect(validation.valid).toBe(true);

      // 2. Get constraints
      const constraints = mediaService.getConstraints("product");
      expect(constraints.maxSizeMB).toBe(5);

      // 3. Upload file
      const mockResponse = {
        ok: true,
        json: jest.fn().mockResolvedValue({
          success: true,
          url: "https://storage.example.com/test.jpg",
          id: "media-1",
        }),
      };

      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      const result = await mediaService.upload({
        file: mockFile,
        context: "product",
      });

      expect(result.id).toBeDefined();
    });

    it("should handle validation failure before upload", () => {
      const largeFile = new File(["x".repeat(10 * 1024 * 1024)], "huge.jpg", {
        type: "image/jpeg",
      });

      const validation = mediaService.validateFile(largeFile, 5, [
        "image/jpeg",
      ]);

      expect(validation.valid).toBe(false);
      // Should not attempt upload
    });
  });
});
