/**
 * @fileoverview TypeScript Module
 * @module src/types/transforms/coupon.transforms
 * @description This file contains functionality related to coupon.transforms
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Coupon Transformation Functions
 *
 * Convert between backend and frontend coupon types
 */

import type {
  CouponBE,
  TieredDiscountBE,
  BogoConfigBE,
  CreateCouponRequestBE,
  UpdateCouponRequestBE,
} from "../backend/coupon.types";
import type {
  CouponFE,
  CouponCardFE,
  CouponFormFE,
  TieredDiscountFE,
  BogoConfigFE,
} from "../frontend/coupon.types";
import { CouponStatus } from "../shared/common.types";
import { safeToISOString } from "@/lib/date-utils";

/**
 * Format currency amount
 */
/**
 * Formats currency
 *
 * @param {number} amount - The amount
 *
 * @returns {string} The formatcurrency result
 */

/**
 * Formats currency
 *
 * @param {number} amount - The amount
 *
 * @returns {string} The formatcurrency result
 */

const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN", {
    /** Minimum Fraction Digits */
    minimumFractionDigits: 2,
    /** Maximum Fraction Digits */
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format date
 */
/**
 * Formats date
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatdate result
 */

/**
 * Formats date
 *
 * @param {Date} date - The date
 *
 * @returns {string} The formatdate result
 */

const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-IN", {
    /** Day */
    day: "numeric",
    /** Month */
    month: "short",
    /** Year */
    year: "numeric",
  });
};

/**
 * Calculate days until expiry
 */
/**
 * Retrieves days until expiry
 *
 * @param {Date} endDate - The end date
 *
 * @returns {number} The daysuntilexpiry result
 */

/**
 * Retrieves days until expiry
 *
 * @param {Date} endDate - The end date
 *
 * @returns {number} The daysuntilexpiry result
 */

