"use server";

/**
 * Admin Coupon Server Actions
 *
 * Create/update/delete mutations for coupons — call couponsRepository directly.
 * Validation action lives in coupon.actions.ts (user-facing).
 */

import { z } from "zod";
import { requireRole } from "@/lib/firebase/auth-server";
import { couponsRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { rateLimitByIdentifier, RateLimitPresets } from "@/lib/security";
import {
  AuthorizationError,
  NotFoundError,
  ValidationError,
} from "@/lib/errors";
import type {
  CouponDocument,
  CouponCreateInput,
  CouponUpdateInput,
} from "@/db/schema";

// ─── Schemas ──────────────────────────────────────────────────────────────

const couponIdSchema = z.object({ id: z.string().min(1, "id is required") });

const discountConfigSchema = z.object({
  value: z.number().min(0),
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
  const admin = await requireRole(["admin"]);

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
  const coupon = await couponsRepository.create({
    ...data,
    createdBy: admin.uid,
    validity: {
      ...data.validity,
      startDate: new Date(data.validity.startDate),
      endDate: data.validity.endDate
        ? new Date(data.validity.endDate)
        : undefined,
    },
    stats: { totalUses: 0, totalRevenue: 0, totalDiscount: 0 },
  } as CouponCreateInput);

  serverLogger.info("adminCreateCouponAction", {
    adminId: admin.uid,
    couponId: coupon.id,
    code: coupon.code,
  });
  return coupon;
}

export async function adminUpdateCouponAction(
  id: string,
  input: AdminUpdateCouponInput,
): Promise<CouponDocument> {
  const admin = await requireRole(["admin"]);

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

  const existing = await couponsRepository.findById(id);
  if (!existing) throw new NotFoundError("Coupon not found");

  const data = parsed.data;
  // Build updateData — convert validity date strings to Date objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: CouponUpdateInput = {
    ...data,
    ...(data.validity
      ? {
          validity: {
            ...data.validity,
            startDate: data.validity.startDate
              ? new Date(data.validity.startDate)
              : existing.validity.startDate,
            endDate: data.validity.endDate
              ? new Date(data.validity.endDate)
              : existing.validity.endDate,
          } as CouponUpdateInput["validity"],
        }
      : {}),
  } as CouponUpdateInput;

  const updated = await couponsRepository.update(
    id,
    updateData as CouponUpdateInput,
  );

  serverLogger.info("adminUpdateCouponAction", {
    adminId: admin.uid,
    couponId: id,
  });
  return updated;
}

export async function adminDeleteCouponAction(id: string): Promise<void> {
  const admin = await requireRole(["admin"]);

  const rl = await rateLimitByIdentifier(
    `coupon:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError("Too many requests. Please slow down.");

  const idParsed = couponIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  const existing = await couponsRepository.findById(id);
  if (!existing) throw new NotFoundError("Coupon not found");

  await couponsRepository.delete(id);

  serverLogger.info("adminDeleteCouponAction", {
    adminId: admin.uid,
    couponId: id,
  });
}
