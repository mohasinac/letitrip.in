/**
 * Admin Coupon Detail API Route
 * GET    /api/admin/coupons/[id] — Get single coupon
 * PATCH  /api/admin/coupons/[id] — Update coupon
 * DELETE /api/admin/coupons/[id] — Delete coupon
 */

import { NextRequest } from "next/server";
import { successResponse } from "@/lib/api-response";
import { getAuthenticatedUser } from "@/lib/firebase/auth-server";
import { handleApiError } from "@/lib/errors/error-handler";
import { AuthenticationError, NotFoundError } from "@/lib/errors";
import { requireRole } from "@/lib/security/authorization";
import { couponsRepository, userRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "@/constants";

interface RouteContext {
  params: Promise<{ id: string }>;
}

async function getAdminUser(roles: string[]) {
  const authUser = await getAuthenticatedUser();
  if (!authUser)
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  const firestoreUser = await userRepository.findById(authUser.uid);
  if (!firestoreUser)
    throw new AuthenticationError(ERROR_MESSAGES.AUTH.UNAUTHORIZED);
  requireRole(
    { ...authUser, role: firestoreUser.role || "user" },
    roles as any,
  );
  return authUser;
}

/**
 * GET /api/admin/coupons/[id]
 */
export async function GET(_request: NextRequest, context: RouteContext) {
  try {
    await getAdminUser(["admin", "moderator"]);
    const { id } = await context.params;

    const coupon = await couponsRepository.findById(id);
    if (!coupon) throw new NotFoundError(ERROR_MESSAGES.COUPON.NOT_FOUND);

    return successResponse(coupon);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/admin/coupons/[id]
 *
 * Update allowed coupon fields (name, description, discount, usage, validity, restrictions)
 */
export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const adminUser = await getAdminUser(["admin"]);
    const { id } = await context.params;

    const coupon = await couponsRepository.findById(id);
    if (!coupon) throw new NotFoundError(ERROR_MESSAGES.COUPON.NOT_FOUND);

    const body = await request.json();

    // Only allow safe updatable fields
    const ALLOWED_FIELDS = [
      "name",
      "description",
      "discount",
      "bxgy",
      "tiers",
      "usage",
      "validity",
      "restrictions",
    ];
    const update: Record<string, unknown> = {};
    for (const field of ALLOWED_FIELDS) {
      if (field in body) update[field] = body[field];
    }

    const updated = await couponsRepository.update(id, {
      ...update,
      updatedAt: new Date(),
    });

    serverLogger.info("Admin coupon updated", {
      couponId: id,
      adminUid: adminUser.uid,
    });

    return successResponse(updated, SUCCESS_MESSAGES.COUPON.UPDATED);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/admin/coupons/[id]
 */
export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const adminUser = await getAdminUser(["admin"]);
    const { id } = await context.params;

    const coupon = await couponsRepository.findById(id);
    if (!coupon) throw new NotFoundError(ERROR_MESSAGES.COUPON.NOT_FOUND);

    await couponsRepository.delete(id);

    serverLogger.info("Admin coupon deleted", {
      couponId: id,
      code: coupon.code,
      adminUid: adminUser.uid,
    });

    return successResponse(null, SUCCESS_MESSAGES.COUPON.DELETED);
  } catch (error) {
    return handleApiError(error);
  }
}