const getDaysUntilExpiry = (endDate: Date): number => {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Transform TieredDiscount BE to FE
 */
/**
 * Performs to f e tiered discount operation
 *
 * @param {TieredDiscountBE} tier - The tier
 *
 * @returns {any} The tofetiereddiscount result
 */

/**
 * Performs to f e tiered discount operation
 *
 * @param {TieredDiscountBE} tier - The tier
 *
 * @returns {any} The tofetiereddiscount result
 */

const toFETieredDiscount = (tier: TieredDiscountBE): TieredDiscountFE => {
  return {
    ...tier,
    /** Formatted Min Amount */
    formattedMinAmount: formatCurrency(tier.minAmount),
    /** Formatted Discount */
    formattedDiscount: `${tier.discountPercentage}% off`,
  };
};

/**
 * Transform BogoConfig BE to FE
 */
/**
 * Performs to f e bogo config operation
 *
 * @param {BogoConfigBE} bogo - The bogo
 *
 * @returns {any} The tofebogoconfig result
 */

/**
 * Performs to f e bogo config operation
 *
 * @param {BogoConfigBE} bogo - The bogo
 *
 * @returns {any} The tofebogoconfig result
 */

const toFEBogoConfig = (bogo: BogoConfigBE): BogoConfigFE => {
  const description = `Buy ${bogo.buyQuantity} Get ${bogo.getQuantity} at ${bogo.discountPercentage}% off`;
  return {
    ...bogo,
    description,
  };
};

/**
 * Get coupon status badge
 */
/**
 * Retrieves status badge
 *
 * @param {CouponStatus} status - The status
 * @param {boolean} isExpired - Whether is expired
 * @param {boolean} isUsedUp - Whether is used up
 *
 * @returns {boolean} True if condition is met, false otherwise
 */

/**
 * Retrieves status badge
 *
 * @returns {boolean} True if condition is met, false otherwise
 */

const getStatusBadge = (
  /** Status */
  status: CouponStatus,
  /** Is Expired */
  isExpired: boolean,
  /** Is Used Up */
  isUsedUp: boolean,
): { text: string; variant: "success" | "warning" | "error" | "info" } => {
  if (isExpired) {
    return { text: "Expired", variant: "error" };
  }
  if (isUsedUp) {
    return { text: "Used Up", variant: "error" };
  }
  if (status === CouponStatus.ACTIVE) {
    return { text: "Active", variant: "success" };
  }
  if (status === CouponStatus.INACTIVE) {
    return { text: "Inactive", variant: "warning" };
  }
  return { text: "Expired", variant: "error" };
};

/**
 * Format discount string
 */
/**
 * Formats discount
 *
 * @param {{
  type} [coupon] - The coupon
 *
 * @returns {string} The formatdiscount result
 */

/**
 * Formats discount
 *
 * @returns {string} The formatdiscount result
 */

const formatDiscount = (coupon: {
  /** Type */
  type: string;
  /** Discount Value */
  discountValue?: number;
  /** Max Discount Amount */
  maxDiscountAmount?: number;
}): string => {
  if (coupon.type === "percentage" && coupon.discountValue) {
    const base = `${coupon.discountValue}% off`;
    if (coupon.maxDiscountAmount) {
      return `${base} (max ${formatCurrency(coupon.maxDiscountAmount)})`;
    }
    return base;
  }
  if (coupon.type === "flat" && coupon.discountValue) {
    return `${formatCurrency(coupon.discountValue)} off`;
  }
  if (coupon.type === "free-shipping") {
    return "Free Shipping";
  }
  if (coupon.type === "bogo") {
    return "Buy One Get One";
  }
  if (coupon.type === "tiered") {
    return "Tiered Discount";
  }
  return "Discount";
};

/**
 * Transform Coupon BE to FE
 */
/**
 * Performs to f e coupon operation
 *
 * @param {CouponBE} couponBE - The coupon b e
 *
 * @returns {any} The tofecoupon result
 *
 * @example
 * toFECoupon(couponBE);
 */

/**
 * Performs to f e coupon operation
 *
 * @param {CouponBE} couponBE - The coupon b e
 *
 * @returns {any} The tofecoupon result
 *
 * @example
 * toFECoupon(couponBE);
 */

export const toFECoupon = (couponBE: CouponBE): CouponFE => {
  const startDate = couponBE.startDate.toDate();
  const endDate = couponBE.endDate.toDate();
  const createdAt = couponBE.createdAt.toDate();
  const updatedAt = couponBE.updatedAt.toDate();

  const now = new Date();
  const isExpired = endDate < now;
  const isUsedUp = couponBE.usageLimit
    ? couponBE.usageCount >= couponBE.usageLimit
    : false;
  const isActive =
    couponBE.status === CouponStatus.ACTIVE && !isExpired && !isUsedUp;
  const canBeUsed = isActive && startDate <= now;

  const remainingUses = couponBE.usageLimit
    ? couponBE.usageLimit - couponBE.usageCount
    : undefined;
  const usagePercentage = couponBE.usageLimit
    ? Math.round((couponBE.usageCount / couponBE.usageLimit) * 100)
    : 0;

  return {
    /** Id */
    id: couponBE.id,
    /** Shop Id */
    shopId: couponBE.shopId,
    /** Code */
    code: couponBE.code,
    /** Name */
    name: couponBE.name,
    /** Description */
    description: couponBE.description,
    /** Type */
    type: couponBE.type,
    /** Discount Value */
    discountValue: couponBE.discountValue,
    /** Max Discount Amount */
    maxDiscountAmount: couponBE.maxDiscountAmount,
    /** Tiers */
    tiers: couponBE.tiers?.map(toFETieredDiscount),
    /** Bogo Config */
    bogoConfig: couponBE.bogoConfig
      ? toFEBogoConfig(couponBE.bogoConfig)
      : undefined,
    /** Min Purchase Amount */
    minPurchaseAmount: couponBE.minPurchaseAmount,
    /** Min Quantity */
    minQuantity: couponBE.minQuantity,
    /** Applicability */
    applicability: couponBE.applicability,
    /** Applicable Categories */
    applicableCategories: couponBE.applicableCategories,
    /** Applicable Products */
    applicableProducts: couponBE.applicableProducts,
    /** Excluded Categories */
    excludedCategories: couponBE.excludedCategories,
    /** Excluded Products */
    excludedProducts: couponBE.excludedProducts,
    /** Usage Limit */
    usageLimit: couponBE.usageLimit,
    /** Usage Limit Per User */
    usageLimitPerUser: couponBE.usageLimitPerUser,
    /** Usage Count */
    usageCount: couponBE.usageCount,
    startDate,
    endDate,
    /** Status */
    status: couponBE.status,
    /** First Order Only */
    firstOrderOnly: couponBE.firstOrderOnly,
    /** New Users Only */
    newUsersOnly: couponBE.newUsersOnly,
    /** Can Combine With Other Coupons */
    canCombineWithOtherCoupons: couponBE.canCombineWithOtherCoupons,
    /** Auto Apply */
    autoApply: couponBE.autoApply,
    /** Is Public */
    isPublic: couponBE.isPublic,
    /** Featured */
    featured: couponBE.featured,
    createdAt,
    updatedAt,
    isActive,
    isExpired,
    isUsedUp,
    canBeUsed,
    remainingUses,
    usagePercentage,
    /** Formatted Start Date */
    formattedStartDate: formatDate(startDate),
    /** Formatted End Date */
    formattedEndDate: formatDate(endDate),
    /** Formatted Discount */
    formattedDiscount: formatDiscount(couponBE),
    /** Formatted Min Purchase */
    formattedMinPurchase: formatCurrency(couponBE.minPurchaseAmount),
    /** Days Until Expiry */
    daysUntilExpiry: getDaysUntilExpiry(endDate),
    /** Status Badge */
    statusBadge: getStatusBadge(couponBE.status, isExpired, isUsedUp),
  };
};

/**
 * Transform array of Coupon BE to FE
 */
/**
 * Performs to f e coupons operation
 *
 * @param {CouponBE[]} couponsBE - The coupons b e
 *
 * @returns {any} The tofecoupons result
 *
 * @example
 * toFECoupons(couponsBE);
 */

/**
 * Performs to f e coupons operation
 *
 * @param {CouponBE[]} couponsBE - The coupons b e
 *
 * @returns {any} The tofecoupons result
 *
 * @example
 * toFECoupons(couponsBE);
 */

export const toFECoupons = (couponsBE: CouponBE[]): CouponFE[] => {
  return couponsBE.map(toFECoupon);
};

/**
 * Transform Coupon BE to Card FE (for list views)
 */
/**
 * Performs to f e coupon card operation
 *
 * @param {CouponBE} couponBE - The coupon b e
 *
 * @returns {any} The tofecouponcard result
 *
 * @example
 * toFECouponCard(couponBE);
 */

/**
 * Performs to f e coupon card operation
 *
 * @param {CouponBE} couponBE - The coupon b e
 *
 * @returns {any} The tofecouponcard result
 *
 * @example
 * toFECouponCard(couponBE);
 */

export const toFECouponCard = (couponBE: CouponBE): CouponCardFE => {
  const endDate = couponBE.endDate.toDate();
  const now = new Date();
  const isExpired = endDate < now;
  const isUsedUp = couponBE.usageLimit
    ? couponBE.usageCount >= couponBE.usageLimit
    : false;
  const isActive =
    couponBE.status === CouponStatus.ACTIVE && !isExpired && !isUsedUp;

  return {
    /** Id */
    id: couponBE.id,
    /** Code */
    code: couponBE.code,
    /** Name */
    name: couponBE.name,
    /** Description */
    description: couponBE.description,
    /** Type */
    type: couponBE.type,
    /** Discount Value */
    discountValue: couponBE.discountValue,
    /** Status */
    status: couponBE.status,
    /** Start Date */
    startDate: couponBE.startDate.toDate(),
    endDate,
    /** Usage Count */
    usageCount: couponBE.usageCount,
    /** Usage Limit */
    usageLimit: couponBE.usageLimit,
    /** Is Public */
    isPublic: couponBE.isPublic,
    /** Featured */
    featured: couponBE.featured,
    /** Formatted Discount */
    formattedDiscount: formatDiscount(couponBE),
    /** Formatted Valid Until */
    formattedValidUntil: `Valid until ${formatDate(endDate)}`,
    isActive,
    /** Status Badge */
    statusBadge: getStatusBadge(couponBE.status, isExpired, isUsedUp),
  };
};

/**
 * Transform array of Coupon BE to Card FE
 */
/**
 * Performs to f e coupon cards operation
 *
 * @param {CouponBE[]} couponsBE - The coupons b e
 *
 * @returns {any} The tofecouponcards result
 *
 * @example
 * toFECouponCards(couponsBE);
 */

/**
 * Performs to f e coupon cards operation
 *
 * @param {CouponBE[]} couponsBE - The coupons b e
 *
 * @returns {any} The tofecouponcards result
 *
 * @example
 * toFECouponCards(couponsBE);
 */

export const toFECouponCards = (couponsBE: CouponBE[]): CouponCardFE[] => {
  return couponsBE.map(toFECouponCard);
};

/**
 * Transform Coupon Form FE to Create Request BE
 */
/**
 * Performs to b e create coupon request operation
 *
 * @param {CouponFormFE} formData - The form data
 *
 * @returns {any} The tobecreatecouponrequest result
 *
 * @example
 * toBECreateCouponRequest(formData);
 */

/**
 * Performs to b e create coupon request operation
 *
 * @param {CouponFormFE} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobecreatecouponrequest result
 *
 * @example
 * toBECreateCouponRequest(/** Form Data */
  formData);
 */

