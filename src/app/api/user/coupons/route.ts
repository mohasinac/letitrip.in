/**
 * GET  /api/user/coupons       â€” list current user's claimed coupons grouped by status
 * POST /api/user/coupons/claim â€” see ./claim/route.ts (separate path for clarity)
 *
 * Plan Â§10 â€” the user's coupon wallet. One indexed read returns active +
 * expired + used buckets so the wallet page renders without further queries.
 */
import { withProviders } from "@/providers.config";
import { z } from "zod";
import { claimedCouponsRepository } from "@mohasinac/appkit/features/promotions/repository/claimed-coupons.repository";
import type { ClaimedCouponDocument } from "@mohasinac/appkit/features/promotions/schemas/firestore";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const rows = await claimedCouponsRepository.listForUser(user!.uid);
      // Newest claim first within each bucket.
      const byClaimedDesc = (a: ClaimedCouponDocument, b: ClaimedCouponDocument) =>
        new Date(b.claimedAt).getTime() - new Date(a.claimedAt).getTime();
      const active = rows.filter((r) => r.status === "active").sort(byClaimedDesc);
      const expired = rows.filter((r) => r.status === "expired").sort(byClaimedDesc);
      const used = rows.filter((r) => r.status === "used").sort(byClaimedDesc);

      return successResponse({
        active,
        expired,
        used,
        total: rows.length,
      });
    },
  }),
);

// Soft-remove is on the [id] subroute. This export keeps Zod imported for
// downstream subroutes that share validation surface.
export const _schema = z.object({});