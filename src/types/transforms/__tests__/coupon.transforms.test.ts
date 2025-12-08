/**
 * COUPON TRANSFORMATION TESTS
 *
 * Tests for coupon type transformations between Backend and Frontend
 */

import { Timestamp } from "firebase/firestore";
import {
  BogoConfigBE,
  CouponBE,
  TieredDiscountBE,
} from "../../backend/coupon.types";
import { CouponFormFE } from "../../frontend/coupon.types";
import { CouponStatus } from "../../shared/common.types";
import {
  toBECreateCouponRequest,
  toBEUpdateCouponRequest,
  toFECoupon,
  toFECouponCard,
  toFECouponCards,
  toFECoupons,
} from "../coupon.transforms";

describe("Coupon Transformations", () => {
  const mockNow = new Date("2024-01-15T10:00:00Z");
  const mockStartDate = Timestamp.fromDate(new Date("2024-01-10T00:00:00Z"));
  const mockEndDate = Timestamp.fromDate(new Date("2024-02-10T23:59:59Z"));
  const mockCreatedAt = Timestamp.fromDate(new Date("2024-01-01T10:00:00Z"));
  const mockUpdatedAt = Timestamp.fromDate(new Date("2024-01-15T09:00:00Z"));

  // Mock current time
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockNow);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  const mockTieredDiscount: TieredDiscountBE = {
    minAmount: 1000,
    discountPercentage: 10,
  };

  const mockBogoConfig: BogoConfigBE = {
    buyQuantity: 2,
    getQuantity: 1,
    discountPercentage: 50,
  };

  const mockCouponBE: CouponBE = {
    id: "coupon_123",
    shopId: "shop_123",
    code: "SAVE10",
    name: "10% Off Coupon",
    description: "Get 10% off on all products",
    type: "percentage",
    discountValue: 10,
    maxDiscountAmount: 500,
    tiers: undefined,
    bogoConfig: undefined,
    minPurchaseAmount: 500,
    minQuantity: 1,
    applicability: "all",
    applicableCategories: [],
    applicableProducts: [],
    excludedCategories: [],
    excludedProducts: [],
    usageLimit: 100,
    usageLimitPerUser: 1,
    usageCount: 25,
    startDate: mockStartDate,
    endDate: mockEndDate,
    status: CouponStatus.ACTIVE,
    firstOrderOnly: false,
    newUsersOnly: false,
    canCombineWithOtherCoupons: true,
    autoApply: false,
    isPublic: true,
    featured: true,
    createdAt: mockCreatedAt,
    updatedAt: mockUpdatedAt,
  };

  describe("toFECoupon", () => {
    it("should transform basic coupon fields", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.id).toBe("coupon_123");
      expect(result.shopId).toBe("shop_123");
      expect(result.code).toBe("SAVE10");
      expect(result.name).toBe("10% Off Coupon");
      expect(result.description).toBe("Get 10% off on all products");
      expect(result.type).toBe("percentage");
      expect(result.discountValue).toBe(10);
      expect(result.maxDiscountAmount).toBe(500);
    });

    it("should parse dates correctly", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("should format dates", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.formattedStartDate).toBeTruthy();
      expect(result.formattedEndDate).toBeTruthy();
    });

    it("should calculate isActive flag", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.isActive).toBe(true);
      expect(result.isExpired).toBe(false);
      expect(result.isUsedUp).toBe(false);
      expect(result.canBeUsed).toBe(true);
    });

    it("should mark expired coupons", () => {
      const expiredCoupon = {
        ...mockCouponBE,
        endDate: Timestamp.fromDate(new Date("2024-01-01T00:00:00Z")),
      };
      const result = toFECoupon(expiredCoupon);

      expect(result.isExpired).toBe(true);
      expect(result.isActive).toBe(false);
      expect(result.canBeUsed).toBe(false);
    });

    it("should mark used up coupons", () => {
      const usedUpCoupon = {
        ...mockCouponBE,
        usageCount: 100,
        usageLimit: 100,
      };
      const result = toFECoupon(usedUpCoupon);

      expect(result.isUsedUp).toBe(true);
      expect(result.isActive).toBe(false);
    });

    it("should mark inactive coupons", () => {
      const inactiveCoupon = {
        ...mockCouponBE,
        status: CouponStatus.INACTIVE,
      };
      const result = toFECoupon(inactiveCoupon);

      expect(result.isActive).toBe(false);
    });

    it("should calculate remaining uses", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.remainingUses).toBe(75);
      expect(result.usagePercentage).toBe(25);
    });

    it("should handle unlimited usage", () => {
      const unlimitedCoupon = {
        ...mockCouponBE,
        usageLimit: null,
      };
      const result = toFECoupon(unlimitedCoupon);

      expect(result.remainingUses).toBeUndefined();
      expect(result.usagePercentage).toBe(0);
    });

    it("should format percentage discount", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.formattedDiscount).toContain("10%");
      expect(result.formattedDiscount).toContain("off");
    });

    it("should format percentage discount with max amount", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.formattedDiscount).toContain("max");
      expect(result.formattedDiscount).toContain("500");
    });

    it("should format flat discount", () => {
      const flatCoupon = {
        ...mockCouponBE,
        type: "flat",
        discountValue: 100,
        maxDiscountAmount: undefined,
      };
      const result = toFECoupon(flatCoupon);

      expect(result.formattedDiscount).toContain("₹");
      expect(result.formattedDiscount).toContain("100");
    });

    it("should format free shipping discount", () => {
      const shippingCoupon = {
        ...mockCouponBE,
        type: "free-shipping",
        discountValue: undefined,
      };
      const result = toFECoupon(shippingCoupon);

      expect(result.formattedDiscount).toBe("Free Shipping");
    });

    it("should format BOGO discount", () => {
      const bogoCoupon = {
        ...mockCouponBE,
        type: "bogo",
        discountValue: undefined,
      };
      const result = toFECoupon(bogoCoupon);

      expect(result.formattedDiscount).toBe("Buy One Get One");
    });

    it("should format tiered discount", () => {
      const tieredCoupon = {
        ...mockCouponBE,
        type: "tiered",
        discountValue: undefined,
      };
      const result = toFECoupon(tieredCoupon);

      expect(result.formattedDiscount).toBe("Tiered Discount");
    });

    it("should transform tiered discounts", () => {
      const tieredCoupon = {
        ...mockCouponBE,
        type: "tiered",
        tiers: [mockTieredDiscount],
      };
      const result = toFECoupon(tieredCoupon);

      expect(result.tiers).toHaveLength(1);
      expect(result.tiers![0].minAmount).toBe(1000);
      expect(result.tiers![0].discountPercentage).toBe(10);
      expect(result.tiers![0].formattedMinAmount).toContain("₹");
      expect(result.tiers![0].formattedDiscount).toContain("10%");
    });

    it("should transform BOGO config", () => {
      const bogoCoupon = {
        ...mockCouponBE,
        type: "bogo",
        bogoConfig: mockBogoConfig,
      };
      const result = toFECoupon(bogoCoupon);

      expect(result.bogoConfig).toBeDefined();
      expect(result.bogoConfig!.buyQuantity).toBe(2);
      expect(result.bogoConfig!.getQuantity).toBe(1);
      expect(result.bogoConfig!.discountPercentage).toBe(50);
      expect(result.bogoConfig!.description).toContain("Buy 2 Get 1");
    });

    it("should format minimum purchase amount", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.formattedMinPurchase).toContain("₹");
      expect(result.formattedMinPurchase).toContain("500");
    });

    it("should calculate days until expiry", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.daysUntilExpiry).toBeGreaterThan(0);
    });

    it("should generate status badge for active coupon", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.statusBadge.text).toBe("Active");
      expect(result.statusBadge.variant).toBe("success");
    });

    it("should generate status badge for expired coupon", () => {
      const expiredCoupon = {
        ...mockCouponBE,
        endDate: Timestamp.fromDate(new Date("2024-01-01T00:00:00Z")),
      };
      const result = toFECoupon(expiredCoupon);

      expect(result.statusBadge.text).toBe("Expired");
      expect(result.statusBadge.variant).toBe("error");
    });

    it("should generate status badge for used up coupon", () => {
      const usedUpCoupon = {
        ...mockCouponBE,
        usageCount: 100,
        usageLimit: 100,
      };
      const result = toFECoupon(usedUpCoupon);

      expect(result.statusBadge.text).toBe("Used Up");
      expect(result.statusBadge.variant).toBe("error");
    });

    it("should generate status badge for inactive coupon", () => {
      const inactiveCoupon = {
        ...mockCouponBE,
        status: CouponStatus.INACTIVE,
      };
      const result = toFECoupon(inactiveCoupon);

      expect(result.statusBadge.text).toBe("Inactive");
      expect(result.statusBadge.variant).toBe("warning");
    });

    it("should handle applicability settings", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.applicability).toBe("all");
      expect(result.applicableCategories).toEqual([]);
      expect(result.applicableProducts).toEqual([]);
      expect(result.excludedCategories).toEqual([]);
      expect(result.excludedProducts).toEqual([]);
    });

    it("should handle category-specific coupon", () => {
      const categoryCoupon = {
        ...mockCouponBE,
        applicability: "category",
        applicableCategories: ["cat_123", "cat_456"],
      };
      const result = toFECoupon(categoryCoupon);

      expect(result.applicability).toBe("category");
      expect(result.applicableCategories).toEqual(["cat_123", "cat_456"]);
    });

    it("should handle product-specific coupon", () => {
      const productCoupon = {
        ...mockCouponBE,
        applicability: "product",
        applicableProducts: ["prod_123", "prod_456"],
      };
      const result = toFECoupon(productCoupon);

      expect(result.applicability).toBe("product");
      expect(result.applicableProducts).toEqual(["prod_123", "prod_456"]);
    });

    it("should handle user restriction flags", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.firstOrderOnly).toBe(false);
      expect(result.newUsersOnly).toBe(false);
    });

    it("should handle first order only coupon", () => {
      const firstOrderCoupon = {
        ...mockCouponBE,
        firstOrderOnly: true,
      };
      const result = toFECoupon(firstOrderCoupon);

      expect(result.firstOrderOnly).toBe(true);
    });

    it("should handle combination settings", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.canCombineWithOtherCoupons).toBe(true);
    });

    it("should handle auto-apply flag", () => {
      const autoApplyCoupon = {
        ...mockCouponBE,
        autoApply: true,
      };
      const result = toFECoupon(autoApplyCoupon);

      expect(result.autoApply).toBe(true);
    });

    it("should handle visibility flags", () => {
      const result = toFECoupon(mockCouponBE);

      expect(result.isPublic).toBe(true);
      expect(result.featured).toBe(true);
    });
  });

  describe("toFECouponCard", () => {
    it("should transform coupon to card", () => {
      const result = toFECouponCard(mockCouponBE);

      expect(result.id).toBe("coupon_123");
      expect(result.code).toBe("SAVE10");
      expect(result.name).toBe("10% Off Coupon");
      expect(result.description).toBe("Get 10% off on all products");
      expect(result.type).toBe("percentage");
      expect(result.discountValue).toBe(10);
    });

    it("should include status fields", () => {
      const result = toFECouponCard(mockCouponBE);

      expect(result.status).toBe(CouponStatus.ACTIVE);
      expect(result.isActive).toBe(true);
    });

    it("should parse dates", () => {
      const result = toFECouponCard(mockCouponBE);

      expect(result.startDate).toBeInstanceOf(Date);
      expect(result.endDate).toBeInstanceOf(Date);
    });

    it("should format discount", () => {
      const result = toFECouponCard(mockCouponBE);

      expect(result.formattedDiscount).toContain("10%");
    });

    it("should format valid until text", () => {
      const result = toFECouponCard(mockCouponBE);

      expect(result.formattedValidUntil).toContain("Valid until");
    });

    it("should include usage stats", () => {
      const result = toFECouponCard(mockCouponBE);

      expect(result.usageCount).toBe(25);
      expect(result.usageLimit).toBe(100);
    });

    it("should include visibility flags", () => {
      const result = toFECouponCard(mockCouponBE);

      expect(result.isPublic).toBe(true);
      expect(result.featured).toBe(true);
    });

    it("should generate status badge", () => {
      const result = toFECouponCard(mockCouponBE);

      expect(result.statusBadge.text).toBe("Active");
      expect(result.statusBadge.variant).toBe("success");
    });
  });

  describe("toBECreateCouponRequest", () => {
    const mockFormData: CouponFormFE = {
      shopId: "shop_123",
      code: "NEWSAVE",
      name: "New Coupon",
      description: "New coupon description",
      type: "percentage",
      discountValue: 15,
      maxDiscountAmount: 1000,
      tiers: undefined,
      bogoConfig: undefined,
      minPurchaseAmount: 1000,
      minQuantity: 1,
      applicability: "all",
      applicableCategories: [],
      applicableProducts: [],
      excludedCategories: [],
      excludedProducts: [],
      usageLimit: 50,
      usageLimitPerUser: 1,
      startDate: new Date("2024-02-01T00:00:00Z"),
      endDate: new Date("2024-03-01T23:59:59Z"),
      firstOrderOnly: false,
      newUsersOnly: false,
      canCombineWithOtherCoupons: true,
      autoApply: false,
      isPublic: true,
      featured: false,
    };

    it("should transform form data to BE request", () => {
      const result = toBECreateCouponRequest(mockFormData);

      expect(result.shopId).toBe("shop_123");
      expect(result.code).toBe("NEWSAVE");
      expect(result.name).toBe("New Coupon");
      expect(result.description).toBe("New coupon description");
      expect(result.type).toBe("percentage");
      expect(result.discountValue).toBe(15);
      expect(result.maxDiscountAmount).toBe(1000);
    });

    it("should convert dates to ISO strings", () => {
      const result = toBECreateCouponRequest(mockFormData);

      expect(typeof result.startDate).toBe("string");
      expect(typeof result.endDate).toBe("string");
    });

    it("should handle all applicability fields", () => {
      const result = toBECreateCouponRequest(mockFormData);

      expect(result.applicability).toBe("all");
      expect(result.applicableCategories).toEqual([]);
      expect(result.applicableProducts).toEqual([]);
      expect(result.excludedCategories).toEqual([]);
      expect(result.excludedProducts).toEqual([]);
    });

    it("should handle usage limits", () => {
      const result = toBECreateCouponRequest(mockFormData);

      expect(result.usageLimit).toBe(50);
      expect(result.usageLimitPerUser).toBe(1);
    });

    it("should handle restriction flags", () => {
      const result = toBECreateCouponRequest(mockFormData);

      expect(result.firstOrderOnly).toBe(false);
      expect(result.newUsersOnly).toBe(false);
      expect(result.canCombineWithOtherCoupons).toBe(true);
      expect(result.autoApply).toBe(false);
      expect(result.isPublic).toBe(true);
      expect(result.featured).toBe(false);
    });

    it("should handle string dates", () => {
      const formWithStringDates = {
        ...mockFormData,
        startDate: "2024-02-01T00:00:00Z",
        endDate: "2024-03-01T23:59:59Z",
      };
      const result = toBECreateCouponRequest(formWithStringDates);

      expect(result.startDate).toBe("2024-02-01T00:00:00Z");
      expect(result.endDate).toBe("2024-03-01T23:59:59Z");
    });
  });

  describe("toBEUpdateCouponRequest", () => {
    it("should transform partial form data", () => {
      const partialForm = {
        name: "Updated Name",
        description: "Updated description",
      };
      const result = toBEUpdateCouponRequest(partialForm);

      expect(result.name).toBe("Updated Name");
      expect(result.description).toBe("Updated description");
      expect(result.code).toBeUndefined();
    });

    it("should handle all updatable fields", () => {
      const fullForm: Partial<CouponFormFE> = {
        code: "UPDATED",
        name: "Updated",
        discountValue: 20,
        usageLimit: 200,
      };
      const result = toBEUpdateCouponRequest(fullForm);

      expect(result.code).toBe("UPDATED");
      expect(result.name).toBe("Updated");
      expect(result.discountValue).toBe(20);
      expect(result.usageLimit).toBe(200);
    });

    it("should handle date updates", () => {
      const formWithDates = {
        startDate: new Date("2024-02-01"),
        endDate: new Date("2024-03-01"),
      };
      const result = toBEUpdateCouponRequest(formWithDates);

      expect(result.startDate).toBeTruthy();
      expect(result.endDate).toBeTruthy();
    });

    it("should not include undefined fields", () => {
      const partialForm = {
        name: "Updated Name",
      };
      const result = toBEUpdateCouponRequest(partialForm);

      expect(Object.keys(result)).toHaveLength(1);
      expect(result.name).toBe("Updated Name");
    });
  });

  describe("Batch transformations", () => {
    it("should transform multiple coupons", () => {
      const coupons = [
        mockCouponBE,
        { ...mockCouponBE, id: "coupon_456", code: "SAVE20" },
      ];
      const result = toFECoupons(coupons);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("coupon_123");
      expect(result[1].id).toBe("coupon_456");
      expect(result[1].code).toBe("SAVE20");
    });

    it("should transform multiple coupon cards", () => {
      const coupons = [mockCouponBE, { ...mockCouponBE, id: "coupon_456" }];
      const result = toFECouponCards(coupons);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("coupon_123");
      expect(result[1].id).toBe("coupon_456");
    });

    it("should handle empty arrays", () => {
      expect(toFECoupons([])).toEqual([]);
      expect(toFECouponCards([])).toEqual([]);
    });
  });

  describe("Edge cases", () => {
    it("should handle coupon with no usage limit", () => {
      const unlimitedCoupon = {
        ...mockCouponBE,
        usageLimit: null,
      };
      const result = toFECoupon(unlimitedCoupon);

      expect(result.remainingUses).toBeUndefined();
      expect(result.isUsedUp).toBe(false);
    });

    it("should handle coupon starting in future", () => {
      const futureCoupon = {
        ...mockCouponBE,
        startDate: Timestamp.fromDate(new Date("2024-02-01T00:00:00Z")),
      };
      const result = toFECoupon(futureCoupon);

      expect(result.canBeUsed).toBe(false);
    });

    it("should handle multiple tiered discounts", () => {
      const tieredCoupon = {
        ...mockCouponBE,
        type: "tiered",
        tiers: [
          { minAmount: 500, discountPercentage: 5 },
          { minAmount: 1000, discountPercentage: 10 },
          { minAmount: 2000, discountPercentage: 15 },
        ],
      };
      const result = toFECoupon(tieredCoupon);

      expect(result.tiers).toHaveLength(3);
      expect(result.tiers![0].discountPercentage).toBe(5);
      expect(result.tiers![1].discountPercentage).toBe(10);
      expect(result.tiers![2].discountPercentage).toBe(15);
    });

    it("should handle special characters in code", () => {
      const specialCodeCoupon = {
        ...mockCouponBE,
        code: "SAVE-10%",
        name: "Special & Unique",
      };
      const result = toFECoupon(specialCodeCoupon);

      expect(result.code).toBe("SAVE-10%");
      expect(result.name).toContain("&");
    });

    it("should handle very high usage counts", () => {
      const highUsageCoupon = {
        ...mockCouponBE,
        usageCount: 999999,
        usageLimit: 1000000,
      };
      const result = toFECoupon(highUsageCoupon);

      expect(result.usagePercentage).toBeCloseTo(99.9999, 1);
      expect(result.remainingUses).toBe(1);
    });

    it("should handle zero discount value", () => {
      const zeroCoupon = {
        ...mockCouponBE,
        discountValue: 0,
      };
      const result = toFECoupon(zeroCoupon);

      expect(result.discountValue).toBe(0);
    });
  });
});
