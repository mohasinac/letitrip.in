"use server";

/**
 * Seller Coupon Server Actions
 *
 * Sellers create store-scoped coupons; codes are automatically prefixed with
 * the store slug to avoid clashes between stores.
 *
 * Rules enforced here:
 *  - Requires role "seller" or "admin"
 *  - A seller can only update/delete their OWN coupons (admin can manage any)
 *  - Pre-order products are never eligible (enforced at validation time)
 *  - Auction-only coupons are marked with applicableToAuctions = true
 */

import { z } from "zod";
import { requireRole, requireAuth } from "@/lib/firebase/auth-server";
import {
  couponsRepository,
  storeRepository,
  userRepository,
} from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import { buildSellerCouponCode, type CouponDocument } from "@/db/schema";

// ─── Schemas ──────────────────────────────────────────────────────────────

const discountConfigSchema = z.object({
  value: z.number().positive(),
  maxDiscount: z.number().optional(),
  minPurchase: z.number().optional(),
});

const usageConfigSchema = z.object({
  totalLimit: z.number().int().optional(),
  perUserLimit: z.number().int().optional(),
  currentUsage: z.number().int().default(0),
});

const validityConfigSchema = z.object({
  startDate: z.string(),
  endDate: z.string().optional(),
  isActive: z.boolean().default(true),
});

const restrictionsConfigSchema = z.object({
  applicableProducts: z.array(z.string()).optional(),
  applicableCategories: z.array(z.string()).optional(),
  excludeProducts: z.array(z.string()).optional(),
  excludeCategories: z.array(z.string()).optional(),
  firstTimeUserOnly: z.boolean().default(false),
  combineWithSellerCoupons: z.boolean().default(false),
});

const sellerCreateCouponSchema = z.object({
  /** The short code the seller chooses (e.g. "SAVE10"). The store prefix
   *  is appended automatically: KEKESTUDIO-SAVE10 */
  sellerCode: z
    .string()
    .min(3)
    .max(15)
    .regex(/^[A-Z0-9]+$/i, "Code must be alphanumeric")
    .transform((v) => v.toUpperCase()),
  name: z.string().min(1).max(100),
  description: z.string().default(""),
  type: z.enum(["percentage", "fixed", "free_shipping", "buy_x_get_y"]),
  /**
   * When true: this coupon is valid only for auction items in this store.
   * When false: valid only for regular (fixed-price) items in this store.
   * Pre-order items are NEVER eligible regardless of this flag.
   */
  applicableToAuctions: z.boolean().default(false),
  discount: discountConfigSchema,
  usage: usageConfigSchema,
  validity: validityConfigSchema,
  restrictions: restrictionsConfigSchema,
});

const sellerUpdateCouponSchema = sellerCreateCouponSchema
  .omit({ sellerCode: true, applicableToAuctions: true })
  .partial();

export type SellerCreateCouponInput = z.infer<typeof sellerCreateCouponSchema>;
export type SellerUpdateCouponInput = z.infer<typeof sellerUpdateCouponSchema>;

// ─── Server Actions ────────────────────────────────────────────────────────

export async function sellerCreateCouponAction(
  input: SellerCreateCouponInput,
): Promise<CouponDocument> {
  const user = await requireRole(["seller", "admin"]);

  const rl = await rateLimitByIdentifier(
    `seller-coupon:create:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = sellerCreateCouponSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid coupon data",
    );

  // Fetch the seller's store to get the storeSlug
  const store = await storeRepository.findByOwnerId(user.uid);
  if (!store || store.status !== "active")
    throw new AuthorizationError(
      "Your store must be active before you can create coupons.",
    );

  const { sellerCode, applicableToAuctions, ...rest } = parsed.data;

  // Build the full coupon code: STOREPREFIX-SELLERCODE
  const fullCode = buildSellerCouponCode(store.storeSlug, sellerCode);

  // Verify this code doesn't already exist
  const existing = await couponsRepository.getCouponByCode(fullCode);
  if (existing)
    throw new ValidationError(
      `Coupon code "${fullCode}" already exists. Please choose a different code.`,
    );

  const coupon = await couponsRepository.create({
    ...rest,
    code: fullCode,
    scope: "seller",
    sellerId: user.uid,
    storeSlug: store.storeSlug,
    applicableToAuctions,
    createdBy: user.uid,
    validity: {
      ...rest.validity,
      startDate: new Date(rest.validity.startDate),
      endDate: rest.validity.endDate
        ? new Date(rest.validity.endDate)
        : undefined,
    },
    restrictions: {
      ...rest.restrictions,
      // Seller coupons are always scoped to the seller — enforce it
      applicableSellers: [user.uid],
      combineWithSellerCoupons: false,
    },
    stats: { totalUses: 0, totalRevenue: 0, totalDiscount: 0 },
  });

  serverLogger.info("sellerCreateCouponAction", {
    sellerId: user.uid,
    storeSlug: store.storeSlug,
    couponId: coupon.id,
    code: coupon.code,
  });
  return coupon;
}

export async function sellerUpdateCouponAction(
  id: string,
  input: SellerUpdateCouponInput,
): Promise<CouponDocument> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `seller-coupon:update:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!id) throw new ValidationError("Invalid coupon id");

  const existing = await couponsRepository.findById(id);
  if (!existing) throw new NotFoundError("Coupon not found");

  // Sellers can only update their own coupons
  const profile = await userRepository.findById(user.uid);
  if (profile?.role !== "admin" && existing.sellerId !== user.uid)
    throw new AuthorizationError(
      "You do not have permission to update this coupon.",
    );

  const parsed = sellerUpdateCouponSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  const data = parsed.data;
  const { validity: _validity, ...dataWithoutValidity } = data;
  const updated = await couponsRepository.update(id, {
    ...dataWithoutValidity,
    ...(data.validity
      ? {
          validity: {
            isActive: data.validity.isActive,
            startDate: data.validity.startDate
              ? new Date(data.validity.startDate)
              : existing.validity.startDate,
            endDate: data.validity.endDate
              ? new Date(data.validity.endDate)
              : existing.validity.endDate,
          },
        }
      : {}),
  });

  serverLogger.info("sellerUpdateCouponAction", {
    sellerId: user.uid,
    couponId: id,
  });
  return updated;
}

export async function sellerDeleteCouponAction(id: string): Promise<void> {
  const user = await requireAuth();

  const rl = await rateLimitByIdentifier(
    `seller-coupon:delete:${user.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  if (!id) throw new ValidationError("Invalid coupon id");

  const existing = await couponsRepository.findById(id);
  if (!existing) throw new NotFoundError("Coupon not found");

  const profile = await userRepository.findById(user.uid);
  if (profile?.role !== "admin" && existing.sellerId !== user.uid)
    throw new AuthorizationError(
      "You do not have permission to delete this coupon.",
    );

  await couponsRepository.delete(id);

  serverLogger.info("sellerDeleteCouponAction", {
    sellerId: user.uid,
    couponId: id,
  });
}
