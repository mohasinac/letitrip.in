import { withProviders } from "@/providers.config";
/**
 * Admin Newsletter API Route
 * GET /api/admin/newsletter — List subscribers with stats
 */

import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { getNumberParam, getSearchParams, getStringParam } from "@mohasinac/appkit/next/request-helpers";
import { newsletterRepository } from "@mohasinac/appkit/core/newsletter.repository";
import { serverLogger } from "@mohasinac/appkit/monitoring/server-logger";
import { COMMON_FIELDS } from "@mohasinac/appkit/constants/field-names";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { NEWSLETTER_SUBSCRIBER_FIELDS } from "@mohasinac/appkit/core/newsletter.repository";
import { ROLES_ADMIN_ONLY } from "@/constants";

const DEFAULT_SORTS = sortBy(COMMON_FIELDS.CREATED_AT);

/**
 * GET /api/admin/newsletter
 *
 * Query params:
 *  - filters  (string) — Sieve filters (e.g. status==active)
 *  - sorts    (string) — Sieve sorts (e.g. -createdAt)
 *  - page     (number) — page number (default 1)
 *  - pageSize (number) — results per page (default 50, max 200)
 *
 * meta.total / active / unsubscribed are always computed from the
 * full unfiltered dataset so stat cards remain accurate.
 */
export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_ADMIN_ONLY],
  permission: "admin:newsletter:read",
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 50,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || DEFAULT_SORTS;

    serverLogger.info("Admin newsletter subscribers list requested", {
      filters,
      sorts,
      page,
      pageSize,
    });

    // Compute summary counts + paginated results in parallel
    const [totalResult, activeResult, unsubscribedResult, sieveResult] =
      await Promise.all([
        newsletterRepository.list({
          sorts: sortBy(COMMON_FIELDS.CREATED_AT, "ASC"),
          page: "1",
          pageSize: "1",
        }),
        newsletterRepository.list({
          filters: `${NEWSLETTER_SUBSCRIBER_FIELDS.STATUS}==${NEWSLETTER_SUBSCRIBER_FIELDS.STATUS_VALUES.ACTIVE}`,
          sorts: sortBy(COMMON_FIELDS.CREATED_AT, "ASC"),
          page: "1",
          pageSize: "1",
        }),
        newsletterRepository.list({
          filters: `${NEWSLETTER_SUBSCRIBER_FIELDS.STATUS}==${NEWSLETTER_SUBSCRIBER_FIELDS.STATUS_VALUES.UNSUBSCRIBED}`,
          sorts: sortBy(COMMON_FIELDS.CREATED_AT, "ASC"),
          page: "1",
          pageSize: "1",
        }),
        newsletterRepository.list({
          filters,
          sorts,
          page: String(page),
          pageSize: String(pageSize),
        }),
      ]);

    /*
     * 🛑 `items`, named explicitly.
     *
     * This was `...sieveResult`, which spreads a `PagedResult` — whose array is
     * `data`, not `items` — while `AdminNewsletterView` read
     * `response.subscribers`. Neither name matched, so the admin newsletter
     * list rendered EMPTY with a 200 and nothing anywhere said why. That is
     * exactly the failure `audit-list-envelope`'s header predicts for a
     * half-finished rename, and it was sitting in the ratchet as pending work.
     */
    return successResponse({
      items: sieveResult.data,
      total: sieveResult.total,
      page: sieveResult.page,
      pageSize: sieveResult.pageSize,
      totalPages: sieveResult.totalPages,
      meta: {
        total: totalResult.total,
        active: activeResult.total,
        unsubscribed: unsubscribedResult.total,
      },
    });
  },
}));

