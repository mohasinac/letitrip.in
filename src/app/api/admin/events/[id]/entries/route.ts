/**
 * Admin Event Entries API Route
 * GET /api/admin/events/[id]/entries — Paginated entry list with review-status filter
 */

import { createApiHandler as createRouteHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";
import { eventRepository, eventEntryRepository } from "@/repositories";
import { ERROR_MESSAGES } from "@/constants";
import { NotFoundError } from "@mohasinac/appkit/errors";
import { serverLogger } from "@/lib/server-logger";
import type { SieveModel } from "@/lib/query/firebase-sieve";

export const GET = createRouteHandler<never, { id: string }>({
  auth: true,
  roles: ["admin", "moderator"],
  handler: async ({ request, params }) => {
    const id = params!.id;

    const event = await eventRepository.findById(id);
    if (!event) throw new NotFoundError(ERROR_MESSAGES.EVENT.NOT_FOUND);

    const searchParams = getSearchParams(request);
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 25, {
      min: 1,
      max: 100,
    });
    const sorts = getStringParam(searchParams, "sorts") || "-submittedAt";
    const reviewStatus = getStringParam(searchParams, "reviewStatus");

    const filtersArr: string[] = [];
    if (reviewStatus) filtersArr.push(`reviewStatus==${reviewStatus}`);
    const rawFilters = getStringParam(searchParams, "filters");
    if (rawFilters) filtersArr.push(rawFilters);

    const model: SieveModel = {
      filters: filtersArr.join(",") || undefined,
      sorts,
      page,
      pageSize,
    };

    serverLogger.info("Admin event entries list requested", {
      eventId: id,
      model,
    });

    const result = await eventEntryRepository.listForEvent(id, model);

    return successResponse({
      items: result.items,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
      event,
    });
  },
});
