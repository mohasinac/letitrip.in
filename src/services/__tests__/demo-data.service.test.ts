import { ADMIN_ROUTES } from "@/constants/api-routes";
import { apiService } from "../api.service";
import { demoDataService, type StepResult } from "../demo-data.service";

jest.mock("../api.service", () => ({
  apiService: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
}));

describe("DemoDataService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("generateCategories", () => {
    it("should generate categories with default scale", async () => {
      const mockResult: StepResult = {
        success: true,
        step: "categories",
        data: { created: 10 },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResult);

      const result = await demoDataService.generateCategories();

      expect(apiService.post).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.GENERATE_STEP("categories"),
        { scale: 10 }
      );
      expect(result).toEqual(mockResult);
    });

    it("should generate categories with custom scale", async () => {
      const mockResult: StepResult = {
        success: true,
        step: "categories",
        data: { created: 20 },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResult);

      await demoDataService.generateCategories(20);

      expect(apiService.post).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.GENERATE_STEP("categories"),
        { scale: 20 }
      );
    });

    it("should handle errors", async () => {
      const mockError: StepResult = {
        success: false,
        step: "categories",
        error: "Generation failed",
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockError);

      const result = await demoDataService.generateCategories();

      expect(result.success).toBe(false);
      expect(result.error).toBe("Generation failed");
    });
  });

  describe("generateUsers", () => {
    it("should generate users", async () => {
      const mockResult: StepResult = {
        success: true,
        step: "users",
        data: { sellers: [], buyers: [] },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResult);

      const result = await demoDataService.generateUsers(15);

      expect(apiService.post).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.GENERATE_STEP("users"),
        { scale: 15 }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("generateShops", () => {
    it("should generate shops with sellers", async () => {
      const mockSellers = [
        { id: "seller_1", name: "Seller 1" },
        { id: "seller_2", name: "Seller 2" },
      ];
      const mockResult: StepResult = {
        success: true,
        step: "shops",
        data: { created: 2 },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResult);

      const result = await demoDataService.generateShops(mockSellers, 5);

      expect(apiService.post).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.GENERATE_STEP("shops"),
        { sellers: mockSellers, scale: 5 }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("generateProducts", () => {
    it("should generate products with shops and categories", async () => {
      const mockShops = [
        { id: "shop_1", ownerId: "seller_1", name: "Shop 1", slug: "shop-1" },
      ];
      const mockCategoryMap = {
        TCG: "cat_1",
        Beyblades: "cat_2",
      };
      const mockResult: StepResult = {
        success: true,
        step: "products",
        data: { created: 50 },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResult);

      const result = await demoDataService.generateProducts(
        mockShops,
        mockCategoryMap,
        25
      );

      expect(apiService.post).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.GENERATE_STEP("products"),
        {
          shops: mockShops,
          categoryMap: mockCategoryMap,
          scale: 25,
        }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("generateAuctions", () => {
    it("should generate auctions", async () => {
      const mockShops = [
        { id: "shop_1", ownerId: "seller_1", name: "Shop 1", slug: "shop-1" },
      ];
      const mockProductsByShop = {
        shop_1: ["prod_1", "prod_2"],
      };
      const mockResult: StepResult = {
        success: true,
        step: "auctions",
        data: { created: 10 },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResult);

      const result = await demoDataService.generateAuctions(
        mockShops,
        mockProductsByShop,
        10
      );

      expect(apiService.post).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.GENERATE_STEP("auctions"),
        {
          shops: mockShops,
          productsByShop: mockProductsByShop,
          scale: 10,
        }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("generateBids", () => {
    it("should generate bids", async () => {
      const mockAuctions = ["auction_1", "auction_2"];
      const mockBuyers = [
        { id: "buyer_1", name: "Buyer 1" },
        { id: "buyer_2", name: "Buyer 2" },
      ];
      const mockResult: StepResult = {
        success: true,
        step: "bids",
        data: { created: 20 },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResult);

      const result = await demoDataService.generateBids(
        mockAuctions,
        mockBuyers,
        10
      );

      expect(apiService.post).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.GENERATE_STEP("bids"),
        {
          auctions: mockAuctions,
          buyers: mockBuyers,
          scale: 10,
        }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("generateReviews", () => {
    it("should generate reviews", async () => {
      const mockProducts = ["prod_1", "prod_2"];
      const mockBuyers = [{ id: "buyer_1", name: "Buyer 1" }];
      const mockResult: StepResult = {
        success: true,
        step: "reviews",
        data: { created: 15 },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResult);

      const result = await demoDataService.generateReviews(
        mockProducts,
        mockBuyers,
        15
      );

      expect(apiService.post).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.GENERATE_STEP("reviews"),
        {
          products: mockProducts,
          buyers: mockBuyers,
          scale: 15,
        }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("generateOrders", () => {
    it("should generate orders", async () => {
      const mockShops = [
        { id: "shop_1", ownerId: "seller_1", name: "Shop 1", slug: "shop-1" },
      ];
      const mockBuyers = [{ id: "buyer_1", name: "Buyer 1" }];
      const mockProductsByShop = {
        shop_1: ["prod_1", "prod_2"],
      };
      const mockResult: StepResult = {
        success: true,
        step: "orders",
        data: { created: 30 },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResult);

      const result = await demoDataService.generateOrders(
        mockShops,
        mockBuyers,
        mockProductsByShop,
        15
      );

      expect(apiService.post).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.GENERATE_STEP("orders"),
        {
          shops: mockShops,
          buyers: mockBuyers,
          productsByShop: mockProductsByShop,
          scale: 15,
        }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("generateExtras", () => {
    it("should generate extras with all parameters", async () => {
      const mockParams = {
        shops: [
          { id: "shop_1", ownerId: "seller_1", name: "Shop 1", slug: "shop-1" },
        ],
        buyers: [{ id: "buyer_1", name: "Buyer 1" }],
        users: [{ id: "user_1", name: "User 1", role: "user" }],
        products: ["prod_1"],
        scale: 10,
      };
      const mockResult: StepResult = {
        success: true,
        step: "extras",
        data: { created: 100 },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResult);

      const result = await demoDataService.generateExtras(mockParams);

      expect(apiService.post).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.GENERATE_STEP("extras"),
        mockParams
      );
      expect(result).toEqual(mockResult);
    });

    it("should generate extras with minimal parameters", async () => {
      const mockResult: StepResult = {
        success: true,
        step: "extras",
        data: { created: 50 },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResult);

      await demoDataService.generateExtras({});

      expect(apiService.post).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.GENERATE_STEP("extras"),
        {}
      );
    });
  });

  describe("generateSettings", () => {
    it("should generate settings", async () => {
      const mockResult: StepResult = {
        success: true,
        step: "settings",
        data: { created: 5 },
      };
      (apiService.post as jest.Mock).mockResolvedValue(mockResult);

      const result = await demoDataService.generateSettings(8);

      expect(apiService.post).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.GENERATE_STEP("settings"),
        { scale: 8 }
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe("getStats", () => {
    it("should get demo data statistics when exists", async () => {
      const mockStats = {
        exists: true,
        summary: {
          categories: 10,
          users: 20,
          shops: 15,
          products: 100,
          auctions: 30,
          bids: 50,
          orders: 40,
          payments: 40,
          shipments: 35,
          reviews: 60,
          prefix: "DEMO_",
          createdAt: "2024-12-08T00:00:00Z",
        },
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await demoDataService.getStats();

      expect(apiService.get).toHaveBeenCalledWith(ADMIN_ROUTES.DEMO.STATS);
      expect(result).toEqual(mockStats);
    });

    it("should return no data when demo data does not exist", async () => {
      const mockStats = {
        exists: false,
        summary: null,
      };
      (apiService.get as jest.Mock).mockResolvedValue(mockStats);

      const result = await demoDataService.getStats();

      expect(result.exists).toBe(false);
      expect(result.summary).toBeNull();
    });
  });

  describe("cleanupAll", () => {
    it("should cleanup all demo data", async () => {
      const mockResponse = {
        deleted: 500,
        prefix: "DEMO_",
        breakdown: [
          { collection: "users", count: 20 },
          { collection: "products", count: 100 },
          { collection: "orders", count: 40 },
        ],
      };
      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await demoDataService.cleanupAll();

      expect(apiService.delete).toHaveBeenCalledWith(
        ADMIN_ROUTES.DEMO.CLEANUP_ALL
      );
      expect(result).toEqual(mockResponse);
    });

    it("should handle cleanup with no data", async () => {
      const mockResponse = {
        deleted: 0,
        prefix: "DEMO_",
        breakdown: [],
      };
      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await demoDataService.cleanupAll();

      expect(result.deleted).toBe(0);
    });
  });

  describe("cleanupStep", () => {
    it("should cleanup specific step", async () => {
      const mockResult: StepResult = {
        success: true,
        step: "products",
        data: { deleted: 100 },
      };
      (apiService.delete as jest.Mock).mockResolvedValue(mockResult);

      const result = await demoDataService.cleanupStep("products");

      expect(apiService.delete).toHaveBeenCalledWith(
        "/admin/demo/cleanup/products"
      );
      expect(result).toEqual(mockResult);
    });

    it("should cleanup categories step", async () => {
      const mockResult: StepResult = {
        success: true,
        step: "categories",
        data: { deleted: 10 },
      };
      (apiService.delete as jest.Mock).mockResolvedValue(mockResult);

      await demoDataService.cleanupStep("categories");

      expect(apiService.delete).toHaveBeenCalledWith(
        "/admin/demo/cleanup/categories"
      );
    });

    it("should handle cleanup errors", async () => {
      const mockResult: StepResult = {
        success: false,
        step: "orders",
        error: "Cleanup failed",
      };
      (apiService.delete as jest.Mock).mockResolvedValue(mockResult);

      const result = await demoDataService.cleanupStep("orders");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Cleanup failed");
    });
  });
});
