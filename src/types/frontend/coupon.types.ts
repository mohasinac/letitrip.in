/**
 * Frontend Coupon Types
 *
 * Coupon types optimized for UI display and forms
 * Uses JavaScript Date objects and formatted strings
 */

import type {
  CouponType,
  CouponStatus,
  CouponApplicability,
} from "../shared/common.types";

/**
 * Tiered Discount Configuration (FE)
 */
export interface TieredDiscountFE {
  minAmount: number;
  discountPercentage: number;
  formattedMinAmount: string; // "$100.00"
  formattedDiscount: string; // "20% off"
}

/**
 * BOGO (Buy One Get One) Configuration (FE)
 */
export interface BogoConfigFE {
  buyQuantity: number;
  getQuantity: number;
  discountPercentage: number;
  applicableProducts?: string[];
  description: string; // "Buy 2 Get 1 at 50% off"
}

/**
 * Frontend Coupon (for display in UI)
 */
export interface CouponFE {
  id: string;
  shopId: string;

  // Basic info
  code: string;
  name: string;
  description?: string;

  // Type & value
  type: CouponType;
  discountValue?: number;
  maxDiscountAmount?: number;

  // Configurations
  tiers?: TieredDiscountFE[];
  bogoConfig?: BogoConfigFE;

  // Requirements
  minPurchaseAmount: number;
  minQuantity: number;

  // Applicability
  applicability: CouponApplicability;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];

  // Usage
  usageLimit?: number;
  usageLimitPerUser: number;
  usageCount: number;

  // Validity
  startDate: Date;
  endDate: Date;
  status: CouponStatus;

  // Restrictions
  firstOrderOnly: boolean;
  newUsersOnly: boolean;
  canCombineWithOtherCoupons: boolean;

  // Display
  autoApply: boolean;
  isPublic: boolean;
  isFeatured: boolean;

  // Audit
  createdAt: Date;
  updatedAt: Date;

  // UI helpers
  isActive: boolean;
  isExpired: boolean;
  isUsedUp: boolean;
  canBeUsed: boolean;
  remainingUses?: number;
  usagePercentage: number; // 0-100
  formattedStartDate: string; // "Jan 15, 2025"
  formattedEndDate: string; // "Feb 15, 2025"
  formattedDiscount: string; // "20% off" or "$50 off"
  formattedMinPurchase: string; // "$100.00"
  daysUntilExpiry: number;
  statusBadge: {
    text: string;
    variant: "success" | "warning" | "error" | "info";
  };
}

/**
 * Coupon Card (for list views)
 */
export interface CouponCardFE {
  id: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  discountValue?: number;
  status: CouponStatus;
  startDate: Date;
  endDate: Date;
  usageCount: number;
  usageLimit?: number;
  isPublic: boolean;
  isFeatured: boolean;

  // UI helpers
  formattedDiscount: string;
  formattedValidUntil: string;
  isActive: boolean;
  statusBadge: {
    text: string;
    variant: "success" | "warning" | "error" | "info";
  };
}

/**
 * Coupon Form (for create/edit)
 */
export interface CouponFormFE {
  shopId: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  discountValue?: number;
  maxDiscountAmount?: number;
  tiers?: {
    minAmount: number;
    discountPercentage: number;
  }[];
  bogoConfig?: {
    buyQuantity: number;
    getQuantity: number;
    discountPercentage: number;
    applicableProducts?: string[];
  };
  minPurchaseAmount: number;
  minQuantity: number;
  applicability: CouponApplicability;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  usageLimit?: number;
  usageLimitPerUser: number;
  startDate: Date | string;
  endDate: Date | string;
  firstOrderOnly: boolean;
  newUsersOnly: boolean;
  canCombineWithOtherCoupons: boolean;
  autoApply: boolean;
  isPublic: boolean;
  isFeatured: boolean;
}

/**
 * Validate Coupon Request
 */
export interface ValidateCouponRequestFE {
  code: string;
  cartTotal: number;
  items: {
    productId: string;
    categoryId: string;
    quantity: number;
    price: number;
  }[];
}

/**
 * Validate Coupon Response
 */
export interface ValidateCouponResponseFE {
  valid: boolean;
  discount: number;
  formattedDiscount: string;
  message?: string;
  coupon?: CouponFE;
}

/**
 * Coupon Filters (for frontend filtering)
 */
export interface CouponFiltersFE {
  shopId?: string;
  type?: CouponType;
  status?: CouponStatus;
  search?: string;
  isPublic?: boolean;
  isFeatured?: boolean;
}
