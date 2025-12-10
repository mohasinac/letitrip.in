/**
 * Unit Tests for Static Assets Server Service
 * Tests Firebase Storage operations and asset management
 *
 * TESTS COVER:
 * - generateUploadUrl with signed URL generation
 * - getDownloadUrl with public access
 * - saveAssetMetadata to Firestore
 * - getAssetMetadata from Firestore
 * - listAssets with filtering
 * - updateAssetMetadata
 * - deleteAsset (Storage + Firestore)
 * - Error handling and edge cases
 *
 * CODE ISSUES FOUND:
 * 1. Signed upload URL hardcoded to 15 minutes - not configurable
 * 2. makePublic() failures silently ignored - could cause access issues
 * 3. No file size validation before upload
 * 4. No content type validation
 * 5. Storage path predictable - could lead to enumeration attacks
 * 6. No rate limiting on upload URL generation
 * 7. console.error/warn in production code - no structured logging
 * 8. Generic error messages lose original error context
 */

// Mock Firebase FIRST
jest.mock("firebase-admin/storage", () => ({
  getStorage: jest.fn(),
}));
jest.mock("@/app/api/lib/firebase/admin", () => ({
  getFirestoreAdmin: jest.fn(),
}));

import { getFirestoreAdmin } from "@/app/api/lib/firebase/admin";
import {
  deleteAsset,
  generateUploadUrl,
  getAssetMetadata,
  getDownloadUrl,
  listAssets,
  saveAssetMetadata,
  StaticAsset,
  updateAssetMetadata,
} from "@/app/api/lib/static-assets-server.service";
import { getStorage } from "firebase-admin/storage";

