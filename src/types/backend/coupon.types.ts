/**
 * @fileoverview Type Definitions
 * @module src/types/backend/coupon.types
 * @description This file contains TypeScript type definitions for coupon
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Backend Coupon Types
 *
 * Coupon types as received from the API (Firestore documents)
 * Uses Firestore Timestamps and raw data structures
 */

import type { Timestamp } from "firebase/firestore";
import type {
  CouponType,
  CouponStatus,
  CouponApplicability,
} from "../shared/common.types";

/**
 * Tiered Discount Configuration
 */
export interface TieredDiscountBE {
  /** Min Amount */
  minAmount: number;
  /** Discount Percentage */
  discountPercentage: number;
}

/**
 * BOGO (Buy One Get One) Configuration
 */
export interface BogoConfigBE {
  /** Buy Quantity */
  buyQuantity: number;
  /** Get Quantity */
  getQuantity: number;
  /** Discount Percentage */
  discountPercentage: number;
  /** Applicable Products */
  applicableProducts?: string[];
}

/**
 * Backend Coupon Document (from Firestore)
 */
export interface CouponBE {
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
  tiers?: TieredDiscountBE[];
  /** Bogo Config */
  bogoConfig?: BogoConfigBE;

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
  startDate: Timestamp;
  /** End Date */
  endDate: Timestamp;
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
  createdAt: Timestamp;
  /** Updated At */
  updatedAt: Timestamp;
}

/**
 * Filters for querying coupons from backend
 */
export interface CouponFiltersBE {
  /** Shop Id */
  shopId?: string;
  /** Type */
  type?: CouponType;
  /** Status */
  status?: CouponStatus;
  /** Search */
  search?: string;
  /** Page */
  page?: number;
  /** Limit */
  limit?: number;
}

/**
 * Create Coupon Request (to backend)
 */
export interface CreateCouponRequestBE {
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
  tiers?: TieredDiscountBE[];
  /** Bogo Config */
  bogoConfig?: BogoConfigBE;
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
  /** StartDate */
  startDate: string; // ISO date string
  /** EndDate */
  endDate: string; // ISO date string
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
 * Update Coupon Request (to backend)
 */
export interface UpdateCouponRequestBE extends Partial<CreateCouponRequestBE> {
  /** Status */
  status?: CouponStatus;
}
