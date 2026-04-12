import "@/providers.config";
/**
 * Admin Newsletter API Route
 * GET /api/admin/newsletter — List subscribers with stats
 */

import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@mohasinac/appkit/next";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/next";
import { newsletterRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import { NEWSLETTER_SUBSCRIBER_FIELDS } from "@/db/schema";

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
export const GET = createRouteHandler({
  auth: true,
  roles: ["admin"],
  handler: async ({ request }) => {
    const searchParams = getSearchParams(request);

    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 50, {
      min: 1,
      max: 200,
    });
    const filters = getStringParam(searchParams, "filters");
    const sorts = getStringParam(searchParams, "sorts") || "-createdAt";

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
          sorts: "createdAt",
          page: "1",
          pageSize: "1",
        }),
        newsletterRepository.list({
          filters: `${NEWSLETTER_SUBSCRIBER_FIELDS.STATUS}==${NEWSLETTER_SUBSCRIBER_FIELDS.STATUS_VALUES.ACTIVE}`,
          sorts: "createdAt",
          page: "1",
          pageSize: "1",
        }),
        newsletterRepository.list({
          filters: `${NEWSLETTER_SUBSCRIBER_FIELDS.STATUS}==${NEWSLETTER_SUBSCRIBER_FIELDS.STATUS_VALUES.UNSUBSCRIBED}`,
          sorts: "createdAt",
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

    return successResponse({
      ...sieveResult,
      meta: {
        total: totalResult.total,
        active: activeResult.total,
        unsubscribed: unsubscribedResult.total,
      },
    });
  },
});
