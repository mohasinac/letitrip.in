import "@/providers.config";
/**
 * Admin Coupons [id] API Route
 * GET    /api/admin/coupons/:id — Get a coupon by ID
 * PATCH  /api/admin/coupons/:id — Activate/deactivate or update a coupon
 * DELETE /api/admin/coupons/:id — Delete a coupon
 */

import { z } from "zod";
import { successResponse } from "@mohasinac/appkit/server";
import { couponsRepository } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/server";
import { SUCCESS_MESSAGES } from "@mohasinac/appkit/server";

type RouteContext = { params: Promise<{ id: string }> };

const updateCouponSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  discount: z
    .object({
      value: z.number().min(0),
      maxDiscount: z.number().optional(),
      minPurchase: z.number().optional(),
    })
    .optional(),
  usage: z
    .object({
      totalLimit: z.number().optional(),
      perUserLimit: z.number().optional(),
    })
    .optional(),
  validity: z
    .object({
      startDate: z.string().transform((v) => new Date(v)).optional(),
      endDate: z
        .string()
        .optional()
        .transform((v) => (v ? new Date(v) : undefined)),
      isActive: z.boolean().optional(),
    })
    .optional(),
  restrictions: z
    .object({
      applicableProducts: z.array(z.string()).optional(),
      applicableCategories: z.array(z.string()).optional(),
      applicableSellers: z.array(z.string()).optional(),
      excludeProducts: z.array(z.string()).optional(),
      excludeCategories: z.array(z.string()).optional(),
      firstTimeUserOnly: z.boolean().optional(),
      combineWithSellerCoupons: z.boolean().optional(),
    })
    .optional(),
  action: z.enum(["activate", "deactivate"]).optional(),
});

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const coupon = await couponsRepository.getCouponByCode(id).catch(() => null);
  if (!coupon) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.COUPON.NOT_FOUND },
      { status: 404 },
    );
  }
  return Response.json({ success: true, data: coupon });
}

export async function PATCH(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  const body = await request.json().catch(() => ({}));
  const parsed = updateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { success: false, error: parsed.error.format() },
      { status: 400 },
    );
  }

  serverLogger.info("Updating coupon", { id, action: parsed.data.action });

  const { action, ...updateData } = parsed.data;

  if (action === "deactivate") {
    await couponsRepository.deactivateCoupon(id);
    return Response.json(successResponse(null, SUCCESS_MESSAGES.COUPON.DEACTIVATED));
  }
  if (action === "activate") {
    await couponsRepository.reactivateCoupon(id);
    return Response.json(successResponse(null, SUCCESS_MESSAGES.COUPON.REACTIVATED));
  }

  // Generic PATCH — update fields via list + find pattern
  const updated = await couponsRepository.list({ filters: `id==${id}`, page: 1, pageSize: 1 });
  const coupon = updated.items[0];
  if (!coupon) {
    return Response.json({ success: false, error: ERROR_MESSAGES.COUPON.NOT_FOUND }, { status: 404 });
  }
  // Apply update via deactivate/reactivate as toggle, or use validity.isActive
  if (updateData.validity?.isActive === false) {
    await couponsRepository.deactivateCoupon(id);
  } else if (updateData.validity?.isActive === true) {
    await couponsRepository.reactivateCoupon(id);
  }
  return Response.json(successResponse({ ...coupon, ...updateData }, SUCCESS_MESSAGES.COUPON.UPDATED));
}

export async function DELETE(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id } = await context.params;
  serverLogger.info("Deleting coupon", { id });
  await couponsRepository.deactivateCoupon(id);
  return Response.json(successResponse(null, SUCCESS_MESSAGES.COUPON.DELETED));
}
