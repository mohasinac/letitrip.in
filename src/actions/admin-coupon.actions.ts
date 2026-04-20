"use server";

/**
 * Admin Coupon Server Actions
 *
 * Create/update/delete mutations for coupons — call couponsRepository directly.
 * Validation action lives in coupon.actions.ts (user-facing).
 */

import { z } from "zod";
import { requireRoleUser } from "@mohasinac/appkit";
import {
  adminCreateCoupon as adminCreateCouponDomain,
  adminUpdateCoupon as adminUpdateCouponDomain,
  adminDeleteCoupon as adminDeleteCouponDomain,
  listAdminCoupons as listAdminCouponsDomain,
} from "@mohasinac/appkit";
import {
  rateLimitByIdentifier,
  RateLimitPresets,
} from "@mohasinac/appkit";
import {
  AuthorizationError,
  ValidationError,
} from "@mohasinac/appkit";
import type { CouponDocument, CouponCreateInput, CouponUpdateInput } from "@mohasinac/appkit";
import type { FirebaseSieveResult, SieveModel } from "@mohasinac/appkit";

// ─── Schemas ──────────────────────────────────────────────────────────────

const couponIdSchema = z.object({ id: z.string().min(1, "id is required") });

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
  applicableSellers: z.array(z.string()).optional(),
  excludeProducts: z.array(z.string()).optional(),
  excludeCategories: z.array(z.string()).optional(),
  firstTimeUserOnly: z.boolean().default(false),
  combineWithSellerCoupons: z.boolean().default(false),
});

const createCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  name: z.string().min(1),
  description: z.string().default(""),
  type: z.enum(["percentage", "fixed", "free_shipping", "buy_x_get_y"]),
  discount: discountConfigSchema,
  usage: usageConfigSchema,
  validity: validityConfigSchema,
  restrictions: restrictionsConfigSchema,
});

const updateCouponSchema = createCouponSchema.partial();

export type AdminCreateCouponInput = z.infer<typeof createCouponSchema>;
export type AdminUpdateCouponInput = z.infer<typeof updateCouponSchema>;

// ─── Server Actions ────────────────────────────────────────────────────────

export async function adminCreateCouponAction(
  input: AdminCreateCouponInput,
): Promise<CouponDocument> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `coupon:create:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const parsed = createCouponSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid coupon data",
    );

  const data = parsed.data;
  return adminCreateCouponDomain(admin.uid, {
    ...(data as unknown as CouponCreateInput),
    validity: {
      ...data.validity,
      startDate: new Date(data.validity.startDate),
      endDate: data.validity.endDate
        ? new Date(data.validity.endDate)
        : undefined,
    },
  });
}

export async function adminUpdateCouponAction(
  id: string,
  input: AdminUpdateCouponInput,
): Promise<CouponDocument> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `coupon:update:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = couponIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const parsed = updateCouponSchema.safeParse(input);
  if (!parsed.success)
    throw new ValidationError(
      parsed.error.issues[0]?.message ?? "Invalid update data",
    );

  const data = parsed.data;
  return adminUpdateCouponDomain(admin.uid, id, {
    ...(data as CouponUpdateInput),
    ...(data.validity
      ? {
          validity: {
            ...data.validity,
            startDate: new Date(data.validity.startDate),
            endDate: data.validity.endDate
              ? new Date(data.validity.endDate)
              : undefined,
          },
        }
      : {}),
  });
}

export async function adminDeleteCouponAction(id: string): Promise<void> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `coupon:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = couponIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  await adminDeleteCouponDomain(admin.uid, id);
}

// ─── Read Actions ─────────────────────────────────────────────────────────────

export async function listAdminCouponsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<FirebaseSieveResult<CouponDocument>> {
  await requireRoleUser(["admin"]);
  return listAdminCouponsDomain(params) as Promise<FirebaseSieveResult<CouponDocument>>;
}

