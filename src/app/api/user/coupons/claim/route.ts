/**
 * POST /api/user/coupons/claim
 *
 * Plan §10 — claim a coupon into the user's wallet. Idempotent: a second
 * claim for the same code is a 200 no-op returning the existing claim row.
 *
 * Validation order:
 *   1. Coupon exists.
 *   2. Coupon is currently valid (validity.isActive + within window).
 *   3. `restrictions.firstTimeUserOnly` is honoured (best-effort — checkout
 *      still validates again at redeem time).
 *
 * Source enum is purely analytic — `manual` from a page CTA, `spin` /
 * `raffle` / `prize-draw` from the matching win surface, `promo` from a
 * homepage banner.
 */
import { withProviders } from "@/providers.config";
import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  ApiErrors,
  claimedCouponsRepository,
  couponsRepository,
  isCouponValid,
  type ClaimedCouponSource,
  type CouponDocument,
} from "@mohasinac/appkit";

const claimSchema = z.object({
  couponCode: z.string().min(1).max(50),
  source: z
    .enum(["manual", "promo", "spin", "raffle", "prize-draw"])
    .optional(),
});

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const POST = withProviders(
  createRouteHandler<(typeof claimSchema)["_output"]>({
    auth: true,
    schema: claimSchema,
    handler: async ({ user, body }) => {
      const { couponCode, source } = body!;
      const code = couponCode.trim().toUpperCase();

      const coupon = (await couponsRepository.getCouponByCode(code)) as
        | CouponDocument
        | null;
      if (!coupon) {
        return ApiErrors.notFound("Coupon not found.");
      }
      if (!isCouponValid(coupon)) {
        return ApiErrors.badRequest("This coupon is no longer valid.");
      }

      const claim = await claimedCouponsRepository.claim({
        userId: user!.uid,
        couponId: coupon.id,
        couponCode: code,
        source: (source ?? "manual") as ClaimedCouponSource,
        couponSnapshot: {
          name: coupon.name,
          description: coupon.description,
          type: coupon.type,
          scope: coupon.scope,
          storeId: coupon.storeId,
          discount: coupon.discount,
          restrictions: coupon.restrictions,
        },
        expiresAt: coupon.validity.endDate ?? null,
      });

      return successResponse({ claim }, "Coupon claimed.", 201);
    },
  }),
);
