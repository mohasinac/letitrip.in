/**
 * POST /api/store/orders/[id]/open-balance
 *
 * D55 — the seller's "the goods have landed, the balance is now payable"
 * signal on a pre-order.
 *
 * 🛑 Opening is an EVENT, not a derived state. A pre-order's premise is that
 * the goods do not exist yet, so computing the balance as payable from the
 * moment the order exists would be asking the buyer to fund inventory. The
 * seller opens it when stock arrives, and the buyer's 7-day window runs from
 * that moment — which is also why the action is idempotent: a second click
 * must not silently extend the deadline.
 *
 * 🛑 No try/catch. `createRouteHandler` maps a thrown `NotFoundError` to 404
 * and a `ValidationError` to a 400 carrying its field issues; catching here
 * would flatten both into one untyped 400 and throw the issues away.
 *
 * Returns: { ok: true, data: { orderId, dueBy } }
 */

import { withProviders } from "@/providers.config";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE, USER_ROLE } from "@/constants";
import { openBalanceCollection } from "@mohasinac/appkit/server";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_STORE_WRITE, USER_ROLE.EMPLOYEE],
    permission: "orders:write",
    handler: async ({ params }) => {
      const id = (params as { id: string }).id;
      const order = await openBalanceCollection(id);
      return successResponse({ orderId: id, dueBy: order.balance?.dueBy ?? null });
    },
  }),
);