export const toBECreateCouponRequest = (
  /** Form Data */
  formData: CouponFormFE,
): CreateCouponRequestBE => {
  return {
    /** Shop Id */
    shopId: formData.shopId,
    /** Code */
    code: formData.code,
    /** Name */
    name: formData.name,
    /** Description */
    description: formData.description,
    /** Type */
    type: formData.type,
    /** Discount Value */
    discountValue: formData.discountValue,
    /** Max Discount Amount */
    maxDiscountAmount: formData.maxDiscountAmount,
    /** Tiers */
    tiers: formData.tiers,
    /** Bogo Config */
    bogoConfig: formData.bogoConfig,
    /** Min Purchase Amount */
    minPurchaseAmount: formData.minPurchaseAmount,
    /** Min Quantity */
    minQuantity: formData.minQuantity,
    /** Applicability */
    applicability: formData.applicability,
    /** Applicable Categories */
    applicableCategories: formData.applicableCategories,
    /** Applicable Products */
    applicableProducts: formData.applicableProducts,
    /** Excluded Categories */
    excludedCategories: formData.excludedCategories,
    /** Excluded Products */
    excludedProducts: formData.excludedProducts,
    /** Usage Limit */
    usageLimit: formData.usageLimit,
    /** Usage Limit Per User */
    usageLimitPerUser: formData.usageLimitPerUser,
    /** Start Date */
    startDate:
      typeof formData.startDate === "string"
        ? formData.startDate
        : safeToISOString(formData.startDate) || new Date().toISOString(),
    /** End Date */
    endDate:
      typeof formData.endDate === "string"
        ? formData.endDate
        : safeToISOString(formData.endDate) || new Date().toISOString(),
    /** First Order Only */
    firstOrderOnly: formData.firstOrderOnly,
    /** New Users Only */
    newUsersOnly: formData.newUsersOnly,
    /** Can Combine With Other Coupons */
    canCombineWithOtherCoupons: formData.canCombineWithOtherCoupons,
    /** Auto Apply */
    autoApply: formData.autoApply,
    /** Is Public */
    isPublic: formData.isPublic,
    /** Featured */
    featured: formData.featured,
  };
};

