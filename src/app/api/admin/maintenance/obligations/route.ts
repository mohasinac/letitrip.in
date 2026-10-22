import { withProviders } from "@/providers.config";
/**
 * Admin Obligations API — every deadline in the order lifecycle.
 *
 * `GET /api/admin/maintenance/obligations?window=overdue|upcoming`
 *
 * ## 🛑 Two named queries, NOT a Sieve surface
 *
 * `ObligationsRepository` declares no `SIEVE_FIELDS`, on its own stated
 * reasoning: the sweep uses exactly one query shape, and declaring a filterable
 * surface nothing calls is the speculative-infra pattern this codebase already
 * paid for once (`route-schema-registry` — 576 keys into a layer with no
 * readers). Nothing here changes that premise, because an operator looking at
 * deadlines wants the ORDER, not a filter: *what is overdue*, and *what is
 * about to be*.
 *
 * Both of those are already indexed and already written —
 * `listDue(now, limit)` and `listUpcoming(horizon, now, limit)` back the sweep
 * itself, so this page reads the same two queries the engine runs on and cannot
 * disagree with it about what is due.
 *
 * ## 🛑 It is READ-ONLY, deliberately
 *
 * An obligation is a due-date INDEX, not truth. The sweep re-reads the subject
 * and re-evaluates the policy's `precondition` before acting, which is what
 * keeps the collection from becoming a stored mirror of derived state (Root
 * Cause #42). An admin editing a row here would be editing the index — the
 * order would still say what it says, the next tick would still decide from the
 * order, and the edit would read as having done something while changing
 * nothing. Acting early belongs on the SUBJECT: cancel the order, approve the
 * return, confirm the delivery.
 */
import { obligationsRepository } from "@mohasinac/appkit/features/obligations/repository/obligations.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/next/request-helpers";
import { ROLES_BACK_OFFICE } from "@/constants";

/** How far ahead "upcoming" looks. Seven days covers every policy window. */
const UPCOMING_HORIZON_DAYS = 7;

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    /*
     * 🛑 ROLES_BACK_OFFICE (admin + employee), not ROLES_ANY_STAFF.
     *
     * A `permission` alongside a roles array is only resolvable for admin and
     * employee — `getServerPermissions` returns `{permissions: []}` for every
     * other role — so moderator, SELLER and TESTER were listed here and
     * guaranteed a 403. ROLES_ANY_STAFF own comment says "rare; usually means
     * a leak", and a seller reading the payment-gateway event log is exactly
     * that. Narrowed to the roles the gate can actually admit.
     */
    roles: [...ROLES_BACK_OFFICE],
    permission: "admin:maintenance:view-obligations",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const window = getStringParam(searchParams, "window") === "upcoming" ? "upcoming" : "overdue";
      const limit = getNumberParam(searchParams, "limit", 100, { min: 1, max: 200 });
      const now = new Date();

      const items =
        window === "upcoming"
          ? await obligationsRepository().listUpcoming(
              new Date(now.getTime() + UPCOMING_HORIZON_DAYS * 86_400_000),
              now,
              limit,
            )
          : await obligationsRepository().listDue(now, limit);

      return successResponse({
        items,
        meta: {
          window,
          total: items.length,
          /*
           * `truncated` is not optional on a bounded fetch. "100 overdue
           * obligations" and "at least 100 overdue obligations" read
           * identically, and the second is the one that means the sweep is
           * behind.
           */
          truncated: items.length === limit,
          ...(window === "upcoming" ? { horizonDays: UPCOMING_HORIZON_DAYS } : {}),
        },
      });
    },
  }),
);