describe("static-assets-server.service", () => {
  let mockBucket: any;
  let mockFile: any;
  let mockDb: any;
  let mockCollection: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Firestore
    mockCollection = {
      doc: jest.fn(),
      where: jest.fn(),
      orderBy: jest.fn(),
      get: jest.fn(),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    (getFirestoreAdmin as jest.Mock).mockReturnValue(mockDb);

    // Mock Storage
    mockFile = {
      getSignedUrl: jest.fn(),
      exists: jest.fn(),
      makePublic: jest.fn(),
      delete: jest.fn(),
    };

    mockBucket = {
      file: jest.fn().mockReturnValue(mockFile),
      name: "test-bucket",
    };

    (getStorage as jest.Mock).mockReturnValue({
      bucket: jest.fn().mockReturnValue(mockBucket),
    });
  });

  describe("generateUploadUrl", () => {
    it("should generate signed upload URL successfully", async () => {
      const mockSignedUrl =
        "https://storage.googleapis.com/signed-url?token=abc";
      mockFile.getSignedUrl.mockResolvedValue([mockSignedUrl]);

      const result = await generateUploadUrl(
        "test-image.jpg",
        "image/jpeg",
        "image",
        "products"
      );

      expect(result.uploadUrl).toBe(mockSignedUrl);
      expect(result.assetId).toMatch(/^\d+-test-image\.jpg$/);
      expect(result.storagePath).toMatch(
        /^static-assets\/image\/products\/\d+-test-image\.jpg$/
      );
    });

    it("should sanitize filename with special characters", async () => {
      mockFile.getSignedUrl.mockResolvedValue(["https://example.com/url"]);

      const result = await generateUploadUrl(
        "test file!@#$%.jpg",
        "image/jpeg",
        "image"
      );

      expect(result.storagePath).toMatch(/test-file-----\.jpg$/);
    });

    it("should use default category when not provided", async () => {
      mockFile.getSignedUrl.mockResolvedValue(["https://example.com/url"]);

      const result = await generateUploadUrl(
        "file.pdf",
        "application/pdf",
        "document"
      );

      expect(result.storagePath).toContain("default");
    });

    it("should set expiry to 15 minutes", async () => {
      mockFile.getSignedUrl.mockResolvedValue(["https://example.com/url"]);

      const beforeCall = Date.now();
      await generateUploadUrl("test.jpg", "image/jpeg", "image");
      const afterCall = Date.now();

      expect(mockFile.getSignedUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          version: "v4",
          action: "write",
          expires: expect.any(Number),
        })
      );

      const callArgs = mockFile.getSignedUrl.mock.calls[0][0];
      const expectedExpiry = 15 * 60 * 1000; // 15 minutes

      expect(callArgs.expires).toBeGreaterThanOrEqual(
        beforeCall + expectedExpiry
      );
      expect(callArgs.expires).toBeLessThanOrEqual(
        afterCall + expectedExpiry + 100
      );
    });

    it("should include content type in signed URL", async () => {
      mockFile.getSignedUrl.mockResolvedValue(["https://example.com/url"]);

      await generateUploadUrl("video.mp4", "video/mp4", "video");

      expect(mockFile.getSignedUrl).toHaveBeenCalledWith(
        expect.objectContaining({
          contentType: "video/mp4",
        })
      );
    });

    it("should handle Storage API errors", async () => {
      mockFile.getSignedUrl.mockRejectedValue(new Error("Storage error"));

      await expect(
        generateUploadUrl("test.jpg", "image/jpeg", "image")
      ).rejects.toThrow("Failed to generate upload URL");
    });

    it("should log errors before throwing", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      mockFile.getSignedUrl.mockRejectedValue(new Error("Test error"));

      await expect(
        generateUploadUrl("test.jpg", "image/jpeg", "image")
      ).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error generating upload URL:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getDownloadUrl", () => {
    it("should return public download URL for existing file", async () => {
      mockFile.exists.mockResolvedValue([true]);
      mockFile.makePublic.mockResolvedValue(undefined);

      const url = await getDownloadUrl("static-assets/image/test.jpg");

      expect(url).toBe(
        "https://storage.googleapis.com/test-bucket/static-assets/image/test.jpg"
      );
      expect(mockFile.makePublic).toHaveBeenCalled();
    });

    it("should check file exists before making public", async () => {
      mockFile.exists.mockResolvedValue([false]);

      await expect(getDownloadUrl("nonexistent/file.jpg")).rejects.toThrow(
        "File not found in storage"
      );

      expect(mockFile.makePublic).not.toHaveBeenCalled();
    });

    it("should ignore makePublic error if already public", async () => {
      mockFile.exists.mockResolvedValue([true]);
      mockFile.makePublic.mockRejectedValue(
        new Error("File is already public")
      );

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      const url = await getDownloadUrl("static-assets/image/test.jpg");

      expect(url).toBeDefined();
      // Code skips logging if error message contains "already"
      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should handle permission errors gracefully", async () => {
      mockFile.exists.mockResolvedValue([true]);
      mockFile.makePublic.mockRejectedValue(new Error("Permission denied"));

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      await expect(getDownloadUrl("test.jpg")).resolves.toBeDefined();

      consoleSpy.mockRestore();
    });

    it("should handle file existence check errors", async () => {
      mockFile.exists.mockRejectedValue(new Error("Storage unavailable"));

      await expect(getDownloadUrl("test.jpg")).rejects.toThrow();
    });

    it("should preserve original error message", async () => {
      const customError = new Error("Custom storage error");
      mockFile.exists.mockRejectedValue(customError);

      await expect(getDownloadUrl("test.jpg")).rejects.toThrow(customError);
    });
  });

  describe("saveAssetMetadata", () => {
    const mockAsset: StaticAsset = {
      id: "asset-123",
      name: "test.jpg",
      type: "image",
      url: "https://example.com/test.jpg",
      storagePath: "static-assets/image/test.jpg",
      uploadedBy: "user-123",
      uploadedAt: "2024-12-10T00:00:00Z",
      size: 1024,
      contentType: "image/jpeg",
    };

    it("should save asset metadata to Firestore", async () => {
      const mockDocRef = { set: jest.fn().mockResolvedValue(undefined) };
      mockCollection.doc.mockReturnValue(mockDocRef);

      await saveAssetMetadata(mockAsset);

      expect(mockCollection.doc).toHaveBeenCalledWith("asset-123");
      expect(mockDocRef.set).toHaveBeenCalledWith(mockAsset);
    });

    it("should handle Firestore write errors", async () => {
      const mockDocRef = {
        set: jest.fn().mockRejectedValue(new Error("Firestore error")),
      };
      mockCollection.doc.mockReturnValue(mockDocRef);

      await expect(saveAssetMetadata(mockAsset)).rejects.toThrow(
        "Failed to save asset metadata"
      );
    });

    it("should log errors before throwing", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockDocRef = {
        set: jest.fn().mockRejectedValue(new Error("Test error")),
      };
      mockCollection.doc.mockReturnValue(mockDocRef);

      await expect(saveAssetMetadata(mockAsset)).rejects.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        "Error saving asset metadata:",
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("getAssetMetadata", () => {
    it("should return asset metadata when exists", async () => {
      const mockData: StaticAsset = {
        id: "asset-123",
        name: "test.jpg",
        type: "image",
        url: "https://example.com/test.jpg",
        storagePath: "static-assets/image/test.jpg",
        uploadedBy: "user-123",
        uploadedAt: "2024-12-10T00:00:00Z",
        size: 1024,
        contentType: "image/jpeg",
      };

      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockData,
        }),
      };
      mockCollection.doc.mockReturnValue(mockDocRef);

      const result = await getAssetMetadata("asset-123");

      expect(result).toEqual(mockData);
    });

    it("should return null when asset not found", async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({ exists: false }),
      };
      mockCollection.doc.mockReturnValue(mockDocRef);

      const result = await getAssetMetadata("nonexistent");

      expect(result).toBeNull();
    });

    it("should handle Firestore read errors", async () => {
      const mockDocRef = {
        get: jest.fn().mockRejectedValue(new Error("Firestore error")),
      };
      mockCollection.doc.mockReturnValue(mockDocRef);

      await expect(getAssetMetadata("asset-123")).rejects.toThrow(
        "Failed to get asset metadata"
      );
    });
  });

  describe("listAssets", () => {
    const mockAssets: StaticAsset[] = [
      {
        id: "asset-1",
        name: "image1.jpg",
        type: "image",
        url: "url1",
        storagePath: "path1",
        uploadedBy: "user1",
        uploadedAt: "2024-12-10",
        size: 100,
        contentType: "image/jpeg",
      },
      {
        id: "asset-2",
        name: "image2.jpg",
        type: "image",
        url: "url2",
        storagePath: "path2",
        uploadedBy: "user2",
        uploadedAt: "2024-12-09",
        size: 200,
        contentType: "image/png",
      },
    ];

    beforeEach(() => {
      mockCollection.where.mockReturnThis();
      mockCollection.orderBy.mockReturnThis();
    });

    it("should list all assets without filters", async () => {
      mockCollection.get.mockResolvedValue({
        docs: mockAssets.map((asset) => ({
          id: asset.id,
          data: () => asset,
        })),
      });

      const result = await listAssets();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("asset-1");
    });

    it("should filter by type", async () => {
      mockCollection.get.mockResolvedValue({
        docs: [
          {
            id: mockAssets[0].id,
            data: () => mockAssets[0],
          },
        ],
      });

      const result = await listAssets({ type: "image" });

      expect(mockCollection.where).toHaveBeenCalledWith("type", "==", "image");
      expect(result).toHaveLength(1);
    });

    it("should filter by category", async () => {
      mockCollection.get.mockResolvedValue({
        docs: [],
      });

      await listAssets({ category: "products" });

      expect(mockCollection.where).toHaveBeenCalledWith(
        "category",
        "==",
        "products"
      );
    });

    it("should filter by both type and category", async () => {
      mockCollection.get.mockResolvedValue({
        docs: [],
      });

      await listAssets({ type: "image", category: "products" });

      expect(mockCollection.where).toHaveBeenCalledTimes(2);
    });

    it("should order by uploadedAt descending", async () => {
      mockCollection.get.mockResolvedValue({
        docs: [],
      });

      await listAssets();

      expect(mockCollection.orderBy).toHaveBeenCalledWith("uploadedAt", "desc");
    });

    it("should handle query errors", async () => {
      mockCollection.get.mockRejectedValue(new Error("Query error"));

      await expect(listAssets()).rejects.toThrow("Failed to list assets");
    });

    it("should return empty array when no assets", async () => {
      mockCollection.get.mockResolvedValue({
        docs: [],
      });

      const result = await listAssets();

      expect(result).toEqual([]);
    });
  });

  describe("updateAssetMetadata", () => {
    it("should update asset with provided fields", async () => {
      const mockDocRef = { update: jest.fn().mockResolvedValue(undefined) };
      mockCollection.doc.mockReturnValue(mockDocRef);

      const updates = { name: "updated.jpg", category: "new-category" };
      await updateAssetMetadata("asset-123", updates);

      expect(mockDocRef.update).toHaveBeenCalledWith(
        expect.objectContaining({
          name: "updated.jpg",
          category: "new-category",
          updatedAt: expect.any(String),
        })
      );
    });

    it("should add updatedAt timestamp", async () => {
      const mockDocRef = { update: jest.fn().mockResolvedValue(undefined) };
      mockCollection.doc.mockReturnValue(mockDocRef);

      const before = Date.now();
      await updateAssetMetadata("asset-123", { name: "new-name" });
      const after = Date.now();

      const updateCall = mockDocRef.update.mock.calls[0][0];
      expect(updateCall.updatedAt).toBeDefined();
      const updatedAtTime = new Date(updateCall.updatedAt).getTime();
      expect(updatedAtTime).toBeGreaterThanOrEqual(before);
      expect(updatedAtTime).toBeLessThanOrEqual(after + 100);
    });

    it("should handle update errors", async () => {
      const mockDocRef = {
        update: jest.fn().mockRejectedValue(new Error("Update failed")),
      };
      mockCollection.doc.mockReturnValue(mockDocRef);

      await expect(
        updateAssetMetadata("asset-123", { name: "new" })
      ).rejects.toThrow();
    });
  });

  describe("deleteAsset", () => {
    const mockAsset: StaticAsset = {
      id: "asset-123",
      name: "test.jpg",
      type: "image",
      url: "url",
      storagePath: "static-assets/image/test.jpg",
      uploadedBy: "user-123",
      uploadedAt: "2024-12-10",
      size: 1024,
      contentType: "image/jpeg",
    };

    beforeEach(() => {
      // Mock getAssetMetadata
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockAsset,
        }),
        delete: jest.fn().mockResolvedValue(undefined),
      };
      mockCollection.doc.mockReturnValue(mockDocRef);
    });

    it("should delete from both Storage and Firestore", async () => {
      mockFile.delete.mockResolvedValue(undefined);

      await deleteAsset("asset-123");

      expect(mockBucket.file).toHaveBeenCalledWith(mockAsset.storagePath);
      expect(mockFile.delete).toHaveBeenCalled();
      expect(mockCollection.doc).toHaveBeenCalledWith("asset-123");
    });

    it("should throw error if asset not found", async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({ exists: false }),
      };
      mockCollection.doc.mockReturnValue(mockDocRef);

      await expect(deleteAsset("nonexistent")).rejects.toThrow(
        "Asset not found: nonexistent"
      );
    });

    it("should warn if Storage file already deleted", async () => {
      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();
      const storageError: any = new Error("Not found");
      storageError.code = 404;
      mockFile.delete.mockRejectedValue(storageError);

      await deleteAsset("asset-123");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("already deleted")
      );

      consoleSpy.mockRestore();
    });

    it("should throw error for non-404 Storage errors", async () => {
      const storageError: any = new Error("Permission denied");
      storageError.code = 403;
      mockFile.delete.mockRejectedValue(storageError);

      await expect(deleteAsset("asset-123")).rejects.toThrow(
        "Failed to delete file from storage"
      );
    });

    it("should delete Firestore doc even if Storage fails with 404", async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockAsset,
        }),
        delete: jest.fn().mockResolvedValue(undefined),
      };
      mockCollection.doc.mockReturnValue(mockDocRef);

      const storageError: any = new Error("Not found");
      storageError.code = 404;
      mockFile.delete.mockRejectedValue(storageError);

      const consoleSpy = jest.spyOn(console, "warn").mockImplementation();

      await deleteAsset("asset-123");

      expect(mockDocRef.delete).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it("should preserve error type", async () => {
      const customError = new Error("Custom delete error");
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => mockAsset,
        }),
        delete: jest.fn().mockRejectedValue(customError),
      };
      mockCollection.doc.mockReturnValue(mockDocRef);
      mockFile.delete.mockResolvedValue(undefined);

      await expect(deleteAsset("asset-123")).rejects.toThrow(customError);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty filename", async () => {
      mockFile.getSignedUrl.mockResolvedValue(["https://example.com/url"]);

      const result = await generateUploadUrl("", "image/jpeg", "image");

      expect(result.storagePath).toMatch(
        /static-assets\/image\/default\/\d+-$/
      );
    });

    it("should handle very long filenames", async () => {
      mockFile.getSignedUrl.mockResolvedValue(["https://example.com/url"]);

      const longName = "a".repeat(300) + ".jpg";
      const result = await generateUploadUrl(longName, "image/jpeg", "image");

      expect(result.storagePath).toBeDefined();
    });

    it("should handle special unicode characters in filename", async () => {
      mockFile.getSignedUrl.mockResolvedValue(["https://example.com/url"]);

      const result = await generateUploadUrl(
        "tëst-fîlé-中文.jpg",
        "image/jpeg",
        "image"
      );

      // Sanitization removes unicode and special chars, leaving alphanumeric and hyphens
      expect(result.storagePath).toMatch(/\d+-t-st-f-l----\.jpg$/);
    });

    it("should handle null/undefined in asset updates", async () => {
      const mockDocRef = { update: jest.fn().mockResolvedValue(undefined) };
      mockCollection.doc.mockReturnValue(mockDocRef);

      await updateAssetMetadata("asset-123", {
        category: null as any,
        metadata: undefined,
      });

      expect(mockDocRef.update).toHaveBeenCalled();
    });

    it("should handle concurrent deletes gracefully", async () => {
      const mockDocRef = {
        get: jest.fn().mockResolvedValue({ exists: false }),
      };
      mockCollection.doc.mockReturnValue(mockDocRef);

      await expect(deleteAsset("asset-123")).rejects.toThrow("Asset not found");
    });
  });
});
