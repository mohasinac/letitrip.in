"use server";

/**
 * Seller Coupon Server Actions � thin entrypoint
 */

import { z } from "zod";
import { requireAuthUser } from "@mohasinac/appkit/providers/auth-firebase";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import {
  sellerCreateCoupon,
  sellerUpdateCoupon,
  sellerDeleteCoupon,
  type SellerCreateCouponInput,
  type SellerUpdateCouponInput,
} from "@mohasinac/appkit/features/promotions/server";
import { userRepository } from "@mohasinac/appkit/features/auth/server";
import type { CouponDocument } from "@mohasinac/appkit/features/promotions";

const createSchema = z.object({
  code: z.string().min(1).max(20).toUpperCase().optional(),
  discountType: z.enum(["percentage", "flat"]),
  discountValue: z.number().positive(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxUsageCount: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  description: z.string().max(300).optional(),
});

const updateSchema = z.object({
  discountValue: z.number().positive().optional(),
  minOrderAmount: z.number().nonnegative().optional(),
  maxUsageCount: z.number().int().positive().optional(),
  expiresAt: z.string().datetime().optional(),
  description: z.string().max(300).optional(),
  isActive: z.boolean().optional(),
});

export async function sellerCreateCouponAction(
  input: SellerCreateCouponInput,
): Promise<CouponDocument> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `coupon:create:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success) throw new AuthorizationError("Too many requests.");
  const parsed = createSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid coupon data");

  const createInput: SellerCreateCouponInput = {
    sellerCode: parsed.data.code ?? "SAVE",
    name: parsed.data.code ?? "Seller Coupon",
    description: parsed.data.description ?? "Seller coupon",
    type: parsed.data.discountType === "flat" ? "fixed" : "percentage",
    applicableToAuctions: false,
    discount: {
      value: parsed.data.discountValue,
      minPurchase: parsed.data.minOrderAmount,
    },
    usage: {
      totalLimit: parsed.data.maxUsageCount,
      currentUsage: 0,
    },
    validity: {
      startDate: new Date().toISOString(),
      endDate: parsed.data.expiresAt,
      isActive: true,
    },
    restrictions: {
      firstTimeUserOnly: false,
      combineWithSellerCoupons: false,
    },
  };

  return sellerCreateCoupon(user.uid, createInput);
}

export async function sellerUpdateCouponAction(
  couponId: string,
  input: SellerUpdateCouponInput,
): Promise<CouponDocument> {
  const user = await requireAuthUser();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  const profile = await userRepository.findById(user.uid);
  const role = profile?.role ?? "user";

  const updateInput: SellerUpdateCouponInput = {
    description: parsed.data.description,
    discount: parsed.data.discountValue
      ? { value: parsed.data.discountValue, minPurchase: parsed.data.minOrderAmount }
      : undefined,
    usage: parsed.data.maxUsageCount
      ? { totalLimit: parsed.data.maxUsageCount, currentUsage: 0 }
      : undefined,
    validity:
      parsed.data.expiresAt || typeof parsed.data.isActive === "boolean"
        ? {
            startDate: new Date().toISOString(),
            endDate: parsed.data.expiresAt,
            isActive: parsed.data.isActive ?? true,
          }
        : undefined,
  };

  return sellerUpdateCoupon(user.uid, role, couponId, updateInput);
}

export async function sellerDeleteCouponAction(couponId: string): Promise<void> {
  const user = await requireAuthUser();
  const profile = await userRepository.findById(user.uid);
  const role = profile?.role ?? "user";
  return sellerDeleteCoupon(user.uid, role, couponId);
}

export type { SellerCreateCouponInput, SellerUpdateCouponInput };
