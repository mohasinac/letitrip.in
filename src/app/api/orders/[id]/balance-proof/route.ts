/**
 * POST /api/orders/[id]/balance-proof
 *
 * D55 — the buyer submits proof of paying a pre-order balance.
 *
 * Separate from `/payment-proof`, which is the DEPOSIT's. A pre-order has two
 * payments months apart: reusing the deposit's fields would overwrite the
 * evidence for the payment that created the order, and `paymentWindowTimeout`
 * would then sweep a paid order as unpaid and restock it.
 *
 * Allowed from `awaiting` AND from `rejected` — a blurred screenshot is the
 * commonest reason to need a second attempt, and locking the buyer out after
 * one rejection turns a recoverable mistake into a support ticket.
 *
 * Body: { proofUrl: string; transactionId: string }
 */

import { withProviders } from "@/providers.config";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { submitBalanceProof } from "@mohasinac/appkit/server";
import { balanceProofSchema } from "@mohasinac/appkit/features/orders/schemas/balance";

export const POST = withProviders(
  createRouteHandler<(typeof balanceProofSchema)["_output"]>({
    auth: true,
    /*
     * No `roles` — any signed-in buyer may pay their OWN balance, and
     * ownership is the real gate. `submitBalanceProof` re-checks it against
     * `order.userId` (NOT `buyerId`, which is not a field on `OrderDocument`
     * and would silently match nothing) and throws a NotFound rather than a
     * 403, so the endpoint does not confirm that someone else's order id is
     * real.
     */
    schema: balanceProofSchema,
    handler: async ({ body, params, user }) => {
      const id = (params as { id: string }).id;
      await submitBalanceProof(id, user!.uid, body!.proofUrl, body!.transactionId);
      return successResponse({ orderId: id, status: "submitted" });
    },
  }),
);
