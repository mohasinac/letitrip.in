import { apiService } from "../api.service";
import { shopsService } from "../shops.service";

jest.mock("../api.service");
jest.mock("@/lib/firebase-error-logger");

describe("ShopsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("lists shops with filters", async () => {
      const mockResponse = {
        data: [
          {
            id: "shop1",
            name: "Test Shop",
            slug: "test-shop",
            isVerified: true,
          },
        ],
        count: 1,
        pagination: { page: 1, limit: 10 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shopsService.list({ isVerified: true });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/shops")
      );
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("handles array filters", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: { page: 1, limit: 10 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await shopsService.list({ categories: ["cat1", "cat2"] });

      expect(apiService.get).toHaveBeenCalled();
    });

    it("handles empty shop list", async () => {
      (apiService.get as jest.Mock).mockResolvedValue({
        data: [],
        count: 0,
        pagination: { page: 1, limit: 10 },
      });

      const result = await shopsService.list();

      expect(result.data).toEqual([]);
      expect(result.count).toBe(0);
    });
  });

  describe("getBySlug", () => {
    it("gets shop by slug", async () => {
      const mockShop = {
        shop: {
          id: "shop1",
          name: "Test Shop",
          slug: "test-shop",
          description: "A test shop",
          createdAt: new Date().toISOString(),
          isVerified: false,
          rating: 0,
          totalProducts: 0,
          reviewCount: 0,
          totalSales: 0,
          settings: {
            acceptsOrders: true,
            minOrderAmount: 500,
            shippingCharge: 50,
            freeShippingAbove: 2000,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockShop);

      const result = await shopsService.getBySlug("test-shop");

      expect(apiService.get).toHaveBeenCalledWith("/shops/test-shop");
      expect(result).toBeDefined();
    });
  });

  describe("getById", () => {
    it("gets shop by ID", async () => {
      const mockShop = {
        shop: {
          id: "shop1",
          name: "Test Shop",
          createdAt: new Date().toISOString(),
          isVerified: false,
          rating: 0,
          totalProducts: 0,
          reviewCount: 0,
          totalSales: 0,
          settings: {
            acceptsOrders: true,
            minOrderAmount: 500,
            shippingCharge: 50,
            freeShippingAbove: 2000,
          },
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockShop);

      const result = await shopsService.getById("shop1");

      expect(apiService.get).toHaveBeenCalledWith("/shops/shop1");
      expect(result).toBeDefined();
    });
  });

  describe("create", () => {
    it("creates a new shop", async () => {
      const mockFormData = {
        name: "New Shop",
        slug: "new-shop",
        description: "A new shop",
        category: "electronics",
      };

      const mockShop = {
        data: {
          id: "shop1",
          ...mockFormData,
          createdAt: new Date().toISOString(),
          isVerified: false,
          rating: 0,
          totalProducts: 0,
          reviewCount: 0,
          totalSales: 0,
          settings: {
            acceptsOrders: true,
            minOrderAmount: 500,
            shippingCharge: 50,
            freeShippingAbove: 2000,
          },
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockShop);

      const result = await shopsService.create(mockFormData as any);

      expect(apiService.post).toHaveBeenCalledWith(
        "/shops",
        expect.any(Object)
      );
      expect(result).toBeDefined();
    });
  });

  describe("update", () => {
    it("updates an existing shop", async () => {
      const mockFormData = {
        name: "Updated Shop",
        description: "Updated description",
      };

      const mockShop = {
        data: {
          id: "shop1",
          ...mockFormData,
          createdAt: new Date().toISOString(),
          isVerified: false,
          rating: 0,
          totalProducts: 0,
          reviewCount: 0,
          totalSales: 0,
          settings: {
            acceptsOrders: true,
            minOrderAmount: 500,
            shippingCharge: 50,
            freeShippingAbove: 2000,
          },
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockShop);

      const result = await shopsService.update("shop1", mockFormData as any);

      expect(apiService.patch).toHaveBeenCalledWith(
        "/shops/shop1",
        expect.any(Object)
      );
      expect(result).toBeDefined();
    });
  });

  describe("delete", () => {
    it("deletes a shop", async () => {
      const mockResponse = { message: "Shop deleted successfully" };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shopsService.delete("shop1");

      expect(apiService.delete).toHaveBeenCalledWith("/shops/shop1");
      expect(result.message).toBe("Shop deleted successfully");
    });
  });

  describe("verify", () => {
    it("verifies a shop", async () => {
      const mockShop = {
        data: {
          id: "shop1",
          isVerified: true,
          verificationNotes: "All documents verified",
          createdAt: new Date().toISOString(),
          rating: 0,
          totalProducts: 0,
          reviewCount: 0,
          totalSales: 0,
          settings: {
            acceptsOrders: true,
            minOrderAmount: 500,
            shippingCharge: 50,
            freeShippingAbove: 2000,
          },
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockShop);

      const result = await shopsService.verify("shop1", {
        isVerified: true,
        verificationNotes: "All documents verified",
      });

      expect(apiService.patch).toHaveBeenCalledWith("/shops/shop1/verify", {
        isVerified: true,
        verificationNotes: "All documents verified",
      });
      expect(result).toBeDefined();
    });
  });

  describe("setFeatureFlags", () => {
    it("sets shop as featured", async () => {
      const mockShop = {
        data: {
          id: "shop1",
          featured: true,
          createdAt: new Date().toISOString(),
          isVerified: true,
          rating: 4.5,
          totalProducts: 50,
          reviewCount: 20,
          totalSales: 1000,
          settings: {
            acceptsOrders: true,
            minOrderAmount: 500,
            shippingCharge: 50,
            freeShippingAbove: 2000,
          },
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockShop);

      const result = await shopsService.setFeatureFlags("shop1", {
        featured: true,
      });

      expect(apiService.patch).toHaveBeenCalledWith("/shops/shop1/feature", {
        featured: true,
      });
      expect(result).toBeDefined();
    });
  });

  describe("ban", () => {
    it("bans a shop", async () => {
      const mockShop = {
        data: {
          id: "shop1",
          isBanned: true,
          banReason: "Policy violation",
          createdAt: new Date().toISOString(),
          isVerified: false,
          rating: 0,
          totalProducts: 0,
          reviewCount: 0,
          totalSales: 0,
          settings: {
            acceptsOrders: true,
            minOrderAmount: 500,
            shippingCharge: 50,
            freeShippingAbove: 2000,
          },
        },
      };

      (apiService.patch as jest.Mock).mockResolvedValue(mockShop);

      const result = await shopsService.ban("shop1", {
        isBanned: true,
        banReason: "Policy violation",
      });

      expect(apiService.patch).toHaveBeenCalledWith("/shops/shop1/ban", {
        isBanned: true,
        banReason: "Policy violation",
      });
      expect(result).toBeDefined();
    });
  });

  describe("getShopProducts", () => {
    it("gets shop products with pagination", async () => {
      const mockResponse = {
        data: [
          { id: "prod1", name: "Product 1", price: 1000 },
          { id: "prod2", name: "Product 2", price: 2000 },
        ],
        count: 2,
        pagination: { page: 1, limit: 10, total: 2, hasMore: false },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shopsService.getShopProducts("test-shop", {
        page: 1,
        limit: 10,
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/shops/test-shop/products")
      );
      expect(result.data).toHaveLength(2);
      expect(result.count).toBe(2);
    });

    it("handles filters in product list", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: { page: 1, limit: 10, total: 0, hasMore: false },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await shopsService.getShopProducts("test-shop", {
        filters: { category: "electronics" },
      });

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("category=electronics")
      );
    });
  });

  describe("getShopReviews", () => {
    it("gets shop reviews with pagination", async () => {
      const mockReviews = {
        data: [
          { id: "rev1", rating: 5, comment: "Great shop!" },
          { id: "rev2", rating: 4, comment: "Good service" },
        ],
        count: 2,
        pagination: { page: 1, limit: 10 },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockReviews);

      const result = await shopsService.getShopReviews("test-shop", 1, 10);

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/shops/test-shop/reviews")
      );
      expect(result.data).toHaveLength(2);
    });
  });

  describe("getPayments", () => {
    it("gets shop payments", async () => {
      const mockPayments = [
        { id: "pay1", amount: 1000, status: "paid" },
        { id: "pay2", amount: 2000, status: "pending" },
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockPayments);

      const result = await shopsService.getPayments("test-shop");

      expect(apiService.get).toHaveBeenCalledWith("/shops/test-shop/payments");
      expect(result).toHaveLength(2);
    });
  });

  describe("processPayment", () => {
    it("processes a shop payment", async () => {
      const paymentData = {
        amount: 5000,
        description: "Monthly subscription",
        dueDate: new Date("2024-12-31"),
      };

      const mockResponse = {
        id: "pay1",
        ...paymentData,
        status: "pending",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shopsService.processPayment(
        "test-shop",
        paymentData
      );

      expect(apiService.post).toHaveBeenCalledWith(
        "/shops/test-shop/payments",
        paymentData
      );
      expect(result.amount).toBe(5000);
    });
  });

  describe("follow operations", () => {
    it("follows a shop", async () => {
      const mockResponse = { message: "Shop followed successfully" };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shopsService.follow("test-shop");

      expect(apiService.post).toHaveBeenCalledWith(
        "/shops/test-shop/follow",
        {}
      );
      expect(result.message).toBe("Shop followed successfully");
    });

    it("unfollows a shop", async () => {
      const mockResponse = { message: "Shop unfollowed successfully" };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shopsService.unfollow("test-shop");

      expect(apiService.delete).toHaveBeenCalledWith("/shops/test-shop/follow");
      expect(result.message).toBe("Shop unfollowed successfully");
    });

    it("checks if following a shop", async () => {
      const mockResponse = { isFollowing: true };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shopsService.checkFollowing("test-shop");

      expect(apiService.get).toHaveBeenCalledWith("/shops/test-shop/follow");
      expect(result.isFollowing).toBe(true);
    });

    it("gets list of following shops", async () => {
      const mockResponse = {
        shops: [
          {
            id: "shop1",
            name: "Shop 1",
            slug: "shop-1",
            isVerified: true,
            totalProducts: 10,
            rating: 4.5,
            reviewCount: 20,
            totalSales: 500,
          },
        ],
        count: 1,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shopsService.getFollowing();

      expect(apiService.get).toHaveBeenCalledWith("/shops/following");
      expect(result.shops).toHaveLength(1);
      expect(result.count).toBe(1);
    });
  });

  describe("featured shops", () => {
    it("gets featured shops", async () => {
      const mockResponse = {
        data: [
          {
            id: "shop1",
            name: "Featured Shop 1",
            isVerified: true,
            totalProducts: 100,
            rating: 4.8,
            reviewCount: 50,
            totalSales: 1000,
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shopsService.getFeatured();

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("featured=true")
      );
      expect(result).toHaveLength(1);
    });

    it("gets homepage shops", async () => {
      const mockResponse = {
        data: [
          {
            id: "shop1",
            name: "Homepage Shop",
            isVerified: true,
            totalProducts: 50,
            rating: 4.5,
            reviewCount: 25,
            totalSales: 500,
          },
        ],
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shopsService.getHomepage();

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("limit=20")
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
      summary: {
        total: 2,
        succeeded: 2,
        failed: 0,
      },
    };

    it("bulk verifies shops", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      const result = await shopsService.bulkVerify(["shop1", "shop2"]);

      expect(apiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "verify",
        ids: ["shop1", "shop2"],
        data: undefined,
      });
      expect(result.success).toBe(true);
    });

    it("bulk unverifies shops", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await shopsService.bulkUnverify(["shop1", "shop2"]);

      expect(apiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "unverify",
        ids: ["shop1", "shop2"],
        data: undefined,
      });
    });

    it("bulk features shops", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await shopsService.bulkFeature(["shop1", "shop2"]);

      expect(apiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "feature",
        ids: ["shop1", "shop2"],
        data: undefined,
      });
    });

    it("bulk unfeatures shops", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await shopsService.bulkUnfeature(["shop1", "shop2"]);

      expect(apiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "unfeature",
        ids: ["shop1", "shop2"],
        data: undefined,
      });
    });

    it("bulk activates shops", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await shopsService.bulkActivate(["shop1", "shop2"]);

      expect(apiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "activate",
        ids: ["shop1", "shop2"],
        data: undefined,
      });
    });

    it("bulk deactivates shops", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await shopsService.bulkDeactivate(["shop1", "shop2"]);

      expect(apiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "deactivate",
        ids: ["shop1", "shop2"],
        data: undefined,
      });
    });

    it("bulk bans shops with reason", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await shopsService.bulkBan(["shop1", "shop2"], "Fraudulent activity");

      expect(apiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "ban",
        ids: ["shop1", "shop2"],
        data: { banReason: "Fraudulent activity" },
      });
    });

    it("bulk unbans shops", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await shopsService.bulkUnban(["shop1", "shop2"]);

      expect(apiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "unban",
        ids: ["shop1", "shop2"],
        data: undefined,
      });
    });

    it("bulk deletes shops", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await shopsService.bulkDelete(["shop1", "shop2"]);

      expect(apiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "delete",
        ids: ["shop1", "shop2"],
        data: undefined,
      });
    });

    it("bulk updates shops", async () => {
      (apiService.post as jest.Mock).mockResolvedValue(mockBulkResponse);

      await shopsService.bulkUpdate(["shop1", "shop2"], {
        shippingCharge: 100,
      });

      expect(apiService.post).toHaveBeenCalledWith("/shops/bulk", {
        action: "update",
        ids: ["shop1", "shop2"],
        data: { shippingCharge: 100 },
      });
    });

    it("handles partial failures in bulk operations", async () => {
      const mockPartialResponse = {
        success: false,
        results: {
          success: ["shop1"],
          failed: [{ id: "shop2", error: "Shop not found" }],
        },
        summary: {
          total: 2,
          succeeded: 1,
          failed: 1,
        },
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockPartialResponse);

      const result = await shopsService.bulkVerify(["shop1", "shop2"]);

      expect(result.summary.succeeded).toBe(1);
      expect(result.summary.failed).toBe(1);
    });
  });

  describe("getByIds", () => {
    it("fetches shops by batch IDs", async () => {
      const mockResponse = {
        data: [
          {
            id: "shop1",
            name: "Shop 1",
            slug: "shop-1",
            isVerified: true,
            totalProducts: 10,
            rating: 4.5,
            reviewCount: 20,
            totalSales: 500,
          },
          {
            id: "shop2",
            name: "Shop 2",
            slug: "shop-2",
            isVerified: false,
            totalProducts: 5,
            rating: 4.0,
            reviewCount: 10,
            totalSales: 200,
          },
        ],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await shopsService.getByIds(["shop1", "shop2"]);

      expect(apiService.post).toHaveBeenCalledWith("/shops/batch", {
        ids: ["shop1", "shop2"],
      });
      expect(result).toHaveLength(2);
    });

    it("returns empty array for empty IDs", async () => {
      const result = await shopsService.getByIds([]);

      expect(result).toEqual([]);
      expect(apiService.post).not.toHaveBeenCalled();
    });

    it("returns empty array on error", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      const result = await shopsService.getByIds(["shop1"]);

      expect(result).toEqual([]);
    });
  });

  describe("getStats", () => {
    it("gets shop statistics", async () => {
      const mockStats = {
        totalProducts: 50,
        totalOrders: 100,
        totalRevenue: 50000,
        averageRating: 4.5,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await shopsService.getStats("shop1");

      expect(apiService.get).toHaveBeenCalledWith("/shops/shop1/stats");
      expect(result.totalProducts).toBe(50);
      expect(result.totalRevenue).toBe(50000);
    });
  });

  describe("error handling", () => {
    it("handles API errors in list", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Network error")
      );

      await expect(shopsService.list()).rejects.toThrow("Network error");
    });

    it("handles API errors in create", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Validation failed")
      );

      await expect(shopsService.create({} as any)).rejects.toThrow(
        "Validation failed"
      );
    });
  });
});