/**
 * Transform Coupon Form FE to Update Request BE
 */
/**
 * Performs to b e update coupon request operation
 *
 * @param {Partial<CouponFormFE>} formData - The form data
 *
 * @returns {any} The tobeupdatecouponrequest result
 *
 * @example
 * toBEUpdateCouponRequest(formData);
 */

/**
 * Performs to b e update coupon request operation
 *
 * @param {Partial<CouponFormFE>} /** Form Data */
  formData - The /**  form  data */
  form data
 *
 * @returns {any} The tobeupdatecouponrequest result
 *
 * @example
 * toBEUpdateCouponRequest(/** Form Data */
  formData);
 */

export const toBEUpdateCouponRequest = (
  /** Form Data */
  formData: Partial<CouponFormFE>,
): UpdateCouponRequestBE => {
  const request: UpdateCouponRequestBE = {};

  if (formData.shopId) request.shopId = formData.shopId;
  if (formData.code) request.code = formData.code;
  if (formData.name) request.name = formData.name;
  if (formData.description !== undefined)
    request.description = formData.description;
  if (formData.type) request.type = formData.type;
  if (formData.discountValue !== undefined)
    request.discountValue = formData.discountValue;
  if (formData.maxDiscountAmount !== undefined)
    request.maxDiscountAmount = formData.maxDiscountAmount;
  if (formData.tiers) request.tiers = formData.tiers;
  if (formData.bogoConfig) request.bogoConfig = formData.bogoConfig;
  if (formData.minPurchaseAmount !== undefined)
    request.minPurchaseAmount = formData.minPurchaseAmount;
  if (formData.minQuantity !== undefined)
    request.minQuantity = formData.minQuantity;
  if (formData.applicability) request.applicability = formData.applicability;
  if (formData.applicableCategories)
    request.applicableCategories = formData.applicableCategories;
  if (formData.applicableProducts)
    request.applicableProducts = formData.applicableProducts;
  if (formData.excludedCategories)
    request.excludedCategories = formData.excludedCategories;
  if (formData.excludedProducts)
    request.excludedProducts = formData.excludedProducts;
  if (formData.usageLimit !== undefined)
    request.usageLimit = formData.usageLimit;
  if (formData.usageLimitPerUser !== undefined)
    request.usageLimitPerUser = formData.usageLimitPerUser;
  if (formData.startDate) {
    request.startDate =
      typeof formData.startDate === "string"
        ? formData.startDate
        : safeToISOString(formData.startDate) || new Date().toISOString();
  }
  if (formData.endDate) {
    request.endDate =
      typeof formData.endDate === "string"
        ? formData.endDate
        : safeToISOString(formData.endDate) || new Date().toISOString();
  }
  if (formData.firstOrderOnly !== undefined)
    request.firstOrderOnly = formData.firstOrderOnly;
  if (formData.newUsersOnly !== undefined)
    request.newUsersOnly = formData.newUsersOnly;
  if (formData.canCombineWithOtherCoupons !== undefined)
    request.canCombineWithOtherCoupons = formData.canCombineWithOtherCoupons;
  if (formData.autoApply !== undefined) request.autoApply = formData.autoApply;
  if (formData.isPublic !== undefined) request.isPublic = formData.isPublic;
  if (formData.featured !== undefined) request.featured = formData.featured;

  return request;
};
