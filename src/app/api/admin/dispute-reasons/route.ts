/**
 * GET /api/admin/dispute-reasons — the staff management list.
 *
 * ## 🛑 Why this is a SECOND route and not a widened `/api/dispute-reasons`
 *
 * The public GET requires `kind` and returns only ACTIVE rows, and both are
 * load-bearing rather than incidental. Its own comment explains the first at
 * length: a buyer reporting a damaged item must never be offered "it never
 * arrived", because that reason belongs to the other gate and picking it
 * produces a dispute the action then refuses — *"returning every reason when
 * the caller forgets the param is precisely how that happens"*.
 *
 * A management view needs the opposite of both: every kind at once, retired
 * rows included, because a reason retired under the wrong gate is exactly the
 * row staff are looking for. Making `kind` optional to serve it would reopen
 * the hazard that comment forbids for every buyer, to save one file.
 *
 * So: two routes, two audiences, neither able to answer the other's question.
 */

import { withProviders } from "@/providers.config";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { disputeReasonsRepository } from "@mohasinac/appkit/features/dispute-reasons/repository/dispute-reasons.repository";
import { DISPUTE_REASON_FIELDS } from "@mohasinac/appkit/features/dispute-reasons/schemas/firestore";
/*
 * 🛑 `sortBy` from its DEFINING module, not `@mohasinac/appkit/client`. This is
 * a route handler, so a binding from the `"use client"` entry would be a
 * client-reference proxy and CALLING it throws during the server render as an
 * opaque React #441 (Root Cause #76).
 */
import { sortBy } from "@mohasinac/appkit/constants/sort";
/*
 * 🛑 From `@/constants/api-roles`, the DEFINING module — never the `@/constants`
 * barrel, which re-exports `navigation.tsx` and so pulls appkit's `"use client"`
 * entry into a SERVER graph, instantiating a second appkit whose provider
 * registry is empty. The route then answers 401 to every valid session. See the
 * long note on the sibling public route.
 */
import { ROLES_BACK_OFFICE } from "@/constants/api-roles";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_BACK_OFFICE],
    /*
     * The same permission the create path uses, for the same reason: whoever
     * triages tickets is who curates the reasons a ticket keeps arriving
     * about. A permission with one route behind it is a role in disguise.
     */
    permission: "admin:support-tickets:write",
    handler: async ({ request }) => {
      const searchParams = getSearchParams(request);

      /*
       * 🛑 NOT delegated to the listing Function, and the audit's prescribed
       * `executor: listingProcessorFirstExecutor` would make this WORSE.
       * Measured against `listingProcessor.ts`'s `LISTERS` map:
       * `disputeReasons` is not one of its registered collections, so an
       * unregistered collection hits `if (!lister) throw new ListingError(400,
       * …)` and the executor's fallback then runs this same local query
       * anyway — a guaranteed-failing network round trip per request to
       * execute the identical read.
       *
       * Same class and same conclusion as `/api/admin/inventory/boxes`: it
       * needs a lister in the Function first, which needs a Functions deploy
       * before it can be tested at all. Eleven rows, staff-only, so the
       * 10s-ceiling argument is weak until that happens.
       */
      // audit-listing-delegation-ok: no `disputeReasons` lister exists in the Function; delegating would 400 and fall back on every request
      const result = await disputeReasonsRepository.listAll({
        page: Number(getStringParam(searchParams, "page") ?? 1) || 1,
        /*
         * Clamped to 50 per Rule #6, and clamped rather than rejected because
         * the caller is this app's own listing view — a 400 on a URL a user
         * can edit would be a dead page where a bounded list is correct.
         */
        pageSize: Math.min(
          50,
          Math.max(1, Number(getStringParam(searchParams, "pageSize")) || 20),
        ),
        /*
         * `filters` is forwarded verbatim so the view's Active / Retired / All
         * chips are ordinary Sieve clauses on `isActive`. `listAll` applies no
         * `isActive` filter of its own, which is what makes that work without
         * a parameter per chip.
         */
        filters: getStringParam(searchParams, "filters") ?? undefined,
        sorts: getStringParam(searchParams, "sorts") ?? sortBy(DISPUTE_REASON_FIELDS.LABEL),
      });

      return successResponse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
      });
    },
  }),
);
