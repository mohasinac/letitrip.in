"use server";

/**
 * Seller Coupon Server Actions — thin entrypoint
 */

import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
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
} from "@mohasinac/appkit/features/promotions";
import { userRepository } from "@mohasinac/appkit/features/auth";
import type { CouponDocument } from "@/db/schema";

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
  couponId: z.string().min(1),
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
  const user = await requireAuth();
  const rl = await rateLimitByIdentifier(
    `coupon:create:${user.uid}`,
    RateLimitPresets.STRICT,
  );
  if (!rl.success) throw new AuthorizationError("Too many requests.");
  const parsed = createSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid coupon data");
  const profile = await userRepository.findById(user.uid);
  const role = profile?.role ?? "user";
  return sellerCreateCoupon(user.uid, role, parsed.data as SellerCreateCouponInput);
}

export async function sellerUpdateCouponAction(
  input: SellerUpdateCouponInput,
): Promise<CouponDocument> {
  const user = await requireAuth();
  const parsed = updateSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(parsed.error.issues[0]?.message ?? "Invalid input");
  const profile = await userRepository.findById(user.uid);
  const role = profile?.role ?? "user";
  return sellerUpdateCoupon(user.uid, role, parsed.data as SellerUpdateCouponInput);
}

export async function sellerDeleteCouponAction(couponId: string): Promise<void> {
  const user = await requireAuth();
  const profile = await userRepository.findById(user.uid);
  const role = profile?.role ?? "user";
  return sellerDeleteCoupon(user.uid, role, couponId);
}

export type { SellerCreateCouponInput, SellerUpdateCouponInput };
