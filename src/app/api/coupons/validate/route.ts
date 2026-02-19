/**
 * Coupon Validate API Route
 * POST /api/coupons/validate — Validate a coupon code against a purchase amount
 *
 * Public endpoint (requires auth — validates per-user usage limits)
 */

import { NextRequest } from "next/server";
import { verifySessionCookie } from "@/lib/firebase/auth-server";
import { AuthenticationError } from "@/lib/errors";
import { handleApiError } from "@/lib/errors/error-handler";
import { successResponse, errorResponse } from "@/lib/api-response";
import { ERROR_MESSAGES } from "@/constants";
import { couponsRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { z } from "zod";

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
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("__session")?.value;
    if (!sessionCookie)
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
    const user = await verifySessionCookie(sessionCookie);
    if (!user)
      throw new AuthenticationError(ERROR_MESSAGES.AUTH.SESSION_EXPIRED);

    const body = await request.json();
    const validation = validateSchema.safeParse(body);
    if (!validation.success) {
      return errorResponse(ERROR_MESSAGES.VALIDATION.FAILED, 400);
    }

    const { code, orderTotal } = validation.data;

    const result = await couponsRepository.validateCoupon(
      code,
      user.uid,
      orderTotal,
    );

    serverLogger.info("Coupon validation", {
      code,
      userId: user.uid,
      valid: result.valid,
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}
