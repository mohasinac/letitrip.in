/**
 * Public Events API Route
 * GET /api/events — List active events (public, no auth required)
 */

import { NextRequest } from "next/server";
import { createApiHandler } from "@/lib/api/api-handler";
import { successResponse } from "@/lib/api-response";
import { eventRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@/lib/api/request-helpers";

export const GET = createApiHandler({
  auth: false,
  handler: async ({ request }: { request: NextRequest }) => {
    serverLogger.info("Public events list requested");

    const searchParams = getSearchParams(request);
    const page = getNumberParam(searchParams, "page", 1, { min: 1 });
    const pageSize = getNumberParam(searchParams, "pageSize", 24, {
      min: 1,
      max: 100,
    });
    const sorts = getStringParam(searchParams, "sorts") || "-startsAt";
    const q = getStringParam(searchParams, "q");

    // Build Sieve filters — always scope to published status, allow caller to
    // further filter by type/status via ?filters=
    const callerFilters = getStringParam(searchParams, "filters");
    const filterParts: string[] = ["status==active"];
    if (q) filterParts.push(`title@=*${q}`);
    if (callerFilters) filterParts.push(callerFilters);
    const filters = filterParts.join(",");

    const result = await eventRepository.list({
      filters,
      sorts,
      page,
      pageSize,
    });

    // Strip internal/admin fields before returning
    const publicItems = result.items.map(({ createdBy: _cb, ...evt }) => evt);

    return successResponse({
      items: publicItems,
      total: result.total,
      page: result.page,
      pageSize: result.pageSize,
      totalPages: result.totalPages,
      hasMore: result.hasMore,
    });
  },
});
