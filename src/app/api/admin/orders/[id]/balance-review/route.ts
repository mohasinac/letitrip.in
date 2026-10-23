/**
 * POST /api/admin/orders/[id]/balance-review
 *
 * D55 — staff approve or reject a submitted pre-order balance proof.
 *
 * Admin + moderator, matching the deposit's `payment-verify` /
 * `payment-reject-fraud` pair: a seller sees the UTR but never the buyer's
 * bank screenshot, so verification is not theirs.
 *
 * 🛑 A rejection REQUIRES a note, enforced inside `reviewBalanceProof`. The
 * buyer has to know what to send instead — "rejected" alone guarantees the
 * next attempt is the same proof again.
 *
 * Body: { approve: boolean; note?: string }
 */

import { withProviders } from "@/providers.config";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_ADMIN_MOD } from "@/constants";
import { reviewBalanceProof } from "@mohasinac/appkit/server";
import { balanceReviewSchema } from "@mohasinac/appkit/features/orders/schemas/balance";

export const POST = withProviders(
  createRouteHandler<(typeof balanceReviewSchema)["_output"]>({
    auth: true,
    roles: ROLES_ADMIN_MOD,
    permission: "orders:write",
    schema: balanceReviewSchema,
    handler: async ({ body, params, user }) => {
      const id = (params as { id: string }).id;
      await reviewBalanceProof(id, user!.uid, body!.approve, body!.note);
      return successResponse({ orderId: id, status: body!.approve ? "paid" : "rejected" });
    },
  }),
);
