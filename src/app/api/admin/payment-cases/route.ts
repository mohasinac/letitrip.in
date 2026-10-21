import { withProviders } from "@/providers.config";
/**
 * Admin Money Cases API — list.
 *
 * `GET /api/admin/payment-cases` — the operator queue for everything where
 * money is at risk. Read-only here; cases are opened exclusively by
 * `openOrObserve` from the reconcilers, the obligation sweep, the dispute
 * ingest, the protection-claim and grievance paths. There is deliberately no
 * POST: a human-authored case has no dedupe key and nothing to reconcile it
 * against, so it would be a note pretending to be a detection.
 *
 * 🛑 NOT under `/api/admin/maintenance/`, and `ROLES_ADMIN_ONLY` rather than
 * `ROLES_ADMIN_MOD`. A case can carry a gateway's own `respond_by` and a real
 * `amountAtRisk`; the maintenance surfaces are diagnostics with no external
 * clock. See the `admin:payment-cases:*` note in the permission union.
 *
 * 🛑 NO `q` HANDLING, and that is the decision rather than an omission.
 * `AdminMoneyCasesView` declares no `searchPlaceholder`, so no box renders.
 * `title` and `detail` are prose assembled by the opener, there is no search
 * index over them, and `@=` is prefix-only against Firestore — so a box here
 * could only ever have been one of the ~39 that accept a term and change
 * nothing. If search is wanted later it needs a real index first, not a
 * placeholder.
 */
import { paymentCasesRepository } from "@mohasinac/appkit/features/payment-cases/repository/payment-cases.repository";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/next/request-helpers";
import { ROLES_ADMIN_ONLY } from "@/constants";

/*
 * `lastObservedAt` DESC, matching the view's own default.
 *
 * 🛑 NOT `dueAt`. That field is optional and most cases have none — only a
 * dispute and a grievance carry an external clock — and a Firestore `orderBy`
 * EXCLUDES every document lacking the ordering field (Root Cause #100). A
 * deadline-ordered default would therefore hide the majority of the queue while
 * looking like it had merely sorted it. `openOrObserve` writes
 * `lastObservedAt` on every case every time, so it is always present.
 */
const DEFAULT_SORTS = "-lastObservedAt";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "admin:payment-cases:read",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);
      const page = getNumberParam(searchParams, "page", 1, { min: 1 });
      const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 50 });
      const filters = getStringParam(searchParams, "filters");
      const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;

      const result = await paymentCasesRepository().list({
        ...(filters ? { filters } : {}),
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });

      return successResponse({
        items: result.items,
        meta: {
          total: result.total,
          page: result.page,
          pageSize: result.pageSize,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        },
      });
    },
  }),
);
