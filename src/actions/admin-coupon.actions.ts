"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Admin Coupon Server Actions
 *
 * Create/update/delete mutations for coupons — call couponsRepository directly.
 * Validation action lives in coupon.actions.ts (user-facing).
 */

import { z } from "zod";
import { requireRoleUser } from "@mohasinac/appkit/providers/auth-firebase/helpers";
import { adminCreateCoupon as adminCreateCouponDomain, adminUpdateCoupon as adminUpdateCouponDomain, adminDeleteCoupon as adminDeleteCouponDomain, listAdminCoupons as listAdminCouponsDomain } from "@mohasinac/appkit/features/admin/actions/admin-coupon-actions";
import { rateLimitByIdentifier, RateLimitPresets } from "@mohasinac/appkit/security/rate-limit";
import { AuthorizationError } from "@mohasinac/appkit/errors/authorization-error";
import { ValidationError } from "@mohasinac/appkit/errors/validation-error";
import type { CouponDocument, CouponCreateInput, CouponUpdateInput } from "@mohasinac/appkit/features/promotions/schemas/firestore";
import type { FirebaseSieveResult } from "@mohasinac/appkit/providers/db-firebase/sieve";
import { ERR_RATE_LIMIT, ERR_INVALID_UPDATE } from "./_constants";

// --- Schemas --------------------------------------------------------------

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
});

const createCouponSchema = z.object({
  code: z.string().min(1).max(50).toUpperCase(),
  name: z.string().min(1),
  description: z.string().default(""),
  type: z.enum(["percentage", "fixed", "free_shipping", "buy_x_get_y"]),
  discount: discountConfigSchema,
  /*
   * 🛑 `bxgy` IS DELIBERATELY ABSENT HERE, AND THIS IS NOT THE SILENT-STRIP
   * BUG THE ROUTES HAD — it is the one fix that could not be applied the same
   * way.
   *
   * Embedding appkit's `bxgyConfigSchema` would reintroduce the zod version
   * fault: appkit pins zod ^3.24, this file's `z` is the root's zod 4, and
   * zod 4 THROWS on a zod-3 schema nested inside one of its objects. Restating
   * the shape in zod 4 would be the fifth hand-written copy of a validator
   * that exists precisely so there is one.
   *
   * It costs nothing today: `adminCreateCouponAction` / `adminUpdateCouponAction`
   * have NO callers — `src/actions/index.ts` re-exports them and nothing else
   * references either — because `AdminCouponEditorView` writes through
   * `apiClient.post`/`.patch` to the two API routes, which DO carry `bxgy`.
   *
   * 🛑 If a caller is ever added, do NOT add `bxgy` to this local schema.
   * Point the action at `couponCreateBodySchema` / `couponUpdateBodySchema`
   * from appkit, the same way the routes do.
   */
  usage: usageConfigSchema,
  validity: validityConfigSchema,
  restrictions: restrictionsConfigSchema,
});

const updateCouponSchema = createCouponSchema.partial();

export type AdminCreateCouponInput = z.infer<typeof createCouponSchema>;
export type AdminUpdateCouponInput = z.infer<typeof updateCouponSchema>;

// --- Server Actions --------------------------------------------------------

export async function adminCreateCouponAction(
  input: AdminCreateCouponInput,
): Promise<ActionResult<CouponDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin"]);
    
      const rl = await rateLimitByIdentifier(
        `coupon:create:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
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
  });
}

export async function adminUpdateCouponAction(
  id: string,
  input: AdminUpdateCouponInput,
): Promise<ActionResult<CouponDocument>> {
  return wrapAction(async () => {
    const admin = await requireRoleUser(["admin"]);
    
      const rl = await rateLimitByIdentifier(
        `coupon:update:${admin.uid}`,
        RateLimitPresets.API,
      );
      if (!rl.success)
        throw new AuthorizationError(ERR_RATE_LIMIT);
    
      const idParsed = couponIdSchema.safeParse({ id });
      if (!idParsed.success) throw new ValidationError("Invalid id");
    
      const parsed = updateCouponSchema.safeParse(input);
      if (!parsed.success)
        throw new ValidationError(
          parsed.error.issues[0]?.message ?? ERR_INVALID_UPDATE,
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
  });
}

export async function adminDeleteCouponAction(id: string): Promise<void> {
  const admin = await requireRoleUser(["admin"]);

  const rl = await rateLimitByIdentifier(
    `coupon:delete:${admin.uid}`,
    RateLimitPresets.API,
  );
  if (!rl.success)
    throw new AuthorizationError(ERR_RATE_LIMIT);

  const idParsed = couponIdSchema.safeParse({ id });
  if (!idParsed.success) throw new ValidationError("Invalid id");

  await adminDeleteCouponDomain(admin.uid, id);
}

// --- Read Actions -------------------------------------------------------------

export async function listAdminCouponsAction(params?: {
  filters?: string;
  sorts?: string;
  page?: number;
  pageSize?: number;
}): Promise<ActionResult<FirebaseSieveResult<CouponDocument>>> {
  return wrapAction(async () => {
    await requireRoleUser(["admin"]);
      return listAdminCouponsDomain(params) as Promise<FirebaseSieveResult<CouponDocument>>;
  });
}

