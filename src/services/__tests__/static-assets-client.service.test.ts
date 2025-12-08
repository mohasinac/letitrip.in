import { logServiceError } from "@/lib/error-logger";
import { apiService } from "../api.service";
import { staticAssetsService } from "../static-assets-client.service";

jest.mock("../api.service");
jest.mock("@/lib/error-logger");

// Mock global fetch for file uploads
global.fetch = jest.fn();

describe("StaticAssetsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getAssets", () => {
    it("should fetch all assets without filters", async () => {
      const mockAssets = [
        {
          id: "asset1",
          name: "logo.png",
          type: "payment-logo" as const,
          url: "https://example.com/logo.png",
          storagePath: "/assets/logo.png",
          uploadedBy: "user1",
          uploadedAt: "2024-01-01T00:00:00.000Z",
          size: 1024,
          contentType: "image/png",
        },
        {
          id: "asset2",
          name: "icon.svg",
          type: "icon" as const,
          url: "https://example.com/icon.svg",
          storagePath: "/assets/icon.svg",
          uploadedBy: "user1",
          uploadedAt: "2024-01-02T00:00:00.000Z",
          size: 512,
          contentType: "image/svg+xml",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ assets: mockAssets });

      const result = await staticAssetsService.getAssets();

      expect(apiService.get).toHaveBeenCalledWith("/admin/static-assets");
      expect(result).toEqual(mockAssets);
    });

    it("should fetch assets with type filter", async () => {
      const mockAssets = [
        {
          id: "asset1",
          name: "logo.png",
          type: "payment-logo" as const,
          url: "https://example.com/logo.png",
          storagePath: "/assets/logo.png",
          uploadedBy: "user1",
          uploadedAt: "2024-01-01T00:00:00.000Z",
          size: 1024,
          contentType: "image/png",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ assets: mockAssets });

      const result = await staticAssetsService.getAssets({
        type: "payment-logo",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/admin/static-assets?type=payment-logo"
      );
      expect(result).toEqual(mockAssets);
    });

    it("should fetch assets with category filter", async () => {
      const mockAssets = [
        {
          id: "asset1",
          name: "doc.pdf",
          type: "document" as const,
          url: "https://example.com/doc.pdf",
          storagePath: "/assets/doc.pdf",
          category: "legal",
          uploadedBy: "user1",
          uploadedAt: "2024-01-01T00:00:00.000Z",
          size: 2048,
          contentType: "application/pdf",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ assets: mockAssets });

      const result = await staticAssetsService.getAssets({ category: "legal" });

      expect(apiService.get).toHaveBeenCalledWith(
        "/admin/static-assets?category=legal"
      );
      expect(result).toEqual(mockAssets);
    });

    it("should fetch assets with both type and category filters", async () => {
      const mockAssets = [
        {
          id: "asset1",
          name: "hero.jpg",
          type: "image" as const,
          url: "https://example.com/hero.jpg",
          storagePath: "/assets/hero.jpg",
          category: "homepage",
          uploadedBy: "user1",
          uploadedAt: "2024-01-01T00:00:00.000Z",
          size: 3072,
          contentType: "image/jpeg",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ assets: mockAssets });

      const result = await staticAssetsService.getAssets({
        type: "image",
        category: "homepage",
      });

      expect(apiService.get).toHaveBeenCalledWith(
        "/admin/static-assets?type=image&category=homepage"
      );
      expect(result).toEqual(mockAssets);
    });

    it("should return empty array when response has no assets", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({});

      const result = await staticAssetsService.getAssets();

      expect(result).toEqual([]);
    });
  });

  describe("getAssetsByType", () => {
    it("should fetch assets by type", async () => {
      const mockAssets = [
        {
          id: "asset1",
          name: "video.mp4",
          type: "video" as const,
          url: "https://example.com/video.mp4",
          storagePath: "/assets/video.mp4",
          uploadedBy: "user1",
          uploadedAt: "2024-01-01T00:00:00.000Z",
          size: 10240,
          contentType: "video/mp4",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ assets: mockAssets });

      const result = await staticAssetsService.getAssetsByType("video");

      expect(apiService.get).toHaveBeenCalledWith(
        "/admin/static-assets?type=video"
      );
      expect(result).toEqual(mockAssets);
    });
  });

  describe("getAssetsByCategory", () => {
    it("should fetch assets by category", async () => {
      const mockAssets = [
        {
          id: "asset1",
          name: "banner.jpg",
          type: "image" as const,
          url: "https://example.com/banner.jpg",
          storagePath: "/assets/banner.jpg",
          category: "promotions",
          uploadedBy: "user1",
          uploadedAt: "2024-01-01T00:00:00.000Z",
          size: 2048,
          contentType: "image/jpeg",
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ assets: mockAssets });

      const result = await staticAssetsService.getAssetsByCategory(
        "promotions"
      );

      expect(apiService.get).toHaveBeenCalledWith(
        "/admin/static-assets?category=promotions"
      );
      expect(result).toEqual(mockAssets);
    });
  });

  describe("getAsset", () => {
    it("should fetch single asset by id", async () => {
      const mockAsset = {
        id: "asset1",
        name: "logo.png",
        type: "payment-logo" as const,
        url: "https://example.com/logo.png",
        storagePath: "/assets/logo.png",
        uploadedBy: "user1",
        uploadedAt: "2024-01-01T00:00:00.000Z",
        size: 1024,
        contentType: "image/png",
      };

      (apiService.get as jest.Mock).mockResolvedValue({ asset: mockAsset });

      const result = await staticAssetsService.getAsset("asset1");

      expect(apiService.get).toHaveBeenCalledWith(
        "/admin/static-assets/asset1"
      );
      expect(result).toEqual(mockAsset);
    });
  });

  describe("requestUploadUrl", () => {
    it("should request upload URL from server", async () => {
      const mockResponse = {
        uploadUrl: "https://storage.googleapis.com/bucket/file?token=xyz",
        assetId: "asset-123",
        storagePath: "/assets/logo.png",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await staticAssetsService.requestUploadUrl({
        fileName: "logo.png",
        contentType: "image/png",
        type: "payment-logo",
        category: "razorpay",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/static-assets/upload-url",
        {
          fileName: "logo.png",
          contentType: "image/png",
          type: "payment-logo",
          category: "razorpay",
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it("should request upload URL without category", async () => {
      const mockResponse = {
        uploadUrl: "https://storage.googleapis.com/bucket/file?token=xyz",
        assetId: "asset-123",
        storagePath: "/assets/icon.svg",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await staticAssetsService.requestUploadUrl({
        fileName: "icon.svg",
        contentType: "image/svg+xml",
        type: "icon",
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/admin/static-assets/upload-url",
        {
          fileName: "icon.svg",
          contentType: "image/svg+xml",
          type: "icon",
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe("uploadAsset", () => {
    it("should upload asset successfully", async () => {
      const mockFile = new File(["content"], "test.png", {
        type: "image/png",
      });
      const mockAsset = {
        id: "asset1",
        name: "test.png",
        type: "image" as const,
        url: "https://example.com/test.png",
        storagePath: "/assets/test.png",
        uploadedBy: "user1",
        uploadedAt: "2024-01-01T00:00:00.000Z",
        size: 7,
        contentType: "image/png",
      };

      // Mock requestUploadUrl
      (apiService.post as jest.Mock)
        .mockResolvedValueOnce({
          uploadUrl: "https://storage.googleapis.com/bucket/file",
          assetId: "asset1",
          storagePath: "/assets/test.png",
        })
        // Mock confirm-upload
        .mockResolvedValueOnce(mockAsset);

      // Mock fetch for storage upload
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await staticAssetsService.uploadAsset(
        mockFile,
        "image",
        "homepage"
      );

      // Verify requestUploadUrl call
      expect(apiService.post).toHaveBeenNthCalledWith(
        1,
        "/admin/static-assets/upload-url",
        {
          fileName: "test.png",
          contentType: "image/png",
          type: "image",
          category: "homepage",
        }
      );

      // Verify storage upload
      expect(global.fetch).toHaveBeenCalledWith(
        "https://storage.googleapis.com/bucket/file",
        {
          method: "PUT",
          body: mockFile,
          headers: {
            "Content-Type": "image/png",
          },
        }
      );

      // Verify confirm-upload call
      expect(apiService.post).toHaveBeenNthCalledWith(
        2,
        "/admin/static-assets/confirm-upload",
        {
          assetId: "asset1",
          name: "test.png",
          type: "image",
          storagePath: "/assets/test.png",
          category: "homepage",
          size: 7,
          contentType: "image/png",
        }
      );

      expect(result.success).toBe(true);
      expect(result.asset).toEqual(mockAsset);
    });

    it("should handle upload failure to storage", async () => {
      const mockFile = new File(["content"], "test.png", {
        type: "image/png",
      });

      // Mock requestUploadUrl
      (apiService.post as jest.Mock).mockResolvedValue({
        uploadUrl: "https://storage.googleapis.com/bucket/file",
        assetId: "asset1",
        storagePath: "/assets/test.png",
      });

      // Mock storage upload failure
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
      });

      const result = await staticAssetsService.uploadAsset(
        mockFile,
        "image",
        "homepage"
      );

      expect(result.success).toBe(false);
      expect(result.error).toBe("Upload to storage failed");
    });

    it("should handle requestUploadUrl failure", async () => {
      const mockFile = new File(["content"], "test.png", {
        type: "image/png",
      });

      // Mock requestUploadUrl failure
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Server error")
      );

      const result = await staticAssetsService.uploadAsset(mockFile, "image");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Server error");
    });

    it("should handle confirm-upload failure", async () => {
      const mockFile = new File(["content"], "test.png", {
        type: "image/png",
      });

      // Mock requestUploadUrl success
      (apiService.post as jest.Mock)
        .mockResolvedValueOnce({
          uploadUrl: "https://storage.googleapis.com/bucket/file",
          assetId: "asset1",
          storagePath: "/assets/test.png",
        })
        // Mock confirm-upload failure
        .mockRejectedValueOnce(new Error("Database error"));

      // Mock storage upload success
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        status: 200,
      });

      const result = await staticAssetsService.uploadAsset(mockFile, "image");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Database error");
    });
  });

  describe("updateAsset", () => {
    it("should update asset metadata", async () => {
      const mockAsset = {
        id: "asset1",
        name: "updated-logo.png",
        type: "payment-logo" as const,
        url: "https://example.com/updated-logo.png",
        storagePath: "/assets/updated-logo.png",
        category: "razorpay",
        uploadedBy: "user1",
        uploadedAt: "2024-01-01T00:00:00.000Z",
        size: 1024,
        contentType: "image/png",
      };

      (apiService.patch as jest.Mock).mockResolvedValue({ asset: mockAsset });

      const result = await staticAssetsService.updateAsset("asset1", {
        name: "updated-logo.png",
        category: "razorpay",
      });

      expect(apiService.patch).toHaveBeenCalledWith(
        "/admin/static-assets/asset1",
        {
          name: "updated-logo.png",
          category: "razorpay",
        }
      );
      expect(result).toEqual(mockAsset);
    });

    it("should update asset with partial fields", async () => {
      const mockAsset = {
        id: "asset1",
        name: "logo.png",
        type: "payment-logo" as const,
        url: "https://example.com/logo.png",
        storagePath: "/assets/logo.png",
        category: "paytm",
        uploadedBy: "user1",
        uploadedAt: "2024-01-01T00:00:00.000Z",
        size: 1024,
        contentType: "image/png",
      };

      (apiService.patch as jest.Mock).mockResolvedValue({ asset: mockAsset });

      const result = await staticAssetsService.updateAsset("asset1", {
        category: "paytm",
      });

      expect(apiService.patch).toHaveBeenCalledWith(
        "/admin/static-assets/asset1",
        { category: "paytm" }
      );
      expect(result).toEqual(mockAsset);
    });
  });

  describe("deleteAsset", () => {
    it("should delete asset", async () => {
      (apiService.delete as jest.Mock).mockResolvedValue({ success: true });

      await staticAssetsService.deleteAsset("asset1");

      expect(apiService.delete).toHaveBeenCalledWith(
        "/admin/static-assets/asset1"
      );
    });
  });

  describe("getPaymentLogoUrl", () => {
    it("should find payment logo by paymentId", async () => {
      const mockAssets = [
        {
          id: "asset1",
          name: "razorpay.png",
          type: "payment-logo" as const,
          url: "https://example.com/razorpay.png",
          storagePath: "/assets/razorpay.png",
          uploadedBy: "user1",
          uploadedAt: "2024-01-01T00:00:00.000Z",
          size: 1024,
          contentType: "image/png",
          metadata: { paymentId: "razorpay" },
        },
        {
          id: "asset2",
          name: "paytm.png",
          type: "payment-logo" as const,
          url: "https://example.com/paytm.png",
          storagePath: "/assets/paytm.png",
          uploadedBy: "user1",
          uploadedAt: "2024-01-02T00:00:00.000Z",
          size: 1024,
          contentType: "image/png",
          metadata: { paymentId: "paytm" },
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ assets: mockAssets });

      const result = await staticAssetsService.getPaymentLogoUrl("razorpay");

      expect(apiService.get).toHaveBeenCalledWith(
        "/admin/static-assets?type=payment-logo"
      );
      expect(result).toBe("https://example.com/razorpay.png");
    });

    it("should return null when payment logo not found", async () => {
      const mockAssets = [
        {
          id: "asset1",
          name: "razorpay.png",
          type: "payment-logo" as const,
          url: "https://example.com/razorpay.png",
          storagePath: "/assets/razorpay.png",
          uploadedBy: "user1",
          uploadedAt: "2024-01-01T00:00:00.000Z",
          size: 1024,
          contentType: "image/png",
          metadata: { paymentId: "razorpay" },
        },
      ];

      (apiService.get as jest.Mock).mockResolvedValue({ assets: mockAssets });

      const result = await staticAssetsService.getPaymentLogoUrl("stripe");

      expect(result).toBeNull();
    });

    it("should return null when no payment logos exist", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({ assets: [] });

      const result = await staticAssetsService.getPaymentLogoUrl("razorpay");

      expect(result).toBeNull();
    });

    it("should handle errors gracefully", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await staticAssetsService.getPaymentLogoUrl("razorpay");

      expect(result).toBeNull();
      expect(logServiceError).toHaveBeenCalledWith(
        "StaticAssetsService",
        "getPaymentLogoUrl",
        expect.any(Error)
      );
    });
  });
});
