import { withProviders } from "@/providers.config";
/**
 * Admin Protection Claims API — list.
 *
 * `GET /api/admin/protection-claims` — open claims against shipment and sale
 * cover, worst-waiting first.
 *
 * ## 🛑 `listActive()`, NOT a Sieve `list()`, and that is deliberate
 *
 * `ProtectionClaimsRepository` declares no `SIEVE_FIELDS`. Adding one to serve
 * a filter drawer here would be the speculative-infra pattern this codebase has
 * already paid for once — `route-schema-registry`, 576 keys into a layer with
 * no readers. The queue is small by construction (a claim is one buyer, one
 * order, one window) and `listActive` answers the only question an operator
 * has: what is waiting on me.
 *
 * So the status filter is applied CLIENT-side over the returned rows, which is
 * honest at this size and costs no index. If the queue ever outgrows that, the
 * fix is a real Sieve surface with real indexes, not a bigger `limit`.
 */
import { protectionClaimsRepository } from "@mohasinac/appkit/features/protection-claims/repository/protection-claims.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getNumberParam, getSearchParams } from "@mohasinac/appkit/next/request-helpers";
import { ROLES_ADMIN_MOD } from "@/constants";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    /*
     * ADMIN_MOD, not ADMIN_ONLY: `adjudicateProtectionClaimAction` itself
     * accepts `["admin", "moderator"]`, and a moderator who can decide a claim
     * must be able to see the queue of them. The permission gate is the
     * narrower control and it is declared on the route below.
     */
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:protection-claims:read",
    handler: async ({ request }) => {
      const limit = getNumberParam(getSearchParams(request), "limit", 100, {
        min: 1,
        max: 200,
      });
      const items = await protectionClaimsRepository().listActive(limit);
      return successResponse({
        items,
        meta: {
          total: items.length,
          /*
           * `truncated` is not optional. A bounded fetch that saturates its
           * limit must say so, or "100 claims" and "at least 100 claims" read
           * identically — and the second is the one that matters when somebody
           * is deciding whether the queue is under control.
           */
          truncated: items.length === limit,
        },
      });
    },
  }),
);
