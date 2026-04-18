"use server";

/**
 * Coupon Server Actions — thin entrypoint
 *
 * Authenticates, validates, rate-limits, then delegates to appkit
 * domain functions.  No business logic here.
 */

import { z } from "zod";
import { requireAuthUser } from "@mohasinac/appkit/providers/auth-firebase";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit/security";
import { AuthorizationError, ValidationError } from "@mohasinac/appkit/errors";
import {
  validateCoupon,
  validateCouponForCart,
} from "@mohasinac/appkit/features/promotions/server";
import type {
  CouponValidationResult,
} from "@mohasinac/appkit/features/promotions";
import type {
  CouponCartValidationResult,
} from "@mohasinac/appkit/features/promotions/server";

// ─── Validation schemas ────────────────────────────────────────────────────

const validateCouponSchema = z.object({
  code: z.string().min(1).max(50),
  orderTotal: z.number().min(0),
});

const cartItemSchema = z.object({
  productId: z.string(),
  sellerId: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().min(1),
  isPreOrder: z.boolean(),
  isAuction: z.boolean(),
});

const validateCouponForCartSchema = z.object({
  code: z.string().min(1).max(50),
  cartItems: z.array(cartItemSchema).min(1),
});

export type ValidateCouponInput = z.infer<typeof validateCouponSchema>;
export type ValidateCouponForCartInput = z.infer<
  typeof validateCouponForCartSchema
>;

export type { CouponValidationResult, CouponCartValidationResult };

// ─── Server Actions ─────────────────────────────────────────────────────────

export async function validateCouponAction(
  input: ValidateCouponInput,
): Promise<CouponValidationResult> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `coupon:validate:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = validateCouponSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid coupon input",
    );

  return validateCoupon(user.uid, parsed.data.code, parsed.data.orderTotal);
}

export async function validateCouponForCartAction(
  input: ValidateCouponForCartInput,
): Promise<CouponCartValidationResult> {
  const user = await requireAuthUser();
  const rl = await rateLimitByIdentifier(
    `coupon:validate:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = validateCouponForCartSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid coupon input",
    );

  return validateCouponForCart(user.uid, parsed.data.code, parsed.data.cartItems);
}

