import { apiService } from "@/services/api.service";
import { couponsService } from "@/services/coupons.service";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

// Mock dependencies
jest.mock("@/services/api.service");
jest.mock("@/lib/error-logger");

const mockApiService = apiService as jest.Mocked<typeof apiService>;

const mockTimestamp = () => ({ toDate: () => new Date("2024-01-01") });

const createMockCoupon = (overrides: Record<string, unknown> = {}) => ({
  id: "coupon-1",
  shopId: "shop-1",
  code: "SAVE10",
  name: "Save 10%",
  description: "Save 10% on all items",
  type: "percentage",
  discountValue: 10,
  maxDiscountAmount: 100,
  minPurchaseAmount: 0,
  minQuantity: 1,
  applicability: "all",
  usageLimit: 100,
  usageLimitPerUser: 1,
  usageCount: 0,
  status: "active",
  firstOrderOnly: false,
  newUsersOnly: false,
  canCombineWithOtherCoupons: true,
  autoApply: false,
  isPublic: true,
  featured: false,
  startDate: mockTimestamp(),
  endDate: mockTimestamp(),
  createdAt: mockTimestamp(),
  updatedAt: mockTimestamp(),
  ...overrides,
});

describe("CouponsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Setup default mocks
    mockApiService.get = jest.fn();
    mockApiService.post = jest.fn();
    mockApiService.patch = jest.fn();
    mockApiService.delete = jest.fn();
  });

  describe("list", () => {
    it("should list coupons with default params", async () => {
      const mockResponse = {
        data: [createMockCoupon()],
        count: 1,
        pagination: {
          page: 1,
          pageSize: 20,
          total: 1,
          totalPages: 1,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.list();

      expect(apiService.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(1);
      expect(result.count).toBe(1);
    });

    it("should list coupons with filters", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 0,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      await couponsService.list({ active: true, shopId: "shop-1" });

      expect(apiService.get).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should get coupon by ID", async () => {
      const mockCoupon = createMockCoupon({
        code: "SAVE20",
        discountValue: 20,
      });

      (apiService.get as jest.Mock).mockResolvedValue(mockCoupon);

      const result = await couponsService.getById("coupon-1");

      expect(apiService.get).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("getByCode", () => {
    it("should get coupon by code", async () => {
      const mockCoupon = createMockCoupon({
        code: "SAVE20",
        discountValue: 20,
      });

      (apiService.get as jest.Mock).mockResolvedValue(mockCoupon);

      const result = await couponsService.getByCode("SAVE20");

      expect(apiService.get).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("create", () => {
    it("should create new coupon", async () => {
      const mockCoupon = createMockCoupon({
        id: "coupon-new",
        code: "NEWCODE",
        type: "flat",
        discountValue: 500,
      });

      (apiService.post as jest.Mock).mockResolvedValue(mockCoupon);

      const data = {
        code: "NEWCODE",
        type: "fixed" as const,
        value: 500,
        description: "Test coupon",
      };

      const result = await couponsService.create(data);

      expect(apiService.post).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("update", () => {
    it("should update coupon", async () => {
      const mockCoupon = createMockCoupon({
        code: "SAVE20",
        discountValue: 25,
      });

      (apiService.patch as jest.Mock).mockResolvedValue(mockCoupon);

      const result = await couponsService.update("SAVE20", { value: 25 });

      expect(apiService.patch).toHaveBeenCalled();
      expect(result).toBeDefined();
    });
  });

  describe("delete", () => {
    it("should delete coupon", async () => {
      const mockResponse = { message: "Coupon deleted successfully" };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.delete("SAVE20");

      expect(apiService.delete).toHaveBeenCalled();
      expect(result.message).toBe("Coupon deleted successfully");
    });
  });

  describe("validate", () => {
    it("should validate coupon successfully", async () => {
      const mockResponse = {
        valid: true,
        discount: 1000,
        message: "Coupon applied",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = {
        code: "SAVE10",
        cartTotal: 10000,
        items: [
          {
            productId: "prod-1",
            categoryId: "cat-1",
            quantity: 1,
            price: 10000,
          },
        ],
      };

      const result = await couponsService.validate(data);

      expect(apiService.post).toHaveBeenCalled();
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(1000);
    });

    it("should handle invalid coupon", async () => {
      const mockResponse = {
        valid: false,
        discount: 0,
        message: "Coupon expired",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const data = {
        code: "EXPIRED",
        cartTotal: 10000,
        items: [],
      };

      const result = await couponsService.validate(data);

      expect(result.valid).toBe(false);
      expect(result.message).toBe("Coupon expired");
    });
  });

  describe("validateCode", () => {
    it("should check if code is available", async () => {
      const mockResponse = {
        available: true,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.validateCode("NEWCODE");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/coupons/validate-code?code=NEWCODE")
      );
      expect(result.available).toBe(true);
    });

    it("should check code availability for specific shop", async () => {
      const mockResponse = {
        available: false,
        message: "Code already exists",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.validateCode("EXISTING", "shop-1");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("code=EXISTING")
      );
      expect(result.available).toBe(false);
    });
  });

  describe("getPublic", () => {
    it("should get public coupons", async () => {
      const mockCoupons = [
        createMockCoupon({
          code: "PUBLIC10",
          discountValue: 10,
        }),
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockCoupons);

      const result = await couponsService.getPublic();

      expect(apiService.get).toHaveBeenCalledWith("/coupons/public");
      expect(result).toHaveLength(1);
    });

    it("should get public coupons for specific shop", async () => {
      const mockCoupons = [
        createMockCoupon({
          code: "SHOP10",
          discountValue: 10,
        }),
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockCoupons);

      await couponsService.getPublic("shop-1");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("/coupons/public?shopId=shop-1")
      );
    });
  });

  describe("bulkAction", () => {
    it("should perform bulk action", async () => {
      const mockResponse = {
        success: 3,
        failed: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.bulkAction("activate", [
        "coupon-1",
        "coupon-2",
        "coupon-3",
      ]);

      expect(apiService.post).toHaveBeenCalled();
      expect(result.success).toBe(3);
    });

    it("should handle bulk action errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Bulk action failed")
      );

      await expect(
        couponsService.bulkAction("activate", ["coupon-1"])
      ).rejects.toThrow("Bulk action failed");
    });
  });

  describe("bulkActivate", () => {
    it("should bulk activate coupons", async () => {
      const mockResponse = {
        success: 2,
        failed: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.bulkActivate([
        "coupon-1",
        "coupon-2",
      ]);

      expect(apiService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          action: "activate",
          couponIds: ["coupon-1", "coupon-2"],
        })
      );
      expect(result.success).toBe(2);
    });
  });

  describe("bulkDeactivate", () => {
    it("should bulk deactivate coupons", async () => {
      const mockResponse = {
        success: 2,
        failed: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.bulkDeactivate([
        "coupon-1",
        "coupon-2",
      ]);

      expect(apiService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          action: "deactivate",
        })
      );
      expect(result.success).toBe(2);
    });
  });

  describe("bulkDelete", () => {
    it("should bulk delete coupons", async () => {
      const mockResponse = {
        success: 2,
        failed: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.bulkDelete(["coupon-1", "coupon-2"]);

      expect(apiService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          action: "delete",
        })
      );
      expect(result.success).toBe(2);
    });
  });

  describe("bulkUpdate", () => {
    it("should bulk update coupons", async () => {
      const mockResponse = {
        success: 2,
        failed: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const updates = { value: 15 };

      const result = await couponsService.bulkUpdate(
        ["coupon-1", "coupon-2"],
        updates
      );

      expect(apiService.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          action: "update",
        })
      );
      expect(result.success).toBe(2);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty coupon list", async () => {
      const mockResponse = {
        data: [],
        count: 0,
        pagination: {
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 0,
        },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.list();

      expect(result.data).toHaveLength(0);
    });

    it("should handle bulk action with empty array", async () => {
      const mockResponse = {
        success: 0,
        failed: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.bulkActivate([]);

      expect(result.success).toBe(0);
    });

    it("should handle partial bulk action failures", async () => {
      const mockResponse = {
        success: 2,
        failed: 1,
        errors: [{ id: "coupon-3", message: "Already active" }],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.bulkActivate([
        "coupon-1",
        "coupon-2",
        "coupon-3",
      ]);

      expect(result.success).toBe(2);
      expect(result.failed).toBe(1);
    });

    it("should handle concurrent operations", async () => {
      const mockListResponse = {
        data: [],
        count: 0,
        pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
      };

      const mockArrayResponse: unknown[] = [];

      (apiService.get as jest.Mock)
        .mockResolvedValueOnce(mockListResponse)
        .mockResolvedValueOnce(mockListResponse)
        .mockResolvedValueOnce(mockArrayResponse);

      const promises = [
        couponsService.list(),
        couponsService.list({ active: true }),
        couponsService.getPublic(),
      ];

      await Promise.all(promises);

      expect(apiService.get).toHaveBeenCalledTimes(3);
    });
  });
});
