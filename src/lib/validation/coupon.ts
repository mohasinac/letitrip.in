/**
 * @fileoverview TypeScript Module
 * @module src/lib/validation/coupon
 * @description This file contains functionality related to coupon
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Coupon Validation Schemas
 *
 * Zod schemas for validating coupon data
 * Used in coupon creation, update, and calculation
 */

import { z } from "zod";

/**
 * Coupon Type enum
 */
export const CouponType = z.enum([
  "percentage", // Percentage discount (e.g., 10% off)
  "flat", // Flat amount discount (e.g., ₹100 off)
  "bogo", // Buy One Get One
  "tiered", // Tiered discounts (e.g., spend ₹1000 get 10%, spend ₹2000 get 20%)
  "free-shipping", // Free shipping coupon
]);

/**
 * Coupon Status enum
 */
export const CouponStatus = z.enum([
  "active",
  "inactive",
  "expired",
  "used-up",
]);

/**
 * Coupon Applicability enum
 */
export const CouponApplicability = z.enum([
  "all", // Applies to all products in shop
  "category", // Applies to specific categories
  "product", // Applies to specific products
]);

/**
 * Tiered Discount Schema
 */
export const tieredDiscountSchema = z.object({
  /** Min Amount */
  minAmount: z.number().positive(),
  /** Discount Percentage */
  discountPercentage: z.number().min(0).max(100),
});

/**
 * BOGO Configuration Schema
 */
export const bogoConfigSchema = z.object({
  /** Buy Quantity */
  buyQuantity: z.number().int().positive().default(1),
  /** Get Quantity */
  getQuantity: z.number().int().positive().default(1),
  discountPercentage: z.number().min(0).max(100).default(100), // 100% = free, 50% = half off
  applicableProducts: z.array(z.string()).optional(), // Specific product IDs
});

/**
 * Create Coupon Schema
 */
export const createCouponSchema = z
  .object({
    // Basic Information
    /** Code */
    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code must not exceed 20 characters")
      .regex(
        /^[A-Z0-9-]+$/,
        "Coupon code must contain only uppercase letters, numbers, and hyphens",
      )
      .trim(),

    /** Name */
    name: z
      .string()
      .min(3, "Coupon name must be at least 3 characters")
      .max(100, "Coupon name must not exceed 100 characters")
      .trim(),

    /** Description */
    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .optional(),

    // Shop Reference
    /** Shop Id */
    shopId: z.string().min(1, "Shop ID is required"),

    // Coupon Type & Value
    /** Type */
    type: CouponType,

    // For percentage and flat discounts
    /** Discount Value */
    discountValue: z
      .number()
      .min(0, "Discount value cannot be negative")
      .optional(),

    // For percentage discounts
    maxDiscountAmount: z.number().positive().optional(), // Cap for percentage discounts

    // For tiered discounts
    /** Tiers */
    tiers: z
      .array(tieredDiscountSchema)
      .min(1, "At least one tier is required for tiered discounts")
      .optional(),

    // For BOGO
    /** Bogo Config */
    bogoConfig: bogoConfigSchema.optional(),

    // Minimum Purchase Requirements
    /** Min Purchase Amount */
    minPurchaseAmount: z.number().min(0).default(0).optional(),

    /** Min Quantity */
    minQuantity: z.number().int().min(0).default(0).optional(),

    // Applicability
    /** Applicability */
    applicability: CouponApplicability.default("all"),

    applicableCategories: z.array(z.string()).optional(), // Category IDs

    applicableProducts: z.array(z.string()).optional(), // Product IDs

    /** Excluded Categories */
    excludedCategories: z.array(z.string()).optional(),

    /** Excluded Products */
    excludedProducts: z.array(z.string()).optional(),

    // Usage Limits
    usageLimit: z.number().int().positive().optional(), // Total usage limit (null = unlimited)

    /** Usage Limit Per User */
    usageLimitPerUser: z.number().int().positive().default(1).optional(),

    // Validity
    /** Start Date */
    startDate: z.coerce.date(),

    /** End Date */
    endDate: z.coerce.date(),

    // Status
    /** Status */
    status: CouponStatus.default("active"),

    // Restrictions
    /** First Order Only */
    firstOrderOnly: z.boolean().default(false).optional(),

    /** New Users Only */
    newUsersOnly: z.boolean().default(false).optional(),

    // Combination Rules
    /** Can Combine With Other Coupons */
    canCombineWithOtherCoupons: z.boolean().default(false).optional(),

    // Auto-apply
    autoApply: z.boolean().default(false).optional(), // Auto-apply if conditions met

    // Display
    isPublic: z.boolean().default(true).optional(), // Show in coupon list

    /** Featured */
    featured: z.boolean().default(false).optional(),
  })
  .refine(
    (data) => {
      // Validate that endDate is after startDate
      return data.endDate > data.startDate;
    },
    {
      /** Message */
      message: "End date must be after start date",
      /** Path */
      path: ["endDate"],
    },
  )
  .refine(
    (data) => {
      // Validate discountValue for percentage and flat types
      if (data.type === "percentage") {
        return (
          data.discountValue !== undefined &&
          data.discountValue > 0 &&
          data.discountValue <= 100
        );
      }
      if (data.type === "flat") {
        return data.discountValue !== undefined && data.discountValue > 0;
      }
      return true;
    },
    {
      /** Message */
      message: "Discount value is required for percentage and flat coupons",
      /** Path */
      path: ["discountValue"],
    },
  )
  .refine(
    (data) => {
      // Validate tiers for tiered type
      if (data.type === "tiered") {
        return data.tiers !== undefined && data.tiers.length > 0;
      }
      return true;
    },
    {
      /** Message */
      message: "Tiers are required for tiered coupons",
      /** Path */
      path: ["tiers"],
    },
  )
  .refine(
    (data) => {
      // Validate bogoConfig for bogo type
      if (data.type === "bogo") {
        return data.bogoConfig !== undefined;
      }
      return true;
    },
    {
      /** Message */
      message: "BOGO configuration is required for BOGO coupons",
      /** Path */
      path: ["bogoConfig"],
    },
  )
  .refine(
    (data) => {
      // Validate applicability
      if (data.applicability === "category") {
        return (
          data.applicableCategories !== undefined &&
          data.applicableCategories.length > 0
        );
      }
      if (data.applicability === "product") {
        return (
          data.applicableProducts !== undefined &&
          data.applicableProducts.length > 0
        );
      }
      return true;
    },
    {
      /** Message */
      message:
        "Applicable categories/products are required based on applicability type",
      /** Path */
      path: ["applicability"],
    },
  );

