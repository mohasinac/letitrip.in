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
const formatCurrency = (amount: number): string => {
  return `₹${amount.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Format date
 */
const formatDate = (date: Date): string => {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Calculate days until expiry
 */
const getDaysUntilExpiry = (endDate: Date): number => {
  const now = new Date();
  const diff = endDate.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

/**
 * Transform TieredDiscount BE to FE
 */
const toFETieredDiscount = (tier: TieredDiscountBE): TieredDiscountFE => {
  return {
    ...tier,
    formattedMinAmount: formatCurrency(tier.minAmount),
    formattedDiscount: `${tier.discountPercentage}% off`,
  };
};

/**
 * Transform BogoConfig BE to FE
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
const getStatusBadge = (
  status: CouponStatus,
  isExpired: boolean,
  isUsedUp: boolean
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
const formatDiscount = (coupon: {
  type: string;
  discountValue?: number;
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
    id: couponBE.id,
    shopId: couponBE.shopId,
    code: couponBE.code,
    name: couponBE.name,
    description: couponBE.description,
    type: couponBE.type,
    discountValue: couponBE.discountValue,
    maxDiscountAmount: couponBE.maxDiscountAmount,
    tiers: couponBE.tiers?.map(toFETieredDiscount),
    bogoConfig: couponBE.bogoConfig
      ? toFEBogoConfig(couponBE.bogoConfig)
      : undefined,
    minPurchaseAmount: couponBE.minPurchaseAmount,
    minQuantity: couponBE.minQuantity,
    applicability: couponBE.applicability,
    applicableCategories: couponBE.applicableCategories,
    applicableProducts: couponBE.applicableProducts,
    excludedCategories: couponBE.excludedCategories,
    excludedProducts: couponBE.excludedProducts,
    usageLimit: couponBE.usageLimit,
    usageLimitPerUser: couponBE.usageLimitPerUser,
    usageCount: couponBE.usageCount,
    startDate,
    endDate,
    status: couponBE.status,
    firstOrderOnly: couponBE.firstOrderOnly,
    newUsersOnly: couponBE.newUsersOnly,
    canCombineWithOtherCoupons: couponBE.canCombineWithOtherCoupons,
    autoApply: couponBE.autoApply,
    isPublic: couponBE.isPublic,
    isFeatured: couponBE.isFeatured,
    createdAt,
    updatedAt,
    isActive,
    isExpired,
    isUsedUp,
    canBeUsed,
    remainingUses,
    usagePercentage,
    formattedStartDate: formatDate(startDate),
    formattedEndDate: formatDate(endDate),
    formattedDiscount: formatDiscount(couponBE),
    formattedMinPurchase: formatCurrency(couponBE.minPurchaseAmount),
    daysUntilExpiry: getDaysUntilExpiry(endDate),
    statusBadge: getStatusBadge(couponBE.status, isExpired, isUsedUp),
  };
};

/**
 * Transform array of Coupon BE to FE
 */
export const toFECoupons = (couponsBE: CouponBE[]): CouponFE[] => {
  return couponsBE.map(toFECoupon);
};

/**
 * Transform Coupon BE to Card FE (for list views)
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
    id: couponBE.id,
    code: couponBE.code,
    name: couponBE.name,
    description: couponBE.description,
    type: couponBE.type,
    discountValue: couponBE.discountValue,
    status: couponBE.status,
    startDate: couponBE.startDate.toDate(),
    endDate,
    usageCount: couponBE.usageCount,
    usageLimit: couponBE.usageLimit,
    isPublic: couponBE.isPublic,
    isFeatured: couponBE.isFeatured,
    formattedDiscount: formatDiscount(couponBE),
    formattedValidUntil: `Valid until ${formatDate(endDate)}`,
    isActive,
    statusBadge: getStatusBadge(couponBE.status, isExpired, isUsedUp),
  };
};

/**
 * Transform array of Coupon BE to Card FE
 */
export const toFECouponCards = (couponsBE: CouponBE[]): CouponCardFE[] => {
  return couponsBE.map(toFECouponCard);
};

/**
 * Transform Coupon Form FE to Create Request BE
 */
export const toBECreateCouponRequest = (
  formData: CouponFormFE
): CreateCouponRequestBE => {
  return {
    shopId: formData.shopId,
    code: formData.code,
    name: formData.name,
    description: formData.description,
    type: formData.type,
    discountValue: formData.discountValue,
    maxDiscountAmount: formData.maxDiscountAmount,
    tiers: formData.tiers,
    bogoConfig: formData.bogoConfig,
    minPurchaseAmount: formData.minPurchaseAmount,
    minQuantity: formData.minQuantity,
    applicability: formData.applicability,
    applicableCategories: formData.applicableCategories,
    applicableProducts: formData.applicableProducts,
    excludedCategories: formData.excludedCategories,
    excludedProducts: formData.excludedProducts,
    usageLimit: formData.usageLimit,
    usageLimitPerUser: formData.usageLimitPerUser,
    startDate:
      typeof formData.startDate === "string"
        ? formData.startDate
        : safeToISOString(formData.startDate) || new Date().toISOString(),
    endDate:
      typeof formData.endDate === "string"
        ? formData.endDate
        : safeToISOString(formData.endDate) || new Date().toISOString(),
    firstOrderOnly: formData.firstOrderOnly,
    newUsersOnly: formData.newUsersOnly,
    canCombineWithOtherCoupons: formData.canCombineWithOtherCoupons,
    autoApply: formData.autoApply,
    isPublic: formData.isPublic,
    isFeatured: formData.isFeatured,
  };
};

/**
 * Transform Coupon Form FE to Update Request BE
 */
export const toBEUpdateCouponRequest = (
  formData: Partial<CouponFormFE>
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
  if (formData.isFeatured !== undefined)
    request.isFeatured = formData.isFeatured;

  return request;
};
