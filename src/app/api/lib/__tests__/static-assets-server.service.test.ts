/**
 * Unit Tests for Static Assets Server Service
 */

import {
  deleteAsset,
  generateUploadUrl,
  getAssetMetadata,
  getDownloadUrl,
  listAssets,
  saveAssetMetadata,
  StaticAsset,
  updateAssetMetadata,
} from "../static-assets-server.service";

jest.mock("firebase-admin/storage");
jest.mock("../firebase/admin");

describe("Static Assets Server Service", () => {
  let mockBucket: any;
  let mockFile: any;
  let mockDb: any;
  let mockCollection: any;
  let mockDoc: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Storage
    mockFile = {
      getSignedUrl: jest.fn(),
      exists: jest.fn(),
      makePublic: jest.fn(),
      delete: jest.fn(),
    };

    mockBucket = {
      name: "test-bucket",
      file: jest.fn(() => mockFile),
    };

    const { getStorage } = require("firebase-admin/storage");
    (getStorage as jest.Mock).mockReturnValue({
      bucket: jest.fn(() => mockBucket),
    });

    // Mock Firestore
    mockDoc = {
      set: jest.fn(),
      get: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockCollection = {
      doc: jest.fn(() => mockDoc),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      get: jest.fn(),
    };

    mockDb = {
      collection: jest.fn(() => mockCollection),
    };

    const { getFirestoreAdmin } = require("../firebase/admin");
    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);
  });

  describe("generateUploadUrl", () => {
    it("should generate signed upload URL successfully", async () => {
      const mockUrl = "https://storage.googleapis.com/test-bucket/upload-url";
      mockFile.getSignedUrl.mockResolvedValue([mockUrl]);

      const result = await generateUploadUrl(
        "test-image.png",
        "image/png",
        "icon",
        "logos"
      );

      expect(result).toEqual({
        uploadUrl: mockUrl,
        assetId: expect.stringMatching(/-test-image\.png$/),
        storagePath: expect.stringContaining("static-assets/icon/logos/"),
      });

      expect(mockFile.getSignedUrl).toHaveBeenCalledWith({
        version: "v4",
        action: "write",
        expires: expect.any(Number),
        contentType: "image/png",
      });
    });

    it("should sanitize file names", async () => {
      mockFile.getSignedUrl.mockResolvedValue(["url"]);

      const result = await generateUploadUrl(
        "test file!@#$%^&*.png",
        "image/png",
        "icon"
      );

      // Regex replaces non-alphanumeric (except . and -) with single -
      // So "!@#$%^&*" becomes "--------" (8 hyphens)
      expect(result.assetId).toMatch(/test-file--------.png$/);
      expect(result.storagePath).toContain("test-file--------.png");
    });

    it("should use 'default' category when not provided", async () => {
      mockFile.getSignedUrl.mockResolvedValue(["url"]);

      const result = await generateUploadUrl("test.png", "image/png", "icon");

      expect(result.storagePath).toContain("/default/");
    });

    it("should generate unique paths with timestamps", async () => {
      mockFile.getSignedUrl.mockResolvedValue(["url"]);

      const result1 = await generateUploadUrl("test.png", "image/png", "icon");

      // Wait a tiny bit to ensure different timestamp
      await new Promise((resolve) => setTimeout(resolve, 2));

      const result2 = await generateUploadUrl("test.png", "image/png", "icon");

      expect(result1.storagePath).not.toBe(result2.storagePath);
      expect(result1.assetId).not.toBe(result2.assetId);
    });

    it("should handle storage errors", async () => {
      mockFile.getSignedUrl.mockRejectedValue(new Error("Storage error"));

      await expect(
        generateUploadUrl("test.png", "image/png", "icon")
      ).rejects.toThrow("Failed to generate upload URL");
    });

    it("should set 15 minute expiration", async () => {
      const beforeTime = Date.now();
      mockFile.getSignedUrl.mockResolvedValue(["url"]);

      await generateUploadUrl("test.png", "image/png", "icon");

      const call = mockFile.getSignedUrl.mock.calls[0][0];
      const expectedExpiry = beforeTime + 15 * 60 * 1000;
      const actualExpiry = call.expires;

      expect(actualExpiry).toBeGreaterThanOrEqual(expectedExpiry);
      expect(actualExpiry).toBeLessThanOrEqual(expectedExpiry + 1000); // 1 second tolerance
    });
  });

  describe("getDownloadUrl", () => {
    it("should return public URL for existing file", async () => {
      mockFile.exists.mockResolvedValue([true]);
      mockFile.makePublic.mockResolvedValue(undefined);

      const url = await getDownloadUrl("static-assets/icon/test.png");

      expect(url).toBe(
        "https://storage.googleapis.com/test-bucket/static-assets/icon/test.png"
      );
      expect(mockFile.exists).toHaveBeenCalled();
      expect(mockFile.makePublic).toHaveBeenCalled();
    });

    it("should throw error for non-existent file", async () => {
      mockFile.exists.mockResolvedValue([false]);

      await expect(getDownloadUrl("non-existent-file.png")).rejects.toThrow(
        "File not found in storage"
      );

      expect(mockFile.makePublic).not.toHaveBeenCalled();
    });

    it("should handle already public files gracefully", async () => {
      mockFile.exists.mockResolvedValue([true]);
      const alreadyPublicError = new Error("File is already public");
      mockFile.makePublic.mockRejectedValue(alreadyPublicError);

      const url = await getDownloadUrl("static-assets/icon/test.png");

      expect(url).toBe(
        "https://storage.googleapis.com/test-bucket/static-assets/icon/test.png"
      );
    });

    it("should warn on makePublic errors but continue", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      mockFile.exists.mockResolvedValue([true]);
      mockFile.makePublic.mockRejectedValue(new Error("Permission denied"));

      const url = await getDownloadUrl("static-assets/icon/test.png");

      expect(url).toBe(
        "https://storage.googleapis.com/test-bucket/static-assets/icon/test.png"
      );
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Failed to make file public:",
        expect.any(Error)
      );

      consoleWarnSpy.mockRestore();
    });

    it("should use correct bucket name", async () => {
      mockFile.exists.mockResolvedValue([true]);
      mockFile.makePublic.mockResolvedValue(undefined);

      mockBucket.name = "custom-bucket-name";

      const url = await getDownloadUrl("test.png");

      expect(url).toContain("custom-bucket-name");
    });
  });

  describe("saveAssetMetadata", () => {
    it("should save asset to Firestore", async () => {
      const asset: StaticAsset = {
        id: "asset-123",
        name: "test.png",
        type: "icon",
        url: "https://example.com/test.png",
        storagePath: "static-assets/icon/test.png",
        uploadedBy: "user123",
        uploadedAt: "2025-01-01T00:00:00Z",
        size: 1024,
        contentType: "image/png",
      };

      mockDoc.set.mockResolvedValue(undefined);

      await saveAssetMetadata(asset);

      expect(mockDb.collection).toHaveBeenCalledWith("static_assets");
      expect(mockCollection.doc).toHaveBeenCalledWith("asset-123");
      expect(mockDoc.set).toHaveBeenCalledWith(asset);
    });

    it("should handle save errors", async () => {
      const asset: StaticAsset = {
        id: "asset-123",
        name: "test.png",
        type: "icon",
        url: "https://example.com/test.png",
        storagePath: "static-assets/icon/test.png",
        uploadedBy: "user123",
        uploadedAt: "2025-01-01T00:00:00Z",
        size: 1024,
        contentType: "image/png",
      };

      mockDoc.set.mockRejectedValue(new Error("Firestore error"));

      await expect(saveAssetMetadata(asset)).rejects.toThrow(
        "Failed to save asset metadata"
      );
    });

    it("should save optional metadata", async () => {
      const asset: StaticAsset = {
        id: "asset-123",
        name: "test.png",
        type: "icon",
        url: "https://example.com/test.png",
        storagePath: "static-assets/icon/test.png",
        category: "logos",
        uploadedBy: "user123",
        uploadedAt: "2025-01-01T00:00:00Z",
        size: 1024,
        contentType: "image/png",
        metadata: { alt: "Test image", description: "Sample" },
      };

      mockDoc.set.mockResolvedValue(undefined);

      await saveAssetMetadata(asset);

      expect(mockDoc.set).toHaveBeenCalledWith(asset);
    });
  });

  describe("getAssetMetadata", () => {
    it("should return asset metadata when exists", async () => {
      const mockAsset: StaticAsset = {
        id: "asset-123",
        name: "test.png",
        type: "icon",
        url: "https://example.com/test.png",
        storagePath: "static-assets/icon/test.png",
        uploadedBy: "user123",
        uploadedAt: "2025-01-01T00:00:00Z",
        size: 1024,
        contentType: "image/png",
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockAsset,
      });

      const result = await getAssetMetadata("asset-123");

      expect(result).toEqual(mockAsset);
      expect(mockCollection.doc).toHaveBeenCalledWith("asset-123");
    });

    it("should return null when asset does not exist", async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      const result = await getAssetMetadata("non-existent");

      expect(result).toBeNull();
    });

    it("should handle Firestore errors", async () => {
      mockDoc.get.mockRejectedValue(new Error("Firestore error"));

      await expect(getAssetMetadata("asset-123")).rejects.toThrow(
        "Failed to get asset metadata"
      );
    });
  });

  describe("listAssets", () => {
    it("should list all assets without filters", async () => {
      const mockAssets = [
        { id: "1", name: "test1.png", type: "icon" },
        { id: "2", name: "test2.png", type: "image" },
      ];

      mockCollection.get.mockResolvedValue({
        docs: mockAssets.map((asset) => ({
          id: asset.id,
          data: () => asset,
        })),
      });

      const result = await listAssets();

      expect(result).toEqual(mockAssets);
      expect(mockCollection.orderBy).toHaveBeenCalledWith("uploadedAt", "desc");
    });

    it("should filter by type", async () => {
      const mockAssets = [{ id: "1", name: "icon.png", type: "icon" }];

      mockCollection.get.mockResolvedValue({
        docs: mockAssets.map((asset) => ({
          id: asset.id,
          data: () => asset,
        })),
      });

      const result = await listAssets({ type: "icon" });

      expect(result).toEqual(mockAssets);
      expect(mockCollection.where).toHaveBeenCalledWith("type", "==", "icon");
    });

    it("should filter by category", async () => {
      const mockAssets = [{ id: "1", name: "logo.png", category: "logos" }];

      mockCollection.get.mockResolvedValue({
        docs: mockAssets.map((asset) => ({
          id: asset.id,
          data: () => asset,
        })),
      });

      const result = await listAssets({ category: "logos" });

      expect(result).toEqual(mockAssets);
      expect(mockCollection.where).toHaveBeenCalledWith(
        "category",
        "==",
        "logos"
      );
    });

    it("should filter by both type and category", async () => {
      mockCollection.get.mockResolvedValue({
        docs: [],
      });

      await listAssets({ type: "icon", category: "logos" });

      expect(mockCollection.where).toHaveBeenCalledWith("type", "==", "icon");
      expect(mockCollection.where).toHaveBeenCalledWith(
        "category",
        "==",
        "logos"
      );
    });

    it("should return empty array when no assets found", async () => {
      mockCollection.get.mockResolvedValue({
        docs: [],
      });

      const result = await listAssets();

      expect(result).toEqual([]);
    });

    it("should handle listing errors", async () => {
      mockCollection.get.mockRejectedValue(new Error("Firestore error"));

      await expect(listAssets()).rejects.toThrow("Failed to list assets");
    });
  });

  describe("updateAssetMetadata", () => {
    it("should update asset metadata", async () => {
      mockDoc.update.mockResolvedValue(undefined);

      const updates = { name: "updated.png", size: 2048 };

      await updateAssetMetadata("asset-123", updates);

      expect(mockCollection.doc).toHaveBeenCalledWith("asset-123");
      expect(mockDoc.update).toHaveBeenCalledWith({
        ...updates,
        updatedAt: expect.any(String),
      });
    });

    it("should add updatedAt timestamp", async () => {
      mockDoc.update.mockResolvedValue(undefined);

      const beforeTime = new Date().toISOString();

      await updateAssetMetadata("asset-123", { name: "new.png" });

      const call = mockDoc.update.mock.calls[0][0];
      expect(call.updatedAt).toBeDefined();
      expect(new Date(call.updatedAt).getTime()).toBeGreaterThanOrEqual(
        new Date(beforeTime).getTime()
      );
    });

    it("should handle update errors", async () => {
      mockDoc.update.mockRejectedValue(new Error("Update failed"));

      await expect(
        updateAssetMetadata("asset-123", { name: "new.png" })
      ).rejects.toThrow("Update failed");
    });
  });

  describe("deleteAsset", () => {
    it("should delete asset from both Storage and Firestore", async () => {
      const mockAsset: StaticAsset = {
        id: "asset-123",
        name: "test.png",
        type: "icon",
        url: "https://example.com/test.png",
        storagePath: "static-assets/icon/test.png",
        uploadedBy: "user123",
        uploadedAt: "2025-01-01T00:00:00Z",
        size: 1024,
        contentType: "image/png",
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockAsset,
      });
      mockFile.delete.mockResolvedValue(undefined);
      mockDoc.delete.mockResolvedValue(undefined);

      await deleteAsset("asset-123");

      expect(mockFile.delete).toHaveBeenCalled();
      expect(mockDoc.delete).toHaveBeenCalled();
    });

    it("should throw error if asset not found", async () => {
      mockDoc.get.mockResolvedValue({
        exists: false,
      });

      await expect(deleteAsset("non-existent")).rejects.toThrow(
        "Asset not found: non-existent"
      );

      expect(mockFile.delete).not.toHaveBeenCalled();
    });

    it("should warn if storage file already deleted", async () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation();

      const mockAsset: StaticAsset = {
        id: "asset-123",
        name: "test.png",
        type: "icon",
        url: "https://example.com/test.png",
        storagePath: "static-assets/icon/test.png",
        uploadedBy: "user123",
        uploadedAt: "2025-01-01T00:00:00Z",
        size: 1024,
        contentType: "image/png",
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockAsset,
      });

      const error404: any = new Error("Not found");
      error404.code = 404;
      mockFile.delete.mockRejectedValue(error404);
      mockDoc.delete.mockResolvedValue(undefined);

      await deleteAsset("asset-123");

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining("Storage file already deleted")
      );
      expect(mockDoc.delete).toHaveBeenCalled(); // Should still delete metadata

      consoleWarnSpy.mockRestore();
    });

    it("should throw error on storage deletion failure", async () => {
      const mockAsset: StaticAsset = {
        id: "asset-123",
        name: "test.png",
        type: "icon",
        url: "https://example.com/test.png",
        storagePath: "static-assets/icon/test.png",
        uploadedBy: "user123",
        uploadedAt: "2025-01-01T00:00:00Z",
        size: 1024,
        contentType: "image/png",
      };

      mockDoc.get.mockResolvedValue({
        exists: true,
        data: () => mockAsset,
      });

      mockFile.delete.mockRejectedValue(new Error("Storage error"));

      await expect(deleteAsset("asset-123")).rejects.toThrow(
        "Failed to delete file from storage"
      );

      expect(mockDoc.delete).not.toHaveBeenCalled(); // Should not delete metadata if storage fails
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long file names", async () => {
      const longName = "a".repeat(200) + ".png";
      mockFile.getSignedUrl.mockResolvedValue(["url"]);

      const result = await generateUploadUrl(longName, "image/png", "icon");

      expect(result.assetId).toBeDefined();
      expect(result.storagePath).toBeDefined();
    });

    it("should handle special content types", async () => {
      mockFile.getSignedUrl.mockResolvedValue(["url"]);

      await generateUploadUrl("video.mp4", "video/mp4", "video");

      expect(mockFile.getSignedUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          contentType: "video/mp4",
        })
      );
    });

    it("should handle assets with no category", async () => {
      const asset: StaticAsset = {
        id: "asset-123",
        name: "test.png",
        type: "icon",
        url: "https://example.com/test.png",
        storagePath: "static-assets/icon/test.png",
        uploadedBy: "user123",
        uploadedAt: "2025-01-01T00:00:00Z",
        size: 1024,
        contentType: "image/png",
        // No category
      };

      mockDoc.set.mockResolvedValue(undefined);

      await saveAssetMetadata(asset);

      expect(mockDoc.set).toHaveBeenCalledWith(asset);
    });

    it("should handle empty asset list", async () => {
      mockCollection.get.mockResolvedValue({
        docs: [],
      });

      const result = await listAssets({ type: "non-existent" });

      expect(result).toEqual([]);
    });
  });
});
