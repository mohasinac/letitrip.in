import { apiService } from "../api.service";
import type { MediaItem, UpdateMediaData } from "../media.service";
import { mediaService } from "../media.service";

// Mock dependencies
jest.mock("../api.service");

// Mock fetch globally
global.fetch = jest.fn();

describe("MediaService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("upload", () => {
    it("should upload a single media file successfully", async () => {
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });
      const mockResponse = {
        success: true,
        url: "https://storage.com/test.jpg",
        id: "media1",
        thumbnailUrl: "https://storage.com/test-thumb.jpg",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await mediaService.upload({
        file: mockFile,
        context: "product",
        contextId: "prod1",
        slug: "test-product",
        description: "Test image",
      });

      expect(global.fetch).toHaveBeenCalledWith("/api/media/upload", {
        method: "POST",
        body: expect.any(FormData),
      });
      expect(result).toEqual({
        url: "https://storage.com/test.jpg",
        id: "media1",
        thumbnailUrl: "https://storage.com/test-thumb.jpg",
      });
    });

    it("should upload without optional fields", async () => {
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });
      const mockResponse = {
        success: true,
        url: "https://storage.com/test.jpg",
        id: "media1",
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await mediaService.upload({
        file: mockFile,
        context: "avatar",
      });

      expect(result.url).toBe("https://storage.com/test.jpg");
      expect(result.id).toBe("media1");
    });

    it("should throw error when upload fails with non-ok response", async () => {
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Upload failed" }),
      });

      await expect(
        mediaService.upload({
          file: mockFile,
          context: "product",
        })
      ).rejects.toThrow("Upload failed");
    });

    it("should throw error when response indicates failure", async () => {
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, error: "Invalid file type" }),
      });

      await expect(
        mediaService.upload({
          file: mockFile,
          context: "product",
        })
      ).rejects.toThrow("Invalid file type");
    });

    it("should handle network errors", async () => {
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      (global.fetch as jest.Mock).mockRejectedValue(new Error("Network error"));

      await expect(
        mediaService.upload({
          file: mockFile,
          context: "product",
        })
      ).rejects.toThrow("Network error");
    });

    it("should handle malformed JSON response on error", async () => {
      const mockFile = new File(["content"], "test.jpg", {
        type: "image/jpeg",
      });

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      });

      await expect(
        mediaService.upload({
          file: mockFile,
          context: "product",
        })
      ).rejects.toThrow("Failed to upload media");
    });
  });

  describe("uploadMultiple", () => {
    it("should upload multiple files successfully", async () => {
      const mockFiles = [
        new File(["content1"], "test1.jpg", { type: "image/jpeg" }),
        new File(["content2"], "test2.jpg", { type: "image/jpeg" }),
      ];
      const mockResponse = {
        success: true,
        uploads: [
          { url: "https://storage.com/test1.jpg", id: "media1" },
          { url: "https://storage.com/test2.jpg", id: "media2" },
        ],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await mediaService.uploadMultiple(
        mockFiles,
        "product",
        "prod1"
      );

      expect(global.fetch).toHaveBeenCalledWith("/api/media/upload-multiple", {
        method: "POST",
        body: expect.any(FormData),
      });
      expect(result).toEqual(mockResponse.uploads);
    });

    it("should upload multiple files without contextId", async () => {
      const mockFiles = [
        new File(["content1"], "test1.jpg", { type: "image/jpeg" }),
      ];
      const mockResponse = {
        success: true,
        uploads: [{ url: "https://storage.com/test1.jpg", id: "media1" }],
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await mediaService.uploadMultiple(mockFiles, "review");

      expect(result).toHaveLength(1);
    });

    it("should throw error when multiple upload fails", async () => {
      const mockFiles = [
        new File(["content1"], "test1.jpg", { type: "image/jpeg" }),
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Upload failed" }),
      });

      await expect(
        mediaService.uploadMultiple(mockFiles, "product")
      ).rejects.toThrow("Upload failed");
    });

    it("should return empty array when no uploads in response", async () => {
      const mockFiles = [
        new File(["content1"], "test1.jpg", { type: "image/jpeg" }),
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      });

      const result = await mediaService.uploadMultiple(mockFiles, "product");

      expect(result).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should fetch media by ID", async () => {
      const mockMedia: MediaItem = {
        id: "media1",
        url: "https://storage.com/test.jpg",
        type: "image",
        size: 1024,
        mimeType: "image/jpeg",
        context: "product",
        uploadedBy: "user1",
        createdAt: new Date(),
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockMedia);

      const result = await mediaService.getById("media1");

      expect(apiService.get).toHaveBeenCalledWith("/media/media1");
      expect(result).toEqual(mockMedia);
    });

    it("should throw error when media not found", async () => {
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
      const updateData: UpdateMediaData = {
        slug: "updated-slug",
        description: "Updated description",
      };
      const mockUpdatedMedia: MediaItem = {
        id: "media1",
        url: "https://storage.com/test.jpg",
        slug: "updated-slug",
        description: "Updated description",
        type: "image",
        size: 1024,
        mimeType: "image/jpeg",
        context: "product",
        uploadedBy: "user1",
        createdAt: new Date(),
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockUpdatedMedia);

      const result = await mediaService.updateMetadata("media1", updateData);

      expect(apiService.patch).toHaveBeenCalledWith(
        "/media/media1",
        updateData
      );
      expect(result).toEqual(mockUpdatedMedia);
    });

    it("should update only slug", async () => {
      const updateData: UpdateMediaData = {
        slug: "new-slug",
      };

      (apiService.patch as jest.Mock).mockResolvedValue({} as MediaItem);

      await mediaService.updateMetadata("media1", updateData);

      expect(apiService.patch).toHaveBeenCalledWith("/media/media1", {
        slug: "new-slug",
      });
    });
  });

  describe("delete", () => {
    it("should delete media by ID", async () => {
      const mockResponse = { message: "Media deleted successfully" };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await mediaService.delete("media1");

      expect(apiService.delete).toHaveBeenCalledWith("/media/media1");
      expect(result).toEqual(mockResponse);
    });

    it("should throw error when deletion fails", async () => {
      (apiService.delete as jest.Mock).mockRejectedValue(
        new Error("Deletion failed")
      );

      await expect(mediaService.delete("media1")).rejects.toThrow(
        "Deletion failed"
      );
    });
  });

  describe("deleteByUrl", () => {
    it("should delete media by URL", async () => {
      const mockResponse = { success: true, message: "Deleted" };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await mediaService.deleteByUrl(
        "https://storage.com/test.jpg"
      );

      expect(global.fetch).toHaveBeenCalledWith("/api/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: "https://storage.com/test.jpg" }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should throw error when URL deletion fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "File not found" }),
      });

      await expect(
        mediaService.deleteByUrl("https://storage.com/test.jpg")
      ).rejects.toThrow("File not found");
    });
  });

  describe("deleteByPath", () => {
    it("should delete media by path", async () => {
      const mockResponse = { success: true, message: "Deleted" };

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await mediaService.deleteByPath("products/test.jpg");

      expect(global.fetch).toHaveBeenCalledWith("/api/media/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: "products/test.jpg" }),
      });
      expect(result).toEqual(mockResponse);
    });

    it("should throw error when path deletion fails", async () => {
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Invalid path" }),
      });

      await expect(
        mediaService.deleteByPath("invalid/path.jpg")
      ).rejects.toThrow("Invalid path");
    });
  });

  describe("getByContext", () => {
    it("should fetch media by context", async () => {
      const mockMedia: MediaItem[] = [
        {
          id: "media1",
          url: "https://storage.com/test1.jpg",
          type: "image",
          size: 1024,
          mimeType: "image/jpeg",
          context: "product",
          contextId: "prod1",
          uploadedBy: "user1",
          createdAt: new Date(),
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockMedia);

      const result = await mediaService.getByContext("product", "prod1");

      expect(apiService.get).toHaveBeenCalledWith(
        "/media/context/product/prod1"
      );
      expect(result).toEqual(mockMedia);
    });

    it("should return empty array when no media found", async () => {
      (apiService.get as jest.Mock).mockResolvedValue([]);

      const result = await mediaService.getByContext("product", "prod1");

      expect(result).toEqual([]);
    });
  });

  describe("getUploadUrl", () => {
    it("should generate signed upload URL", async () => {
      const mockResponse = {
        uploadUrl: "https://storage.com/signed-url",
        fileUrl: "https://storage.com/file.jpg",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await mediaService.getUploadUrl(
        "test.jpg",
        "image/jpeg",
        "product"
      );

      expect(apiService.post).toHaveBeenCalledWith("/media/upload-url", {
        fileName: "test.jpg",
        fileType: "image/jpeg",
        context: "product",
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe("confirmUpload", () => {
    it("should confirm upload with metadata", async () => {
      const mockMedia: MediaItem = {
        id: "media1",
        url: "https://storage.com/test.jpg",
        type: "image",
        size: 1024,
        mimeType: "image/jpeg",
        context: "product",
        contextId: "prod1",
        uploadedBy: "user1",
        createdAt: new Date(),
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockMedia);

      const result = await mediaService.confirmUpload(
        "https://storage.com/test.jpg",
        {
          context: "product",
          contextId: "prod1",
          slug: "test-product",
          description: "Test image",
        }
      );

      expect(apiService.post).toHaveBeenCalledWith("/media/confirm-upload", {
        fileUrl: "https://storage.com/test.jpg",
        context: "product",
        contextId: "prod1",
        slug: "test-product",
        description: "Test image",
      });
      expect(result).toEqual(mockMedia);
    });
  });

  describe("validateFile", () => {
    it("should validate file within size limit", () => {
      const file = new File(["x".repeat(1024 * 1024)], "test.jpg", {
        type: "image/jpeg",
      });

      const result = mediaService.validateFile(file, 2, ["image/jpeg"]);

      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject file exceeding size limit", () => {
      const file = new File(["x".repeat(6 * 1024 * 1024)], "test.jpg", {
        type: "image/jpeg",
      });

      const result = mediaService.validateFile(file, 5, ["image/jpeg"]);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("exceeds 5MB limit");
    });

    it("should reject file with invalid type", () => {
      const file = new File(["content"], "test.pdf", {
        type: "application/pdf",
      });

      const result = mediaService.validateFile(file, 5, ["image/jpeg"]);

      expect(result.valid).toBe(false);
      expect(result.error).toContain("not allowed");
    });

    it("should validate file with allowed type", () => {
      const file = new File(["content"], "test.png", { type: "image/png" });

      const result = mediaService.validateFile(file, 5, [
        "image/jpeg",
        "image/png",
      ]);

      expect(result.valid).toBe(true);
    });
  });

  describe("getConstraints", () => {
    it("should return product constraints", () => {
      const constraints = mediaService.getConstraints("product");

      expect(constraints).toEqual({
        maxSizeMB: 5,
        allowedTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
        maxFiles: 10,
      });
    });

    it("should return shop constraints", () => {
      const constraints = mediaService.getConstraints("shop");

      expect(constraints).toEqual({
        maxSizeMB: 2,
        allowedTypes: ["image/jpeg", "image/png", "image/webp"],
        maxFiles: 2,
      });
    });

    it("should return avatar constraints", () => {
      const constraints = mediaService.getConstraints("avatar");

      expect(constraints).toEqual({
        maxSizeMB: 1,
        allowedTypes: ["image/jpeg", "image/png", "image/webp"],
        maxFiles: 1,
      });
    });

    it("should return auction constraints", () => {
      const constraints = mediaService.getConstraints("auction");

      expect(constraints).toEqual({
        maxSizeMB: 5,
        allowedTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
        maxFiles: 10,
      });
    });

    it("should return review constraints", () => {
      const constraints = mediaService.getConstraints("review");

      expect(constraints).toEqual({
        maxSizeMB: 3,
        allowedTypes: ["image/jpeg", "image/png", "video/mp4"],
        maxFiles: 5,
      });
    });

    it("should return return constraints", () => {
      const constraints = mediaService.getConstraints("return");

      expect(constraints).toEqual({
        maxSizeMB: 3,
        allowedTypes: ["image/jpeg", "image/png", "video/mp4"],
        maxFiles: 5,
      });
    });

    it("should return category constraints", () => {
      const constraints = mediaService.getConstraints("category");

      expect(constraints).toEqual({
        maxSizeMB: 2,
        allowedTypes: ["image/jpeg", "image/png", "image/webp"],
        maxFiles: 1,
      });
    });

    it("should return default product constraints for unknown context", () => {
      const constraints = mediaService.getConstraints("unknown");

      expect(constraints).toEqual({
        maxSizeMB: 5,
        allowedTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
        maxFiles: 10,
      });
    });
  });
});
