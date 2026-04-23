import { withProviders } from "@/providers.config";
/**
 * Admin Event Entries API Route
 * GET /api/admin/events/:id/entries — List entries for an event
 */

import { successResponse } from "@mohasinac/appkit";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit";
import { eventEntryRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id: eventId } = await context.params;
  const searchParams = getSearchParams(request);
  const page = getNumberParam(searchParams, "page", 1, { min: 1 });
  const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 200 });
  const reviewStatus = getStringParam(searchParams, "reviewStatus");
  const q = (getStringParam(searchParams, "q") || "").trim().toLowerCase();

  serverLogger.info("Admin listing event entries", {
    eventId,
    page,
    pageSize,
    reviewStatus,
    q,
  });

  const result = await eventEntryRepository.listForEvent(eventId, {
    page,
    pageSize,
    filters:
      reviewStatus && reviewStatus !== "all"
        ? `reviewStatus==${reviewStatus}`
        : undefined,
  });

  if (!q) {
    return Response.json(successResponse(result));
  }

  const filtered = result.items.filter((entry) => {
    const displayName = (entry.userDisplayName || "").toLowerCase();
    const email = (entry.userEmail || "").toLowerCase();
    const userId = (entry.userId || "").toLowerCase();
    const entryId = (entry.id || "").toLowerCase();
    return (
      displayName.includes(q) ||
      email.includes(q) ||
      userId.includes(q) ||
      entryId.includes(q)
    );
  });

  return Response.json(successResponse({
    ...result,
    items: filtered,
    total: filtered.length,
    totalPages: 1,
    hasMore: false,
  }));
}
