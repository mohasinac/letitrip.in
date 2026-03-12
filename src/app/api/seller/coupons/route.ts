/**
 * Seller Coupons API Route
 * GET /api/seller/coupons — List the authenticated seller's own coupons
 *
 * Mutations (create/update/delete) are handled by Server Actions in
 * src/actions/seller-coupon.actions.ts.
 */

import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { couponsRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";

export const GET = createApiHandler({
  auth: true,
  roles: ["seller", "admin"],
  handler: async ({ user }: { user?: { uid: string } }) => {
    serverLogger.info("Seller coupons list requested", {
      sellerId: user?.uid,
    });

    const coupons = await couponsRepository.getSellerCoupons(user!.uid);

    return successResponse({ coupons, total: coupons.length });
  },
});
