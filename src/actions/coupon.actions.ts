"use server";

/**
 * Coupon Server Actions
 *
 * Validate promo codes — calls the coupons repository directly,
 * bypassing the service → apiClient → API route chain.
 */

import { z } from "zod";
import { requireAuth } from "@/lib/firebase/auth-server";
import { couponsRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import { AuthorizationError, ValidationError } from "@/lib/errors";

// ─── Validation schema ─────────────────────────────────────────────────────

const validateCouponSchema = z.object({
  code: z.string().min(1).max(50),
  orderTotal: z.number().min(0),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;

export interface ValidateCouponResult {
  valid: boolean;
  discountAmount: number;
  coupon?: unknown;
  error?: string;
}

// ─── Server Action ─────────────────────────────────────────────────────────

/**
 * Validate a coupon code against a purchase amount.
 * Auth required — validates per-user usage limits.
 */
export async function validateCouponAction(
  input: ValidateCouponInput,
): Promise<ValidateCouponResult> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `coupon:validate:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = validateCouponSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid coupon input",
    );
  }

  const { code, orderTotal } = parsed.data;

  serverLogger.debug("validateCouponAction", { uid: user.uid, code });

  return couponsRepository.validateCoupon(
    code,
    user.uid,
    orderTotal,
  ) as Promise<ValidateCouponResult>;
}
