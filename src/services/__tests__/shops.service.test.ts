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

  // Note: feature method doesn't exist in shops.service - skipping test

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

  // Note: getProducts method doesn't exist in shops.service - skipping test

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
