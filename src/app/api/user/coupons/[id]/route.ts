/**
 * DELETE /api/user/coupons/[id]
 *
 * Plan §10 — soft-remove a claimed coupon. Status is flipped to "expired"
 * so the wallet hides it from the active tab but the audit trail (claim
 * source + dates) is preserved.
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  claimedCouponsRepository,
} from "@mohasinac/appkit";

export const DELETE = withProviders(
  createRouteHandler<unknown, { id: string }>({
    auth: true,
    handler: async ({ user, params }) => {
      const id = params?.id;
      if (!id) return ApiErrors.badRequest("Missing claim id.");

      const row = await claimedCouponsRepository.findById(id);
      if (!row) return ApiErrors.notFound("Claimed coupon not found.");
      if (row.userId !== user!.uid) {
        return ApiErrors.forbidden("You can only remove your own coupons.");
      }

      await claimedCouponsRepository.softRemove(row.userId, row.couponCode);
      return successResponse({ id }, "Coupon removed from wallet.");
    },
  }),
);
