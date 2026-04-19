import "@/providers.config";
/**
 * Admin Event Entries API Route
 * GET /api/admin/events/:id/entries — List entries for an event
 */

import { successResponse } from "@mohasinac/appkit/server";
import {
  getNumberParam,
  getSearchParams,
  getStringParam,
} from "@mohasinac/appkit/server";
import { eventEntryRepository } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id: eventId } = await context.params;
  const searchParams = getSearchParams(request);
  const page = getNumberParam(searchParams, "page", 1, { min: 1 });
  const pageSize = getNumberParam(searchParams, "pageSize", 50, { min: 1, max: 200 });

  serverLogger.info("Admin listing event entries", { eventId, page, pageSize });

  const result = await eventEntryRepository.listForEvent(eventId, { page, pageSize });
  return Response.json(successResponse(result));
}
