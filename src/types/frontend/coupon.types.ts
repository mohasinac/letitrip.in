/**
 * @fileoverview Type Definitions
 * @module src/types/frontend/coupon.types
 * @description This file contains TypeScript type definitions for coupon
 * 
 * @created 2025-12-05
 * @author Development Team
 */

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
  /** Min Amount */
  minAmount: number;
  /** Discount Percentage */
  discountPercentage: number;
  formattedMinAmount: string; // "$100.00"
  formattedDiscount: string; // "20% off"
}

/**
 * BOGO (Buy One Get One) Configuration (FE)
 */
export interface BogoConfigFE {
  /** Buy Quantity */
  buyQuantity: number;
  /** Get Quantity */
  getQuantity: number;
  /** Discount Percentage */
  discountPercentage: number;
  /** Applicable Products */
  applicableProducts?: string[];
  description: string; // "Buy 2 Get 1 at 50% off"
}

/**
 * Frontend Coupon (for display in UI)
 */
export interface CouponFE {
  /** Id */
  id: string;
  /** Shop Id */
  shopId: string;

  // Basic info
  /** Code */
  code: string;
  /** Name */
  name: string;
  /** Description */
  description?: string;

  // Type & value
  /** Type */
  type: CouponType;
  /** Discount Value */
  discountValue?: number;
  /** Max Discount Amount */
  maxDiscountAmount?: number;

  // Configurations
  /** Tiers */
  tiers?: TieredDiscountFE[];
  /** Bogo Config */
  bogoConfig?: BogoConfigFE;

  // Requirements
  /** Min Purchase Amount */
  minPurchaseAmount: number;
  /** Min Quantity */
  minQuantity: number;

  // Applicability
  /** Applicability */
  applicability: CouponApplicability;
  /** Applicable Categories */
  applicableCategories?: string[];
  /** Applicable Products */
  applicableProducts?: string[];
  /** Excluded Categories */
  excludedCategories?: string[];
  /** Excluded Products */
  excludedProducts?: string[];

  // Usage
  /** Usage Limit */
  usageLimit?: number;
  /** Usage Limit Per User */
  usageLimitPerUser: number;
  /** Usage Count */
  usageCount: number;

  // Validity
  /** Start Date */
  startDate: Date;
  /** End Date */
  endDate: Date;
  /** Status */
  status: CouponStatus;

  // Restrictions
  /** First Order Only */
  firstOrderOnly: boolean;
  /** New Users Only */
  newUsersOnly: boolean;
  /** Can Combine With Other Coupons */
  canCombineWithOtherCoupons: boolean;

  // Display
  /** Auto Apply */
  autoApply: boolean;
  /** Is Public */
  isPublic: boolean;
  /** Featured */
  featured: boolean;

  // Audit
  /** Created At */
  createdAt: Date;
  /** Updated At */
  updatedAt: Date;

  // UI helpers
  /** Is Active */
  isActive: boolean;
  /** Is Expired */
  isExpired: boolean;
  /** Is Used Up */
  isUsedUp: boolean;
  /** Can Be Used */
  canBeUsed: boolean;
  /** Remaining Uses */
  remainingUses?: number;
  usagePercentage: number; // 0-100
  formattedStartDate: string; // "Jan 15, 2025"
  formattedEndDate: string; // "Feb 15, 2025"
  formattedDiscount: string; // "20% off" or "$50 off"
  formattedMinPurchase: string; // "$100.00"
  /** Days Until Expiry */
  daysUntilExpiry: number;
  /** Status Badge */
  statusBadge: {
    /** Text */
    text: string;
    /** Variant */
    variant: "success" | "warning" | "error" | "info";
  };
}

/**
 * Coupon Card (for list views)
 */
export interface CouponCardFE {
  /** Id */
  id: string;
  /** Code */
  code: string;
  /** Name */
  name: string;
  /** Description */
  description?: string;
  /** Type */
  type: CouponType;
  /** Discount Value */
  discountValue?: number;
  /** Status */
  status: CouponStatus;
  /** Start Date */
  startDate: Date;
  /** End Date */
  endDate: Date;
  /** Usage Count */
  usageCount: number;
  /** Usage Limit */
  usageLimit?: number;
  /** Is Public */
  isPublic: boolean;
  /** Featured */
  featured: boolean;

  // UI helpers
  /** Formatted Discount */
  formattedDiscount: string;
  /** Formatted Valid Until */
  formattedValidUntil: string;
  /** Is Active */
  isActive: boolean;
  /** Status Badge */
  statusBadge: {
    /** Text */
    text: string;
    /** Variant */
    variant: "success" | "warning" | "error" | "info";
  };
}

/**
 * Coupon Form (for create/edit)
 */
export interface CouponFormFE {
  /** Shop Id */
  shopId: string;
  /** Code */
  code: string;
  /** Name */
  name: string;
  /** Description */
  description?: string;
  /** Type */
  type: CouponType;
  /** Discount Value */
  discountValue?: number;
  /** Max Discount Amount */
  maxDiscountAmount?: number;
  /** Tiers */
  tiers?: {
    /** Min Amount */
    minAmount: number;
    /** Discount Percentage */
    discountPercentage: number;
  }[];
  /** Bogo Config */
  bogoConfig?: {
    /** Buy Quantity */
    buyQuantity: number;
    /** Get Quantity */
    getQuantity: number;
    /** Discount Percentage */
    discountPercentage: number;
    /** Applicable Products */
    applicableProducts?: string[];
  };
  /** Min Purchase Amount */
  minPurchaseAmount: number;
  /** Min Quantity */
  minQuantity: number;
  /** Applicability */
  applicability: CouponApplicability;
  /** Applicable Categories */
  applicableCategories?: string[];
  /** Applicable Products */
  applicableProducts?: string[];
  /** Excluded Categories */
  excludedCategories?: string[];
  /** Excluded Products */
  excludedProducts?: string[];
  /** Usage Limit */
  usageLimit?: number;
  /** Usage Limit Per User */
  usageLimitPerUser: number;
  /** Start Date */
  startDate: Date | string;
  /** End Date */
  endDate: Date | string;
  /** First Order Only */
  firstOrderOnly: boolean;
  /** New Users Only */
  newUsersOnly: boolean;
  /** Can Combine With Other Coupons */
  canCombineWithOtherCoupons: boolean;
  /** Auto Apply */
  autoApply: boolean;
  /** Is Public */
  isPublic: boolean;
  /** Featured */
  featured: boolean;
}

/**
 * Validate Coupon Request
 */
export interface ValidateCouponRequestFE {
  /** Code */
  code: string;
  /** Cart Total */
  cartTotal: number;
  /** Items */
  items: {
    /** Product Id */
    productId: string;
    /** Category Id */
    categoryId: string;
    /** Quantity */
    quantity: number;
    /** Price */
    price: number;
  }[];
}

/**
 * Validate Coupon Response
 */
export interface ValidateCouponResponseFE {
  /** Valid */
  valid: boolean;
  /** Discount */
  discount: number;
  /** Formatted Discount */
  formattedDiscount: string;
  /** Message */
  message?: string;
  /** Coupon */
  coupon?: CouponFE;
}

/**
 * Coupon Filters (for frontend filtering)
 */
export interface CouponFiltersFE {
  /** Shop Id */
  shopId?: string;
  /** Type */
  type?: CouponType;
  /** Status */
  status?: CouponStatus;
  /** Search */
  search?: string;
  /** Is Public */
  isPublic?: boolean;
  /** Featured */
  featured?: boolean;
}
