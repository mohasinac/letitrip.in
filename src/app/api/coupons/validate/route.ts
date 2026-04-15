import "@/providers.config";
/**
 * Coupon Validate API Route
 * POST /api/coupons/validate — Validate a coupon code against a purchase amount
 *
 * Public endpoint (requires auth — validates per-user usage limits)
 */

import { successResponse } from "@mohasinac/appkit/next";
import { couponsRepository } from "@/repositories";
import { serverLogger } from "@mohasinac/appkit/monitoring";
import { z } from "zod";
import { createRouteHandler } from "@mohasinac/appkit/next";

const validateSchema = z.object({
  code: z.string().min(1),
  /** Order total in rupees — used to check minPurchase and calculate discount */
  orderTotal: z.number().min(0),
});

/**
 * POST /api/coupons/validate
 *
 * Body: { code: string, orderTotal: number }
 * Returns: { valid: boolean, discountAmount: number, coupon?, error? }
 */
export const POST = createRouteHandler<(typeof validateSchema)["_output"]>({
  auth: true,
  schema: validateSchema,
  handler: async ({ user, body }) => {
    const { code, orderTotal } = body!;
    const result = await couponsRepository.validateCoupon(
      code,
      user!.uid,
      orderTotal,
    );
    serverLogger.info("Coupon validation", {
      code,
      userId: user!.uid,
      valid: result.valid,
    });
    return successResponse(result);
  },
});

