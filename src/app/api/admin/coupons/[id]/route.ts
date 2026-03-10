/**
 * Admin Coupon Detail API Route
 * GET    /api/admin/coupons/[id] — Get single coupon
 * PATCH  /api/admin/coupons/[id] — Update coupon
 * DELETE /api/admin/coupons/[id] — Delete coupon
 */

import { successResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { couponsRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { createApiHandler } from "@/lib/api/api-handler";
import { RateLimitPresets } from "@/lib/security/rate-limit";

type IdParams = { id: string };

const COUPON_ALLOWED_FIELDS = [
  "name",
  "description",
  "discount",
  "bxgy",
  "tiers",
  "usage",
  "validity",
  "restrictions",
] as const;

/**
 * GET /api/admin/coupons/[id]
 */
export const GET = createApiHandler<never, IdParams>({
  roles: ["admin", "moderator"],
  rateLimit: RateLimitPresets.API,
  handler: async ({ params }) => {
    const { id } = params!;
    const coupon = await couponsRepository.findById(id);
    if (!coupon) throw new NotFoundError(ERROR_MESSAGES.COUPON.NOT_FOUND);
    return successResponse(coupon);
  },
});

/**
 * PATCH /api/admin/coupons/[id] — Update allowed coupon fields
 */
export const PATCH = createApiHandler<Record<string, unknown>, IdParams>({
  roles: ["admin"],
  rateLimit: RateLimitPresets.API,
  handler: async ({ user, body, params }) => {
    const { id } = params!;
    const coupon = await couponsRepository.findById(id);
    if (!coupon) throw new NotFoundError(ERROR_MESSAGES.COUPON.NOT_FOUND);

    const update: Record<string, unknown> = {};
    for (const field of COUPON_ALLOWED_FIELDS) {
      if (body && field in body) update[field] = body[field];
    }

    const updated = await couponsRepository.update(id, {
      ...update,
      updatedAt: new Date(),
    });
    serverLogger.info("Admin coupon updated", {
      couponId: id,
      adminUid: user!.uid,
    });
    return successResponse(updated, SUCCESS_MESSAGES.COUPON.UPDATED);
  },
});

/**
 * DELETE /api/admin/coupons/[id]
 */
export const DELETE = createApiHandler<never, IdParams>({
  roles: ["admin"],
  rateLimit: RateLimitPresets.API,
  handler: async ({ user, params }) => {
    const { id } = params!;
    const coupon = await couponsRepository.findById(id);
    if (!coupon) throw new NotFoundError(ERROR_MESSAGES.COUPON.NOT_FOUND);

    await couponsRepository.delete(id);
    serverLogger.info("Admin coupon deleted", {
      couponId: id,
      code: coupon.code,
      adminUid: user!.uid,
    });
    return successResponse(null, SUCCESS_MESSAGES.COUPON.DELETED);
  },
});
