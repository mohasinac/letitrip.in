/**
 * Tests for Coupon Validation Schemas
 */

import {
  applyCouponSchema,
  bogoConfigSchema,
  bulkUpdateCouponStatusSchema,
  CouponApplicability,
  couponQuerySchema,
  CouponStatus,
  CouponType,
  createCouponSchema,
  tieredDiscountSchema,
  updateCouponSchema,
} from "../coupon";

describe("Coupon Validation Schemas", () => {
  describe("CouponType", () => {
    it("should accept valid types", () => {
      expect(CouponType.parse("percentage")).toBe("percentage");
      expect(CouponType.parse("flat")).toBe("flat");
      expect(CouponType.parse("bogo")).toBe("bogo");
      expect(CouponType.parse("tiered")).toBe("tiered");
      expect(CouponType.parse("free-shipping")).toBe("free-shipping");
    });

    it("should reject invalid type", () => {
      expect(() => CouponType.parse("discount")).toThrow();
    });
  });

  describe("CouponStatus", () => {
    it("should accept valid statuses", () => {
      expect(CouponStatus.parse("active")).toBe("active");
      expect(CouponStatus.parse("inactive")).toBe("inactive");
      expect(CouponStatus.parse("expired")).toBe("expired");
      expect(CouponStatus.parse("used-up")).toBe("used-up");
    });
  });

  describe("CouponApplicability", () => {
    it("should accept valid applicability", () => {
      expect(CouponApplicability.parse("all")).toBe("all");
      expect(CouponApplicability.parse("category")).toBe("category");
      expect(CouponApplicability.parse("product")).toBe("product");
    });
  });

  describe("tieredDiscountSchema", () => {
    it("should validate tiered discount", () => {
      const tier = {
        minAmount: 1000,
        discountPercentage: 10,
      };

      const result = tieredDiscountSchema.parse(tier);

      expect(result.minAmount).toBe(1000);
      expect(result.discountPercentage).toBe(10);
    });

    it("should reject negative minAmount", () => {
      const tier = {
        minAmount: -100,
        discountPercentage: 10,
      };

      expect(() => tieredDiscountSchema.parse(tier)).toThrow();
    });

    it("should reject discountPercentage exceeding 100", () => {
      const tier = {
        minAmount: 1000,
        discountPercentage: 101,
      };

      expect(() => tieredDiscountSchema.parse(tier)).toThrow();
    });
  });

  describe("bogoConfigSchema", () => {
    it("should validate BOGO config", () => {
      const config = {
        buyQuantity: 2,
        getQuantity: 1,
        discountPercentage: 100,
      };

      const result = bogoConfigSchema.parse(config);

      expect(result.buyQuantity).toBe(2);
      expect(result.getQuantity).toBe(1);
    });

    it("should default buyQuantity to 1", () => {
      const config = {
        getQuantity: 1,
      };

      const result = bogoConfigSchema.parse(config);

      expect(result.buyQuantity).toBe(1);
    });

    it("should default discountPercentage to 100", () => {
      const config = {
        buyQuantity: 1,
        getQuantity: 1,
      };

      const result = bogoConfigSchema.parse(config);

      expect(result.discountPercentage).toBe(100);
    });
  });

  describe("createCouponSchema", () => {
    const baseCoupon = {
      code: "SAVE10",
      name: "Save 10%",
      shopId: "shop123",
      type: "percentage" as const,
      discountValue: 10,
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
    };

    it("should validate valid percentage coupon", () => {
      const result = createCouponSchema.parse(baseCoupon);

      expect(result.code).toBe("SAVE10");
      expect(result.type).toBe("percentage");
      expect(result.discountValue).toBe(10);
    });

    it("should reject code less than 3 chars", () => {
      const coupon = { ...baseCoupon, code: "AB" };

      expect(() => createCouponSchema.parse(coupon)).toThrow();
    });

    it("should reject code exceeding 20 chars", () => {
      const coupon = { ...baseCoupon, code: "A".repeat(21) };

      expect(() => createCouponSchema.parse(coupon)).toThrow();
    });

    it("should validate coupon code pattern", () => {
      const validCodes = ["SAVE10", "SUMMER-2024", "FLASH50"];

      validCodes.forEach((code) => {
        const coupon = { ...baseCoupon, code };
        expect(() => createCouponSchema.parse(coupon)).not.toThrow();
      });
    });

    it("should reject lowercase code", () => {
      const coupon = { ...baseCoupon, code: "save10" };

      expect(() => createCouponSchema.parse(coupon)).toThrow();
    });

    it("should reject endDate before startDate", () => {
      const coupon = {
        ...baseCoupon,
        startDate: new Date("2024-12-31"),
        endDate: new Date("2024-01-01"),
      };

      expect(() => createCouponSchema.parse(coupon)).toThrow(
        /End date must be after start date/
      );
    });

    it("should require discountValue for percentage type", () => {
      const coupon = {
        code: "SAVE10",
        name: "Save 10%",
        shopId: "shop123",
        type: "percentage" as const,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
      };

      expect(() => createCouponSchema.parse(coupon)).toThrow(
        /Discount value is required/
      );
    });

    it("should reject percentage exceeding 100", () => {
      const coupon = {
        ...baseCoupon,
        type: "percentage" as const,
        discountValue: 101,
      };

      expect(() => createCouponSchema.parse(coupon)).toThrow(
        /Discount value is required/
      );
    });

    it("should validate flat discount coupon", () => {
      const coupon = {
        ...baseCoupon,
        type: "flat" as const,
        discountValue: 100,
      };

      const result = createCouponSchema.parse(coupon);

      expect(result.type).toBe("flat");
      expect(result.discountValue).toBe(100);
    });

    it("should require tiers for tiered coupon", () => {
      const coupon = {
        code: "TIER10",
        name: "Tiered Discount",
        shopId: "shop123",
        type: "tiered" as const,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
      };

      expect(() => createCouponSchema.parse(coupon)).toThrow(
        /Tiers are required/
      );
    });

    it("should validate tiered coupon with tiers", () => {
      const coupon = {
        code: "TIER10",
        name: "Tiered Discount",
        shopId: "shop123",
        type: "tiered" as const,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        tiers: [
          { minAmount: 1000, discountPercentage: 10 },
          { minAmount: 2000, discountPercentage: 20 },
        ],
      };

      const result = createCouponSchema.parse(coupon);

      expect(result.tiers).toHaveLength(2);
    });

    it("should require bogoConfig for BOGO coupon", () => {
      const coupon = {
        code: "BOGO",
        name: "Buy One Get One",
        shopId: "shop123",
        type: "bogo" as const,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
      };

      expect(() => createCouponSchema.parse(coupon)).toThrow(
        /BOGO configuration is required/
      );
    });

    it("should validate BOGO coupon with config", () => {
      const coupon = {
        code: "BOGO",
        name: "Buy One Get One",
        shopId: "shop123",
        type: "bogo" as const,
        startDate: new Date("2024-01-01"),
        endDate: new Date("2024-12-31"),
        bogoConfig: {
          buyQuantity: 1,
          getQuantity: 1,
          discountPercentage: 100,
        },
      };

      const result = createCouponSchema.parse(coupon);

      expect(result.bogoConfig).toBeDefined();
    });

    it("should require applicableCategories for category applicability", () => {
      const coupon = {
        ...baseCoupon,
        applicability: "category" as const,
      };

      expect(() => createCouponSchema.parse(coupon)).toThrow(
        /Applicable categories\/products are required/
      );
    });

    it("should validate category applicability with categories", () => {
      const coupon = {
        ...baseCoupon,
        applicability: "category" as const,
        applicableCategories: ["cat1", "cat2"],
      };

      const result = createCouponSchema.parse(coupon);

      expect(result.applicableCategories).toHaveLength(2);
    });

    it("should require applicableProducts for product applicability", () => {
      const coupon = {
        ...baseCoupon,
        applicability: "product" as const,
      };

      expect(() => createCouponSchema.parse(coupon)).toThrow(
        /Applicable categories\/products are required/
      );
    });

    it("should validate product applicability with products", () => {
      const coupon = {
        ...baseCoupon,
        applicability: "product" as const,
        applicableProducts: ["prod1", "prod2"],
      };

      const result = createCouponSchema.parse(coupon);

      expect(result.applicableProducts).toHaveLength(2);
    });

    it("should default status to active", () => {
      const result = createCouponSchema.parse(baseCoupon);

      expect(result.status).toBe("active");
    });

    it("should default applicability to all", () => {
      const result = createCouponSchema.parse(baseCoupon);

      expect(result.applicability).toBe("all");
    });

    it("should default usageLimitPerUser to 1", () => {
      const result = createCouponSchema.parse(baseCoupon);

      expect(result.usageLimitPerUser).toBe(1);
    });
  });

  describe("updateCouponSchema", () => {
    it("should allow partial updates", () => {
      const update = { name: "Updated Coupon" };

      const result = updateCouponSchema.parse(update);

      expect(result.name).toBe("Updated Coupon");
    });

    it("should allow code update", () => {
      const update = { code: "NEWSAVE10" };

      const result = updateCouponSchema.parse(update);

      expect(result.code).toBe("NEWSAVE10");
    });
  });

  describe("applyCouponSchema", () => {
    it("should validate coupon application", () => {
      const apply = {
        code: "SAVE10",
        cartTotal: 1000,
        cartItems: [
          {
            productId: "prod1",
            categoryId: "cat1",
            quantity: 2,
            price: 500,
          },
        ],
      };

      const result = applyCouponSchema.parse(apply);

      expect(result.code).toBe("SAVE10");
      expect(result.cartTotal).toBe(1000);
      expect(result.cartItems).toHaveLength(1);
    });

    it("should handle optional fields", () => {
      const apply = {
        code: "SAVE10",
        cartTotal: 1000,
        cartItems: [],
        userId: "user123",
        isFirstOrder: true,
      };

      const result = applyCouponSchema.parse(apply);

      expect(result.userId).toBe("user123");
      expect(result.isFirstOrder).toBe(true);
    });

    it("should reject negative cart total", () => {
      const apply = {
        code: "SAVE10",
        cartTotal: -100,
        cartItems: [],
      };

      expect(() => applyCouponSchema.parse(apply)).toThrow();
    });
  });

  describe("couponQuerySchema", () => {
    it("should validate query with defaults", () => {
      const result = couponQuerySchema.parse({});

      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sortBy).toBe("createdAt");
      expect(result.sortOrder).toBe("desc");
    });

    it("should parse string numbers", () => {
      const query = { page: "2", limit: "50" };

      const result = couponQuerySchema.parse(query);

      expect(result.page).toBe(2);
      expect(result.limit).toBe(50);
    });

    it("should handle filter options", () => {
      const query = {
        shopId: "shop123",
        type: "percentage",
        status: "active",
        isPublic: "true",
        featured: "true",
        applicability: "all",
      };

      const result = couponQuerySchema.parse(query);

      expect(result.shopId).toBe("shop123");
      expect(result.type).toBe("percentage");
      expect(result.isPublic).toBe(true);
    });

    it("should parse activeOn date", () => {
      const query = {
        activeOn: "2024-06-15",
      };

      const result = couponQuerySchema.parse(query);

      expect(result.activeOn).toBeInstanceOf(Date);
    });
  });

  describe("bulkUpdateCouponStatusSchema", () => {
    it("should validate bulk status update", () => {
      const update = {
        couponIds: ["coupon1", "coupon2"],
        status: "inactive",
      };

      const result = bulkUpdateCouponStatusSchema.parse(update);

      expect(result.couponIds).toHaveLength(2);
      expect(result.status).toBe("inactive");
    });

    it("should require at least one coupon ID", () => {
      const update = {
        couponIds: [],
        status: "inactive",
      };

      expect(() => bulkUpdateCouponStatusSchema.parse(update)).toThrow();
    });
  });
});
