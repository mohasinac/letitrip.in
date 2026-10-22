import { withProviders } from "@/providers.config";
import { z } from "zod";
import { cartRepository } from "@mohasinac/appkit/features/cart/repository/cart.repository";
import { pointsRepository } from "@mohasinac/appkit/features/points/repository/points.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

/**
 * Cart Points Tender API (D46/D47)
 *
 * PUT /api/cart/points — opt this cart in or out of paying with points.
 *
 * ## 🛑 A boolean, and there is deliberately no amount in this body
 *
 * Decision 24: ticking the toggle applies as many points as the 50% cap allows
 * per order group, and whatever cannot be applied stays in the balance for a
 * later order. The buyer never types a number.
 *
 * That is not a UX simplification, it is the security property. An amount in a
 * request body is a client-supplied discount — the same reason
 * `/api/checkout/pricing-preview` and `/api/payment/create-order` stopped
 * accepting add-on booleans, and the same reason the deleted `pointsToRedeem`
 * field was a landmine: one route schema away from live, and `maxRedeemablePoints`
 * was the only thing standing between a caller and an arbitrary debit.
 *
 * ## What it deliberately does NOT do
 *
 * No eligibility gate. Whether any seller in the cart accepts points
 * (decision 22) and how much the cap allows are decided where the money is
 * computed — `previewCheckoutPricing`, both order paths and the capture route,
 * all four through `allocatePointsAcrossGroups`. Refusing the toggle here would
 * look safer and be worse: a buyer whose only accepting seller leaves the cart
 * would get a 400 on an unrelated change, while the real guarantee — that
 * points are never applied to a declining store's order — already holds
 * whatever this flag says. Same reasoning the add-ons route states for
 * `saleProtectionAddon`.
 *
 * Returns the live balance so the cart can render "N points available" from the
 * same response, rather than firing a second request to learn it.
 */
const pointsTenderSchema = z.object({
  useAllPoints: z.boolean(),
});

export const PUT = withProviders(
  createRouteHandler<(typeof pointsTenderSchema)["_output"]>({
    auth: true,
    schema: pointsTenderSchema,
    handler: async ({ user, body }) => {
      const useAllPoints = body!.useAllPoints;
      await cartRepository.setUseAllPoints(user!.uid, useAllPoints);
      /*
       * Read AFTER the write, so the figure returned reflects the cart the
       * buyer now has. The balance itself is unchanged by this call — nothing
       * is debited until an order exists (see `settlePointsTender`) — so this
       * is purely what the toggle's own label needs.
       */
      const balance = await pointsRepository.getBalance(user!.uid);
      return successResponse({ useAllPoints, balance });
    },
  }),
);
