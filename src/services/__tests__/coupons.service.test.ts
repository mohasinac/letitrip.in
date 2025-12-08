import type { CouponBE, CouponFiltersBE } from "@/types/backend/coupon.types";
import type { CouponFormFE } from "@/types/frontend/coupon.types";
import type {
  BulkActionResponse,
  PaginatedResponseBE,
} from "@/types/shared/common.types";
import { apiService } from "../api.service";
import { couponsService } from "../coupons.service";

// Mock dependencies
jest.mock("../api.service");
jest.mock("@/lib/error-logger");
jest.mock("@/types/transforms/coupon.transforms", () => ({
  toFECoupon: (coupon: any) => ({ ...coupon, _transformed: true }),
  toFECoupons: (coupons: any[]) =>
    coupons.map((c) => ({ ...c, _transformed: true })),
  toBECreateCouponRequest: (data: any) => ({
    ...data,
    _createRequest: true,
  }),
  toBEUpdateCouponRequest: (data: any) => ({
    ...data,
    _updateRequest: true,
  }),
}));

describe("CouponsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("list", () => {
    it("should list coupons with filters", async () => {
      const mockResponse: PaginatedResponseBE<CouponBE> = {
        data: [
          { code: "SAVE10", discount: 10 } as CouponBE,
          { code: "SAVE20", discount: 20 } as CouponBE,
        ],
        count: 2,
        pagination: { page: 1, limit: 10, total: 2, hasMore: false },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const filters: Partial<CouponFiltersBE> = {
        status: "active",
        limit: 10,
      };

      const result = await couponsService.list(filters);

      expect(apiService.get).toHaveBeenCalled();
      expect(result.data).toHaveLength(2);
      expect(result.data[0]._transformed).toBe(true);
      expect(result.count).toBe(2);
    });

    it("should list coupons without filters", async () => {
      const mockResponse: PaginatedResponseBE<CouponBE> = {
        data: [],
        count: 0,
        pagination: { page: 1, limit: 10, total: 0, hasMore: false },
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.list();

      expect(result.data).toEqual([]);
    });

    it("should handle API errors", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      await expect(couponsService.list()).rejects.toThrow("API Error");
    });
  });

  describe("getById", () => {
    it("should fetch coupon by ID", async () => {
      const mockCoupon: CouponBE = {
        code: "SAVE10",
        discount: 10,
      } as CouponBE;

      (apiService.get as jest.Mock).mockResolvedValue(mockCoupon);

      const result = await couponsService.getById("SAVE10");

      expect(apiService.get).toHaveBeenCalledWith("/coupons/SAVE10");
      expect(result._transformed).toBe(true);
    });

    it("should handle not found error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(
        new Error("Coupon not found")
      );

      await expect(couponsService.getById("INVALID")).rejects.toThrow(
        "Coupon not found"
      );
    });
  });

  describe("getByCode", () => {
    it("should fetch coupon by code", async () => {
      const mockCoupon: CouponBE = {
        code: "SAVE10",
        discount: 10,
      } as CouponBE;

      (apiService.get as jest.Mock).mockResolvedValue(mockCoupon);

      const result = await couponsService.getByCode("SAVE10");

      expect(apiService.get).toHaveBeenCalledWith("/coupons/SAVE10");
      expect(result._transformed).toBe(true);
    });
  });

  describe("create", () => {
    it("should create coupon successfully", async () => {
      const mockFormData: CouponFormFE = {
        code: "SAVE10",
        discount: 10,
        type: "percentage",
      } as CouponFormFE;

      const mockCreated: CouponBE = {
        code: "SAVE10",
        discount: 10,
      } as CouponBE;

      (apiService.post as jest.Mock).mockResolvedValue(mockCreated);

      const result = await couponsService.create(mockFormData);

      expect(apiService.post).toHaveBeenCalledWith("/coupons", {
        ...mockFormData,
        _createRequest: true,
      });
      expect(result._transformed).toBe(true);
    });

    it("should handle creation errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Code already exists")
      );

      await expect(couponsService.create({} as CouponFormFE)).rejects.toThrow(
        "Code already exists"
      );
    });
  });

  describe("update", () => {
    it("should update coupon successfully", async () => {
      const mockUpdateData: Partial<CouponFormFE> = {
        discount: 15,
      };

      const mockUpdated: CouponBE = {
        code: "SAVE10",
        discount: 15,
      } as CouponBE;

      (apiService.patch as jest.Mock).mockResolvedValue(mockUpdated);

      const result = await couponsService.update("SAVE10", mockUpdateData);

      expect(apiService.patch).toHaveBeenCalledWith("/coupons/SAVE10", {
        ...mockUpdateData,
        _updateRequest: true,
      });
      expect(result._transformed).toBe(true);
    });

    it("should handle update errors", async () => {
      (apiService.patch as jest.Mock).mockRejectedValue(
        new Error("Update failed")
      );

      await expect(couponsService.update("SAVE10", {})).rejects.toThrow(
        "Update failed"
      );
    });
  });

  describe("delete", () => {
    it("should delete coupon successfully", async () => {
      const mockResponse = { message: "Coupon deleted" };

      (apiService.delete as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.delete("SAVE10");

      expect(apiService.delete).toHaveBeenCalledWith("/coupons/SAVE10");
      expect(result.message).toBe("Coupon deleted");
    });

    it("should handle deletion errors", async () => {
      (apiService.delete as jest.Mock).mockRejectedValue(
        new Error("Deletion failed")
      );

      await expect(couponsService.delete("SAVE10")).rejects.toThrow(
        "Deletion failed"
      );
    });
  });

  describe("validate", () => {
    it("should validate coupon successfully", async () => {
      const mockValidation = {
        valid: true,
        discount: 100,
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockValidation);

      const result = await couponsService.validate({
        code: "SAVE10",
        cartTotal: 1000,
        items: [
          {
            productId: "prod1",
            categoryId: "cat1",
            quantity: 1,
            price: 1000,
          },
        ],
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/coupons/validate",
        expect.objectContaining({
          code: "SAVE10",
          cartTotal: 1000,
        })
      );
      expect(result.valid).toBe(true);
      expect(result.discount).toBe(100);
    });

    it("should return invalid for expired coupon", async () => {
      const mockValidation = {
        valid: false,
        discount: 0,
        message: "Coupon expired",
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockValidation);

      const result = await couponsService.validate({
        code: "EXPIRED",
        cartTotal: 1000,
        items: [],
      });

      expect(result.valid).toBe(false);
      expect(result.message).toBe("Coupon expired");
    });
  });

  describe("validateCode", () => {
    it("should check code availability", async () => {
      const mockResponse = {
        available: true,
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.validateCode("NEWCODE");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("validate-code")
      );
      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("code=NEWCODE")
      );
      expect(result.available).toBe(true);
    });

    it("should check code availability with shop ID", async () => {
      const mockResponse = {
        available: false,
        message: "Code already in use",
      };

      (apiService.get as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.validateCode("SAVE10", "shop1");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("shop_id=shop1")
      );
      expect(result.available).toBe(false);
    });
  });

  describe("getPublic", () => {
    it("should fetch public coupons without shop filter", async () => {
      const mockCoupons: CouponBE[] = [
        { code: "SAVE10", discount: 10 } as CouponBE,
        { code: "SAVE20", discount: 20 } as CouponBE,
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockCoupons);

      const result = await couponsService.getPublic();

      expect(apiService.get).toHaveBeenCalledWith("/coupons/public");
      expect(result).toHaveLength(2);
      expect(result[0]._transformed).toBe(true);
    });

    it("should fetch public coupons with shop filter", async () => {
      const mockCoupons: CouponBE[] = [
        { code: "SHOP10", discount: 10, shopId: "shop1" } as CouponBE,
      ];

      (apiService.get as jest.Mock).mockResolvedValue(mockCoupons);

      const result = await couponsService.getPublic("shop1");

      expect(apiService.get).toHaveBeenCalledWith(
        expect.stringContaining("shopId=shop1")
      );
      expect(result).toHaveLength(1);
    });

    it("should return empty array on error", async () => {
      (apiService.get as jest.Mock).mockRejectedValue(new Error("API Error"));

      await expect(couponsService.getPublic()).rejects.toThrow("API Error");
    });
  });

  describe("bulkAction", () => {
    it("should perform bulk action successfully", async () => {
      const mockResponse: BulkActionResponse = {
        success: true,
        message: "Bulk action completed",
        successCount: 2,
        failureCount: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.bulkAction("activate", [
        "CODE1",
        "CODE2",
      ]);

      expect(apiService.post).toHaveBeenCalledWith("/coupons/bulk", {
        action: "activate",
        couponIds: ["CODE1", "CODE2"],
        data: undefined,
      });
      expect(result.successCount).toBe(2);
    });

    it("should handle bulk action errors", async () => {
      (apiService.post as jest.Mock).mockRejectedValue(
        new Error("Bulk action failed")
      );

      await expect(
        couponsService.bulkAction("activate", ["CODE1"])
      ).rejects.toThrow("Bulk action failed");
    });

    it("should pass data for bulk update", async () => {
      const mockResponse: BulkActionResponse = {
        success: true,
        message: "Updated",
        successCount: 1,
        failureCount: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      await couponsService.bulkAction("update", ["CODE1"], {
        discount: 15,
      });

      expect(apiService.post).toHaveBeenCalledWith(
        "/coupons/bulk",
        expect.objectContaining({
          data: { discount: 15 },
        })
      );
    });
  });

  describe("bulkActivate", () => {
    it("should activate multiple coupons", async () => {
      const mockResponse: BulkActionResponse = {
        success: true,
        message: "Activated",
        successCount: 3,
        failureCount: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.bulkActivate([
        "CODE1",
        "CODE2",
        "CODE3",
      ]);

      expect(result.successCount).toBe(3);
    });
  });

  describe("bulkDeactivate", () => {
    it("should deactivate multiple coupons", async () => {
      const mockResponse: BulkActionResponse = {
        success: true,
        message: "Deactivated",
        successCount: 2,
        failureCount: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.bulkDeactivate(["CODE1", "CODE2"]);

      expect(result.successCount).toBe(2);
    });
  });

  describe("bulkDelete", () => {
    it("should delete multiple coupons", async () => {
      const mockResponse: BulkActionResponse = {
        success: true,
        message: "Deleted",
        successCount: 2,
        failureCount: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await couponsService.bulkDelete(["CODE1", "CODE2"]);

      expect(result.successCount).toBe(2);
    });
  });

  describe("bulkUpdate", () => {
    it("should update multiple coupons", async () => {
      const mockResponse: BulkActionResponse = {
        success: true,
        message: "Updated",
        successCount: 2,
        failureCount: 0,
        errors: [],
      };

      (apiService.post as jest.Mock).mockResolvedValue(mockResponse);

      const updates: Partial<CouponFormFE> = {
        discount: 25,
      };

      const result = await couponsService.bulkUpdate(
        ["CODE1", "CODE2"],
        updates
      );

      expect(apiService.post).toHaveBeenCalledWith(
        "/coupons/bulk",
        expect.objectContaining({
          action: "update",
          data: { ...updates, _updateRequest: true },
        })
      );
      expect(result.successCount).toBe(2);
    });
  });
});
