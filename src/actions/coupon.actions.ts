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

// ─── Validation schemas ────────────────────────────────────────────────────

const validateCouponSchema = z.object({
  code: z.string().min(1).max(50),
  orderTotal: z.number().min(0),
});

const cartItemSchema = z.object({
  productId: z.string(),
  sellerId: z.string(),
  price: z.number().min(0),
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

export interface ValidateCouponResult {
  valid: boolean;
  discountAmount: number;
  coupon?: unknown;
  error?: string;
}

export interface ValidateCouponForCartResult {
  valid: boolean;
  discountAmount: number;
  eligibleSubtotal?: number;
  eligibleProductIds?: string[];
  scope?: "admin" | "seller";
  sellerId?: string;
  coupon?: unknown;
  error?: string;
}

// ─── Server Actions ─────────────────────────────────────────────────────────

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

/**
 * Validate a coupon code against all cart items.
 *
 * This action enforces:
 *  - Seller coupons only discount items from that seller
 *  - Auction coupons only discount auction items
 *  - Pre-order items are never discounted
 *
 * Returns eligible product IDs so the UI can show which items are discounted.
 */
export async function validateCouponForCartAction(
  input: ValidateCouponForCartInput,
): Promise<ValidateCouponForCartResult> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `coupon:validate:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = validateCouponForCartSchema.safeParse(input);
  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid coupon input",
    );
  }

  const { code, cartItems } = parsed.data;

  serverLogger.debug("validateCouponForCartAction", {
    uid: user.uid,
    code,
    itemCount: cartItems.length,
  });

  const result = await couponsRepository.validateCouponForCart(
    code,
    user.uid,
    cartItems,
  );

  return {
    valid: result.valid,
    discountAmount: result.discountAmount ?? 0,
    eligibleSubtotal: result.eligibleSubtotal,
    eligibleProductIds: result.eligibleProductIds,
    scope: result.scope,
    sellerId: result.sellerId,
    coupon: result.coupon,
    error: result.message,
  };
}
