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
  minAmount: z.number().positive(),
  discountPercentage: z.number().min(0).max(100),
});

/**
 * BOGO Configuration Schema
 */
export const bogoConfigSchema = z.object({
  buyQuantity: z.number().int().positive().default(1),
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
    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code must not exceed 20 characters")
      .regex(
        /^[A-Z0-9-]+$/,
        "Coupon code must contain only uppercase letters, numbers, and hyphens",
      )
      .trim(),

    name: z
      .string()
      .min(3, "Coupon name must be at least 3 characters")
      .max(100, "Coupon name must not exceed 100 characters")
      .trim(),

    description: z
      .string()
      .max(500, "Description must not exceed 500 characters")
      .optional(),

    // Shop Reference
    shopId: z.string().min(1, "Shop ID is required"),

    // Coupon Type & Value
    type: CouponType,

    // For percentage and flat discounts
    discountValue: z
      .number()
      .min(0, "Discount value cannot be negative")
      .optional(),

    // For percentage discounts
    maxDiscountAmount: z.number().positive().optional(), // Cap for percentage discounts

    // For tiered discounts
    tiers: z
      .array(tieredDiscountSchema)
      .min(1, "At least one tier is required for tiered discounts")
      .optional(),

    // For BOGO
    bogoConfig: bogoConfigSchema.optional(),

    // Minimum Purchase Requirements
    minPurchaseAmount: z.number().min(0).default(0).optional(),

    minQuantity: z.number().int().min(0).default(0).optional(),

    // Applicability
    applicability: CouponApplicability.default("all"),

    applicableCategories: z.array(z.string()).optional(), // Category IDs

    applicableProducts: z.array(z.string()).optional(), // Product IDs

    excludedCategories: z.array(z.string()).optional(),

    excludedProducts: z.array(z.string()).optional(),

    // Usage Limits
    usageLimit: z.number().int().positive().optional(), // Total usage limit (null = unlimited)

    usageLimitPerUser: z.number().int().positive().default(1).optional(),

    // Validity
    startDate: z.coerce.date(),

    endDate: z.coerce.date(),

    // Status
    status: CouponStatus.default("active"),

    // Restrictions
    firstOrderOnly: z.boolean().default(false).optional(),

    newUsersOnly: z.boolean().default(false).optional(),

    // Combination Rules
    canCombineWithOtherCoupons: z.boolean().default(false).optional(),

    // Auto-apply
    autoApply: z.boolean().default(false).optional(), // Auto-apply if conditions met

    // Display
    isPublic: z.boolean().default(true).optional(), // Show in coupon list

    isFeatured: z.boolean().default(false).optional(),
  })
  .refine(
    (data) => {
      // Validate that endDate is after startDate
      return data.endDate > data.startDate;
    },
    {
      message: "End date must be after start date",
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
      message: "Discount value is required for percentage and flat coupons",
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
      message: "Tiers are required for tiered coupons",
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
      message: "BOGO configuration is required for BOGO coupons",
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
      message:
        "Applicable categories/products are required based on applicability type",
      path: ["applicability"],
    },
  );

/**
 * Update Coupon Schema
 */
export const updateCouponSchema = createCouponSchema.partial().extend({
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
  code: z.string().min(3).max(20).trim(),
  cartTotal: z.number().positive(),
  cartItems: z.array(
    z.object({
      productId: z.string(),
      categoryId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    }),
  ),
  userId: z.string().optional(),
  isFirstOrder: z.boolean().optional(),
});

/**
 * Coupon Query Filter Schema
 */
export const couponQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20).optional(),

  // Sorting
  sortBy: z
    .enum(["code", "name", "createdAt", "startDate", "endDate", "usageCount"])
    .default("createdAt")
    .optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc").optional(),

  // Filters
  shopId: z.string().optional(),
  type: CouponType.optional(),
  status: CouponStatus.optional(),

  isPublic: z.coerce.boolean().optional(),
  isFeatured: z.coerce.boolean().optional(),

  applicability: CouponApplicability.optional(),

  // Date filters
  activeOn: z.coerce.date().optional(), // Active on specific date

  // Search
  search: z.string().optional(),
});

/**
 * Bulk Update Status Schema
 */
export const bulkUpdateCouponStatusSchema = z.object({
  couponIds: z.array(z.string()).min(1),
  status: CouponStatus,
});

/**
 * Type exports
 */
export type CreateCouponInput = z.infer<typeof createCouponSchema>;
export type UpdateCouponInput = z.infer<typeof updateCouponSchema>;
export type ApplyCouponInput = z.infer<typeof applyCouponSchema>;
export type CouponQuery = z.infer<typeof couponQuerySchema>;
export type BulkUpdateCouponStatusInput = z.infer<
  typeof bulkUpdateCouponStatusSchema
>;
export type TieredDiscount = z.infer<typeof tieredDiscountSchema>;
export type BogoConfig = z.infer<typeof bogoConfigSchema>;
