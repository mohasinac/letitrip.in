/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiService } from "@/services/api.service";
import { shopsService } from "@/services/shops.service";

// Mock dependencies
jest.mock("@/services/api.service");

describe("ShopsService", () => {
  const mockApiService = apiService as jest.Mocked<typeof apiService>;

  const mockShopBE = {
    id: "shop123",
    name: "Test Shop",
    slug: "test-shop",
    description: "A test shop",
    logo: "https://example.com/logo.jpg",
    banner: "https://example.com/banner.jpg",
    ownerId: "user123",
    ownerName: "Test Owner",
    isVerified: true,
    featured: false,
    status: "active",
    rating: 4.5,
    reviewCount: 100,
    totalProducts: 50,
    totalSales: 1000,
    settings: {
      minOrderAmount: 100,
      shippingCharge: 50,
      returnPolicy: "30 days return policy",
      shippingPolicy: "Ships within 3-5 days",
    },
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should list shops with filters", async () => {
      const mockResponse = {
        data: [mockShopBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await shopsService.list({
        verified: true,
        page: 1,
      });

      expect(mockApiService.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("should list shops without filters", async () => {
      const mockResponse = {
        data: [mockShopBE],
        count: 1,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await shopsService.list();

      expect(result.data).toHaveLength(1);
    });

    it("should handle empty shop list", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await shopsService.list();

      expect(result.data).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getBySlug", () => {
    it("should get shop by slug", async () => {
      mockApiService.get.mockResolvedValue({ shop: mockShopBE });

      const result = await shopsService.getBySlug("test-shop");

      expect(mockApiService.get).toHaveBeenCalledWith("/shops/test-shop");
      expect(result.id).toBe("shop123");
    });

    it("should throw error if shop not found", async () => {
      const error = new Error("Shop not found");
      mockApiService.get.mockRejectedValue(error);

      await expect(shopsService.getBySlug("invalid")).rejects.toThrow(
        "Shop not found"
      );
    });
  });

  describe("getById", () => {
    it("should get shop by ID", async () => {
      mockApiService.get.mockResolvedValue({ shop: mockShopBE });

      const result = await shopsService.getById("shop123");

      expect(mockApiService.get).toHaveBeenCalledWith("/shops/shop123");
      expect(result.id).toBe("shop123");
    });

    it("should throw error if shop not found", async () => {
      const error = new Error("Shop not found");
      mockApiService.get.mockRejectedValue(error);

      await expect(shopsService.getById("invalid")).rejects.toThrow(
        "Shop not found"
      );
    });
  });

  describe("create", () => {
    it("should create shop successfully", async () => {
      const formData = {
        name: "New Shop",
        description: "A new shop",
      };

      mockApiService.post.mockResolvedValue({ data: mockShopBE });

      const result = await shopsService.create(formData as any);

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/shops",
        expect.any(Object)
      );
      expect(result.id).toBe("shop123");
    });

    it("should throw error if validation fails", async () => {
      const error = new Error("Shop name is required");
      mockApiService.post.mockRejectedValue(error);

      await expect(shopsService.create({} as any)).rejects.toThrow(
        "Shop name is required"
      );
    });
  });

  describe("update", () => {
    it("should update shop successfully", async () => {
      const updates = {
        name: "Updated Shop",
        description: "Updated description",
      };

      mockApiService.patch.mockResolvedValue({
        data: { ...mockShopBE, name: "Updated Shop" },
      });

      const result = await shopsService.update("test-shop", updates as any);

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/shops/test-shop",
        expect.any(Object)
      );
      expect(result.id).toBe("shop123");
    });

    it("should throw error if not authorized", async () => {
      const error = new Error("Not authorized");
      mockApiService.patch.mockRejectedValue(error);

      await expect(shopsService.update("test-shop", {} as any)).rejects.toThrow(
        "Not authorized"
      );
    });
  });

  describe("delete", () => {
    it("should delete shop successfully", async () => {
      mockApiService.delete.mockResolvedValue({
        message: "Shop deleted successfully",
      });

      const result = await shopsService.delete("test-shop");

      expect(mockApiService.delete).toHaveBeenCalledWith("/shops/test-shop");
      expect(result.message).toBe("Shop deleted successfully");
    });

    it("should throw error if not authorized", async () => {
      const error = new Error("Not authorized");
      mockApiService.delete.mockRejectedValue(error);

      await expect(shopsService.delete("test-shop")).rejects.toThrow(
        "Not authorized"
      );
    });
  });

  describe("verify", () => {
    it("should verify shop", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockShopBE, isVerified: true },
      });

      const result = await shopsService.verify("test-shop", {
        isVerified: true,
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/shops/test-shop/verify",
        expect.objectContaining({ isVerified: true })
      );
      expect(result.id).toBe("shop123");
    });

    it("should unverify shop with notes", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockShopBE, isVerified: false },
      });

      const result = await shopsService.verify("test-shop", {
        isVerified: false,
        verificationNotes: "Does not meet requirements",
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/shops/test-shop/verify",
        expect.objectContaining({
          isVerified: false,
          verificationNotes: "Does not meet requirements",
        })
      );
      expect(result.id).toBe("shop123");
    });
  });

  describe("ban", () => {
    it("should ban shop", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockShopBE, status: "banned" },
      });

      const result = await shopsService.ban("test-shop", {
        isBanned: true,
        banReason: "Violated terms",
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/shops/test-shop/ban",
        expect.objectContaining({ isBanned: true, banReason: "Violated terms" })
      );
      expect(result.id).toBe("shop123");
    });

    it("should unban shop", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockShopBE, status: "active" },
      });

      const result = await shopsService.ban("test-shop", {
        isBanned: false,
      });

      expect(result.id).toBe("shop123");
    });
  });

  describe("setFeatureFlags", () => {
    it("should feature shop", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockShopBE, featured: true },
      });

      const result = await shopsService.setFeatureFlags("test-shop", {
        featured: true,
      });

      expect(mockApiService.patch).toHaveBeenCalledWith(
        "/shops/test-shop/feature",
        expect.objectContaining({ featured: true })
      );
      expect(result.id).toBe("shop123");
    });

    it("should unfeature shop", async () => {
      mockApiService.patch.mockResolvedValue({
        data: { ...mockShopBE, featured: false },
      });

      const result = await shopsService.setFeatureFlags("test-shop", {
        featured: false,
      });

      expect(result.id).toBe("shop123");
    });
  });

  describe("getPayments", () => {
    it("should get shop payments", async () => {
      const mockPayments = [
        { id: "pay1", amount: 1000, status: "completed" },
        { id: "pay2", amount: 2000, status: "pending" },
      ];

      mockApiService.get.mockResolvedValue(mockPayments);

      const result = await shopsService.getPayments("test-shop");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/shops/test-shop/payments"
      );
      expect(result).toHaveLength(2);
    });
  });

  describe("processPayment", () => {
    it("should process payment", async () => {
      const paymentData = {
        amount: 5000,
        description: "Monthly payout",
        dueDate: new Date(),
      };

      mockApiService.post.mockResolvedValue({
        id: "pay1",
        status: "completed",
      });

      const result = await shopsService.processPayment(
        "test-shop",
        paymentData
      );

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/shops/test-shop/payments",
        paymentData
      );
      expect(result.id).toBe("pay1");
    });
  });

  describe("getStats", () => {
    it("should get shop statistics", async () => {
      const mockStats = {
        totalProducts: 50,
        totalSales: 1000,
        totalRevenue: 50000,
        averageRating: 4.5,
      };

      mockApiService.get.mockResolvedValue(mockStats);

      const result = await shopsService.getStats("test-shop");

      expect(mockApiService.get).toHaveBeenCalledWith("/shops/test-shop/stats");
      expect(result.totalProducts).toBe(50);
    });
  });

  describe("getShopProducts", () => {
    it("should get shop products with pagination", async () => {
      const mockResponse = {
        data: [{ id: "prod1" }, { id: "prod2" }],
        count: 2,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await shopsService.getShopProducts("test-shop", {
        page: 1,
        limit: 20,
      });

      expect(result.data).toHaveLength(2);
      expect(result.count).toBe(2);
    });

    it("should get shop products without options", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {
          page: 1,
          limit: 20,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false,
        },
      };

      mockApiService.get.mockResolvedValue(mockResponse);

      const result = await shopsService.getShopProducts("test-shop");

      expect(result.data).toHaveLength(0);
    });
  });

  describe("getShopReviews", () => {
    it("should get shop reviews", async () => {
      const mockReviews = {
        data: [{ id: "rev1" }, { id: "rev2" }],
        count: 2,
      };

      mockApiService.get.mockResolvedValue(mockReviews);

      const result = await shopsService.getShopReviews("test-shop", 1, 20);

      expect(result.data).toHaveLength(2);
    });
  });

  describe("follow", () => {
    it("should follow shop", async () => {
      mockApiService.post.mockResolvedValue({
        message: "Shop followed successfully",
      });

      const result = await shopsService.follow("test-shop");

      expect(mockApiService.post).toHaveBeenCalledWith(
        "/shops/test-shop/follow",
        {}
      );
      expect(result.message).toBe("Shop followed successfully");
    });
  });

  describe("unfollow", () => {
    it("should unfollow shop", async () => {
      mockApiService.delete.mockResolvedValue({
        message: "Shop unfollowed successfully",
      });

      const result = await shopsService.unfollow("test-shop");

      expect(mockApiService.delete).toHaveBeenCalledWith(
        "/shops/test-shop/follow"
      );
      expect(result.message).toBe("Shop unfollowed successfully");
    });
  });

  describe("checkFollowing", () => {
    it("should check if following shop", async () => {
      mockApiService.get.mockResolvedValue({ isFollowing: true });

      const result = await shopsService.checkFollowing("test-shop");

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/shops/test-shop/follow"
      );
      expect(result.isFollowing).toBe(true);
    });

    it("should return false if not following", async () => {
      mockApiService.get.mockResolvedValue({ isFollowing: false });

      const result = await shopsService.checkFollowing("test-shop");

      expect(result.isFollowing).toBe(false);
    });
  });

  describe("getFollowing", () => {
    it("should get following shops", async () => {
      mockApiService.get.mockResolvedValue({
        shops: [mockShopBE, { ...mockShopBE, id: "shop456" }],
        count: 2,
      });

      const result = await shopsService.getFollowing();

      expect(mockApiService.get).toHaveBeenCalledWith("/shops/following");
      expect(result.shops).toHaveLength(2);
      expect(result.count).toBe(2);
    });

    it("should handle empty following list", async () => {
      mockApiService.get.mockResolvedValue({ shops: [], count: 0 });

      const result = await shopsService.getFollowing();

      expect(result.shops).toHaveLength(0);
      expect(result.count).toBe(0);
    });
  });

  describe("getFeatured", () => {
    it("should get featured shops", async () => {
      mockApiService.get.mockResolvedValue({
        data: [mockShopBE, { ...mockShopBE, id: "shop456" }],
      });

      const result = await shopsService.getFeatured();

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/shops?featured=true&verified=true&limit=100"
      );
      expect(result).toHaveLength(2);
    });

    it("should handle empty featured shops", async () => {
      mockApiService.get.mockResolvedValue({ data: [] });

      const result = await shopsService.getFeatured();

      expect(result).toHaveLength(0);
    });
  });

  describe("getHomepage", () => {
    it("should get homepage shops", async () => {
      mockApiService.get.mockResolvedValue({ data: [mockShopBE] });

      const result = await shopsService.getHomepage();

      expect(mockApiService.get).toHaveBeenCalledWith(
        "/shops?featured=true&verified=true&limit=20"
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("bulk operations", () => {
    const mockBulkResponse = {
      success: true,
      results: {
        success: ["shop1", "shop2"],
        failed: [],
      },
      summary: { total: 2, succeeded: 2, failed: 0 },
    };

    it("should bulk verify shops", async () => {
      mockApiService.post.mockResolvedValue(mockBulkResponse);

      const result = await shopsService.bulkVerify(["shop1", "shop2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "verify",
        ids: ["shop1", "shop2"],
      });
      expect(result.summary.succeeded).toBe(2);
    });

    it("should bulk unverify shops", async () => {
      mockApiService.post.mockResolvedValue(mockBulkResponse);

      const result = await shopsService.bulkUnverify(["shop1", "shop2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "unverify",
        ids: ["shop1", "shop2"],
      });
    });

    it("should bulk feature shops", async () => {
      mockApiService.post.mockResolvedValue(mockBulkResponse);

      const result = await shopsService.bulkFeature(["shop1", "shop2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "feature",
        ids: ["shop1", "shop2"],
      });
    });

    it("should bulk unfeature shops", async () => {
      mockApiService.post.mockResolvedValue(mockBulkResponse);

      const result = await shopsService.bulkUnfeature(["shop1", "shop2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "unfeature",
        ids: ["shop1", "shop2"],
      });
    });

    it("should bulk activate shops", async () => {
      mockApiService.post.mockResolvedValue(mockBulkResponse);

      const result = await shopsService.bulkActivate(["shop1", "shop2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "activate",
        ids: ["shop1", "shop2"],
      });
    });

    it("should bulk deactivate shops", async () => {
      mockApiService.post.mockResolvedValue(mockBulkResponse);

      const result = await shopsService.bulkDeactivate(["shop1", "shop2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "deactivate",
        ids: ["shop1", "shop2"],
      });
    });

    it("should bulk ban shops", async () => {
      mockApiService.post.mockResolvedValue(mockBulkResponse);

      const result = await shopsService.bulkBan(
        ["shop1", "shop2"],
        "Violated terms"
      );

      expect(mockApiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "ban",
        ids: ["shop1", "shop2"],
        data: { banReason: "Violated terms" },
      });
    });

    it("should bulk unban shops", async () => {
      mockApiService.post.mockResolvedValue(mockBulkResponse);

      const result = await shopsService.bulkUnban(["shop1", "shop2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "unban",
        ids: ["shop1", "shop2"],
      });
    });

    it("should bulk delete shops", async () => {
      mockApiService.post.mockResolvedValue(mockBulkResponse);

      const result = await shopsService.bulkDelete(["shop1", "shop2"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "delete",
        ids: ["shop1", "shop2"],
      });
    });

    it("should bulk update shops", async () => {
      const updates = { featured: true };
      mockApiService.post.mockResolvedValue(mockBulkResponse);

      const result = await shopsService.bulkUpdate(["shop1", "shop2"], updates);

      expect(mockApiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "update",
        ids: ["shop1", "shop2"],
        data: updates,
      });
    });

    it("should handle partial bulk failures", async () => {
      const partialResponse = {
        success: false,
        results: {
          success: ["shop1"],
          failed: [{ id: "shop2", error: "Not found" }],
        },
        summary: { total: 2, succeeded: 1, failed: 1 },
      };

      mockApiService.post.mockResolvedValue(partialResponse);

      const result = await shopsService.bulkVerify(["shop1", "shop2"]);

      expect(result.summary.failed).toBe(1);
    });
  });

  describe("getByIds", () => {
    it("should batch fetch shops by IDs", async () => {
      mockApiService.post.mockResolvedValue({
        data: [mockShopBE, { ...mockShopBE, id: "shop456" }],
      });

      const result = await shopsService.getByIds(["shop123", "shop456"]);

      expect(mockApiService.post).toHaveBeenCalledWith("/shops/batch", {
        ids: ["shop123", "shop456"],
      });
      expect(result).toHaveLength(2);
    });

    it("should return empty array for empty IDs", async () => {
      const result = await shopsService.getByIds([]);

      expect(result).toHaveLength(0);
      expect(mockApiService.post).not.toHaveBeenCalled();
    });

    it("should handle batch fetch error gracefully", async () => {
      const error = new Error("API error");
      mockApiService.post.mockRejectedValue(error);

      const result = await shopsService.getByIds(["shop123"]);

      expect(result).toHaveLength(0);
    });
  });
});
