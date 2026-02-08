/**
 * Coupons Collection Schema
 *
 * Firestore schema definition for coupon/discount management
 */

import { generateCouponId } from "@/utils/id-generators";

// ============================================
// COUPON TYPE INTERFACES
// ============================================
export interface DiscountConfig {
  value: number; // Percentage (0-100) or fixed amount
  maxDiscount?: number; // Max discount for percentage type
  minPurchase?: number; // Minimum purchase amount
}

export interface BXGYConfig {
  buyQuantity: number;
  getQuantity: number;
  applicableProducts?: string[]; // Product IDs
  applicableCategories?: string[];
}

export interface TieredDiscount {
  minAmount: number;
  discountValue: number;
}

export interface UsageConfig {
  totalLimit?: number; // Total uses across all users
  perUserLimit?: number; // Uses per user
  currentUsage: number;
}

export interface ValidityConfig {
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
}

export interface RestrictionsConfig {
  applicableProducts?: string[];
  applicableCategories?: string[];
  applicableSellers?: string[];
  excludeProducts?: string[];
  excludeCategories?: string[];
  firstTimeUserOnly: boolean;
  combineWithSellerCoupons: boolean;
}

export interface CouponStats {
  totalUses: number;
  totalRevenue: number;
  totalDiscount: number;
}

// ============================================
// 1. COLLECTION INTERFACE & NAME
// ============================================
export type CouponType =
  | "percentage"
  | "fixed"
  | "free_shipping"
  | "buy_x_get_y";

export interface CouponDocument {
  id: string;
  code: string; // Unique coupon code (uppercase)
  name: string;
  description: string;
  type: CouponType;

  // Discount configuration
  discount: DiscountConfig;

  // Buy X Get Y configuration (for BOGO deals)
  bxgy?: BXGYConfig;

  // Tiered discounts
  tiers?: TieredDiscount[];

  // Usage limits
  usage: UsageConfig;

  // Validity
  validity: ValidityConfig;

  // Restrictions
  restrictions: RestrictionsConfig;

  // Metadata
  createdBy: string; // Admin user ID
  createdAt: Date;
  updatedAt: Date;
  stats: CouponStats;
}

export const COUPONS_COLLECTION = "coupons" as const;

// ============================================
// SUBCOLLECTION: COUPON USAGE TRACKING
// ============================================
/**
 * Subcollection path: users/{userId}/couponUsage/{couponId}
 */
export interface CouponUsageDocument {
  id: string; // Coupon ID
  userId: string;
  couponCode: string;
  usageCount: number;
  lastUsedAt: Date;
  orders: string[]; // Order IDs where coupon was used
}

export const COUPON_USAGE_SUBCOLLECTION = "couponUsage" as const;

// ============================================
// 2. INDEXED FIELDS
// ============================================
/**
 * Fields indexed in Firestore for query performance
 *
 * Purpose:
 * - code: Lookup coupon by code (unique)
 * - validity.isActive + validity.startDate: Active coupons
 * - validity.endDate: Expiring soon coupons
 * - type: Filter coupons by type
 * - createdBy: Admin's created coupons
 */
export const COUPONS_INDEXED_FIELDS = [
  "code", // For unique lookup
  "validity.isActive", // For filtering active coupons
  "validity.startDate", // For date-based queries
  "validity.endDate", // For expiration queries
  "type", // For filtering by type
  "createdBy", // For admin filtering
] as const;

// ============================================
// 3. RELATIONSHIPS
// ============================================
/**
 * RELATIONSHIPS:
 *
 * users (1) ----< (N) coupons
 *       (1) ----< (N) couponUsage (subcollection)
 *
 * products (N) >----< (M) coupons (via restrictions.applicableProducts)
 * categories (N) >----< (M) coupons (via restrictions.applicableCategories)
 *
 * Foreign Keys:
 * - coupons/{id}.createdBy references users/{uid}
 * - couponUsage/{id}.userId references users/{uid}
 * - restrictions.applicableProducts references products/{id}
 * - restrictions.applicableCategories references categories/{id}
 *
 * CASCADE BEHAVIOR:
 * - When user deleted: Set createdBy to null or "deleted_user"
 * - When product deleted: Remove from applicableProducts array
 * - When category deleted: Remove from applicableCategories array
 */

// ============================================
// 4. HELPER CONSTANTS
// ============================================
/**
 * Default data for new coupons
 */
export const DEFAULT_COUPON_DATA: Partial<CouponDocument> = {
  usage: {
    currentUsage: 0,
  },
  validity: {
    isActive: false,
    startDate: new Date(),
    endDate: undefined,
  },
  restrictions: {
    firstTimeUserOnly: false,
    combineWithSellerCoupons: false,
  },
  stats: {
    totalUses: 0,
    totalRevenue: 0,
    totalDiscount: 0,
  },
};

/**
 * Coupon type labels
 */
export const COUPON_TYPE_LABELS: Record<CouponType, string> = {
  percentage: "Percentage Discount",
  fixed: "Fixed Amount Discount",
  free_shipping: "Free Shipping",
  buy_x_get_y: "Buy X Get Y",
};

