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
  minAmount: number;
  discountPercentage: number;
}

/**
 * BOGO (Buy One Get One) Configuration
 */
export interface BogoConfigBE {
  buyQuantity: number;
  getQuantity: number;
  discountPercentage: number;
  applicableProducts?: string[];
}

/**
 * Backend Coupon Document (from Firestore)
 */
export interface CouponBE {
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
  tiers?: TieredDiscountBE[];
  bogoConfig?: BogoConfigBE;

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
  startDate: Timestamp;
  endDate: Timestamp;
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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

/**
 * Filters for querying coupons from backend
 */
export interface CouponFiltersBE {
  shopId?: string;
  type?: CouponType;
  status?: CouponStatus;
  search?: string;
  page?: number;
  limit?: number;
}

/**
 * Create Coupon Request (to backend)
 */
export interface CreateCouponRequestBE {
  shopId: string;
  code: string;
  name: string;
  description?: string;
  type: CouponType;
  discountValue?: number;
  maxDiscountAmount?: number;
  tiers?: TieredDiscountBE[];
  bogoConfig?: BogoConfigBE;
  minPurchaseAmount: number;
  minQuantity: number;
  applicability: CouponApplicability;
  applicableCategories?: string[];
  applicableProducts?: string[];
  excludedCategories?: string[];
  excludedProducts?: string[];
  usageLimit?: number;
  usageLimitPerUser: number;
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  firstOrderOnly: boolean;
  newUsersOnly: boolean;
  canCombineWithOtherCoupons: boolean;
  autoApply: boolean;
  isPublic: boolean;
  isFeatured: boolean;
}

/**
 * Update Coupon Request (to backend)
 */
export interface UpdateCouponRequestBE extends Partial<CreateCouponRequestBE> {
  status?: CouponStatus;
}
