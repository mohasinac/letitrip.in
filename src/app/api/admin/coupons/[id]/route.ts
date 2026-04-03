/**
 * Admin Coupon Detail API Route
 * GET    /api/admin/coupons/[id] — Get single coupon
 * PATCH  /api/admin/coupons/[id] — Update coupon
 * DELETE /api/admin/coupons/[id] — Delete coupon
 */

import { successResponse, errorResponse } from "@/lib/api-response";
import { NotFoundError } from "@/lib/errors";
import { couponsRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";
import { createRouteHandler } from "@mohasinac/next";
import { applyRateLimit, RateLimitPresets } from "@/lib/security/rate-limit";

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
export const GET = createRouteHandler<never, IdParams>({
  roles: ["admin", "moderator"],
  handler: async ({ request, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
    const { id } = params!;
    const coupon = await couponsRepository.findById(id);
    if (!coupon) throw new NotFoundError(ERROR_MESSAGES.COUPON.NOT_FOUND);
    return successResponse(coupon);
  },
});

/**
 * PATCH /api/admin/coupons/[id] — Update allowed coupon fields
 */
export const PATCH = createRouteHandler<Record<string, unknown>, IdParams>({
  roles: ["admin"],
  handler: async ({ request, user, body, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
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
export const DELETE = createRouteHandler<never, IdParams>({
  roles: ["admin"],
  handler: async ({ request, user, params }) => {
    const rl = await applyRateLimit(request, RateLimitPresets.API);
    if (!rl.success) return errorResponse("Too many requests", 429);
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
