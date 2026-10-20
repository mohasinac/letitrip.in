import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { pointsRepository } from "@mohasinac/appkit/server";
import { withProviders } from "@/providers.config";

/**
 * The signed-in buyer's points balance and recent entries.
 *
 * GET /api/user/points
 *
 * 🛑 Scoped to `user.uid` from the session, with no id accepted from the
 * caller. A points balance is financial-shaped data about one person, and an
 * endpoint that takes a userId is one missing ownership check away from
 * publishing everyone's. There is no admin variant here on purpose — admin
 * adjustments belong on an admin route with its own permission.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const uid = user!.uid;
      /*
       * Balance and entries in parallel — two independent reads, and the
       * balance comes from the mirror (one document) rather than summing the
       * ledger, so this stays inside Rule #6's round-trip budget even for a
       * buyer with a long history.
       */
      const [balance, entries] = await Promise.all([
        pointsRepository.getBalance(uid),
        pointsRepository.listForUser(uid, 50),
      ]);

      return successResponse({
        balance,
        /*
         * `adminReason` is stripped. It is written for operators and its own
         * schema comment says it is never shown to the buyer — projecting the
         * whole document would publish it the moment anyone adds one
         * (Root Cause #70: a response built by spreading a document is
         * public-by-default).
         */
        entries: entries.map((e) => ({
          id: e.id,
          kind: e.kind,
          amount: e.amount,
          description: e.description,
          orderId: e.orderId,
          createdAt: e.createdAt,
        })),
      });
    },
  }),
);