/**
 * Fields that are publicly readable
 */
export const COUPONS_PUBLIC_FIELDS = [
  "id",
  "code",
  "name",
  "description",
  "type",
  "discount",
  "validity.startDate",
  "validity.endDate",
  "usage.totalLimit",
  "usage.perUserLimit",
] as const;

/**
 * Fields that admins can update
 */
export const COUPONS_UPDATABLE_FIELDS = [
  "name",
  "description",
  "discount",
  "bxgy",
  "tiers",
  "usage",
  "validity",
  "restrictions",
] as const;

// ============================================
// 5. TYPE UTILITIES
// ============================================
/**
 * Type for creating new coupons (omit system-generated fields)
 */
export type CouponCreateInput = Omit<
  CouponDocument,
  "id" | "createdAt" | "updatedAt" | "stats"
> & {
  stats?: Partial<CouponStats>;
};

/**
 * Type for updating coupons
 */
export type CouponUpdateInput = Partial<
  Pick<
    CouponDocument,
    | "name"
    | "description"
    | "discount"
    | "bxgy"
    | "tiers"
    | "usage"
    | "validity"
    | "restrictions"
  >
>;

/**
 * Type for coupon validation result
 */
export interface CouponValidationResult {
  valid: boolean;
  discountAmount: number;
  error?: string;
  message?: string;
}

// ============================================
// 6. QUERY HELPERS
// ============================================
/**
 * Firestore query helper functions for type-safe queries
 */
export const couponQueryHelpers = {
  byCode: (code: string) => ["code", "==", code.toUpperCase()] as const,
  active: () => ["validity.isActive", "==", true] as const,
  inactive: () => ["validity.isActive", "==", false] as const,
  byType: (type: CouponType) => ["type", "==", type] as const,
  byCreator: (userId: string) => ["createdBy", "==", userId] as const,
  expiringSoon: (days: number = 7) => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return ["validity.endDate", "<=", futureDate] as const;
  },
} as const;

// ============================================
// 7. VALIDATION HELPERS
// ============================================

/**
 * Generate SEO-friendly coupon ID from code
 * Pattern: coupon-{CODE}
 *
 * @param code - Coupon code (user-provided)
 * @returns SEO-friendly coupon ID
 *
 * Example: createCouponId("SAVE20") → "coupon-SAVE20"
 */
export function createCouponId(code: string): string {
  return generateCouponId(code);
}

/**
 * Validate coupon code format (uppercase alphanumeric, 4-20 chars)
 */
export function isValidCouponCode(code: string): boolean {
  const regex = /^[A-Z0-9]{4,20}$/;
  return regex.test(code);
}

/**
 * Check if coupon is currently valid
 */
export function isCouponValid(coupon: CouponDocument): boolean {
  const now = new Date();
  const startDate = new Date(coupon.validity.startDate);
  const endDate = coupon.validity.endDate
    ? new Date(coupon.validity.endDate)
    : null;

  return (
    coupon.validity.isActive &&
    startDate <= now &&
    (!endDate || endDate >= now) &&
    (coupon.usage.totalLimit === undefined ||
      coupon.usage.currentUsage < coupon.usage.totalLimit)
  );
}

/**
 * Check if user can use coupon
 */
export function canUserUseCoupon(
  coupon: CouponDocument,
  userUsageCount: number,
): boolean {
  if (!isCouponValid(coupon)) return false;

  if (coupon.usage.perUserLimit === undefined) return true;

  return userUsageCount < coupon.usage.perUserLimit;
}

/**
 * Calculate discount amount based on order total
 */
export function calculateDiscount(
  coupon: CouponDocument,
  orderTotal: number,
): number {
  // Check minimum purchase requirement
  if (coupon.discount.minPurchase && orderTotal < coupon.discount.minPurchase) {
    return 0;
  }

  let discountAmount = 0;

  switch (coupon.type) {
    case "percentage":
      discountAmount = (orderTotal * coupon.discount.value) / 100;
      if (
        coupon.discount.maxDiscount &&
        discountAmount > coupon.discount.maxDiscount
      ) {
        discountAmount = coupon.discount.maxDiscount;
      }
      break;

    case "fixed":
      discountAmount = Math.min(coupon.discount.value, orderTotal);
      break;

    case "free_shipping":
      // Discount amount should be shipping fee (handled by caller)
      discountAmount = 0;
      break;

    case "buy_x_get_y":
      // Complex logic handled by order service
      discountAmount = 0;
      break;
  }

  return discountAmount;
}

/**
 * Get tiered discount for order amount
 */
export function getTieredDiscount(
  tiers: TieredDiscount[] | undefined,
  orderTotal: number,
): number {
  if (!tiers || tiers.length === 0) return 0;

  // Sort tiers by minAmount descending
  const sortedTiers = [...tiers].sort((a, b) => b.minAmount - a.minAmount);

  // Find the highest tier that applies
  for (const tier of sortedTiers) {
    if (orderTotal >= tier.minAmount) {
      return tier.discountValue;
    }
  }

  return 0;
}