/**
 * Update Coupon Schema
 */
export const updateCouponSchema = createCouponSchema.partial().extend({
  /** Code */
  code: z
    .string()
    .min(3)
    .max(20)
    .regex(/^[A-Z0-9-]+$/)
    .trim()
    .optional(), // Code can be updated but not required
});

/**
 * Apply Coupon Schema (for validation during checkout)
 */
export const applyCouponSchema = z.object({
  /** Code */
  code: z.string().min(3).max(20).trim(),
  /** Cart Total */
  cartTotal: z.number().positive(),
  /** Cart Items */
  cartItems: z.array(
    z.object({
      /** Product Id */
      productId: z.string(),
      /** Category Id */
      categoryId: z.string(),
      /** Quantity */
      quantity: z.number().int().positive(),
      /** Price */
      price: z.number().positive(),
    }),
  ),
  /** User Id */
  userId: z.string().optional(),
  /** Is First Order */
  isFirstOrder: z.boolean().optional(),
});

/**
 * Coupon Query Filter Schema
 */
export const couponQuerySchema = z.object({
  // Pagination
  /** Page */
  page: z.coerce.number().int().min(1).default(1).optional(),
  /** Limit */
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),

  // Sorting
  /** Sort By */
  sortBy: z
    .enum(["code", "name", "createdAt", "startDate", "endDate", "usageCount"])
    .default("createdAt")
    .optional(),
  /** Sort Order */
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),

  // Filters
  /** Shop Id */
  shopId: z.string().optional(),
  /** Type */
  type: CouponType.optional(),
  /** Status */
  status: CouponStatus.optional(),

  /** Is Public */
  isPublic: z.coerce.boolean().optional(),
  /** Featured */
  featured: z.coerce.boolean().optional(),

  /** Applicability */
  applicability: CouponApplicability.optional(),

  // Date filters
  activeOn: z.coerce.date().optional(), // Active on specific date

  // Search
  /** Search */
  search: z.string().optional(),
});

/**
 * Bulk Update Status Schema
 */
export const bulkUpdateCouponStatusSchema = z.object({
  /** Coupon Ids */
  couponIds: z.array(z.string()).min(1),
  /** Status */
  status: CouponStatus,
});

/**
 * Type exports
 */
/**
 * CreateCouponInput type definition
 *
 * @typedef {z.infer<typeof createCouponSchema>} CreateCouponInput
 * @description Type definition for CreateCouponInput
 */
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
/**
 * UpdateCouponInput type
 * 
 * @typedef {Object} UpdateCouponInput
 * @description Type definition for UpdateCouponInput
 */
/**
 * UpdateCouponInput type definition
 *
 * @typedef {z.infer<typeof updateCouponSchema>} UpdateCouponInput
 * @description Type definition for UpdateCouponInput
 */
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
/**
 * ApplyCouponInput type
 * 
 * @typedef {Object} ApplyCouponInput
 * @description Type definition for ApplyCouponInput
 */
/**
 * ApplyCouponInput type definition
 *
 * @typedef {z.infer<typeof applyCouponSchema>} ApplyCouponInput
 * @description Type definition for ApplyCouponInput
 */
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
/**
 * CouponQuery type
 * 
 * @typedef {Object} CouponQuery
 * @description Type definition for CouponQuery
 */
/**
 * CouponQuery type definition
 *
 * @typedef {z.infer<typeof couponQuerySchema>} CouponQuery
 * @description Type definition for CouponQuery
 */
export type CouponQuery = z.infer<typeof couponQuerySchema>;
/**
 * BulkUpdateCouponStatusInput type
 * 
 * @typedef {Object} BulkUpdateCouponStatusInput
 * @description Type definition for BulkUpdateCouponStatusInput
 */
/**
 * BulkUpdateCouponStatusInput type definition
 *
 * @typedef {z.infer<typeof bulkUpdateCouponStatusSchema>} BulkUpdateCouponStatusInput
 * @description Type definition for BulkUpdateCouponStatusInput
 */
export type BulkUpdateCouponStatusInput = z.infer<
  typeof bulkUpdateCouponStatusSchema
>;
/**
 * TieredDiscount type
 * 
 * @typedef {Object} TieredDiscount
 * @description Type definition for TieredDiscount
 */
/**
 * TieredDiscount type definition
 *
 * @typedef {z.infer<typeof tieredDiscountSchema>} TieredDiscount
 * @description Type definition for TieredDiscount
 */
export type TieredDiscount = z.infer<typeof tieredDiscountSchema>;
/**
 * BogoConfig type
 * 
 * @typedef {Object} BogoConfig
 * @description Type definition for BogoConfig
 */
/**
 * BogoConfig type definition
 *
 * @typedef {z.infer<typeof bogoConfigSchema>} BogoConfig
 * @description Type definition for BogoConfig
 */
export type BogoConfig = z.infer<typeof bogoConfigSchema>;
