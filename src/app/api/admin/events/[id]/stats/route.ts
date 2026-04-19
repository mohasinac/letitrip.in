import "@/providers.config";
/**
 * Admin Event Stats API Route
 * GET /api/admin/events/:id/stats — Get statistics for an event
 */

import { successResponse } from "@mohasinac/appkit/server";
import { eventRepository, eventEntryRepository } from "@mohasinac/appkit/server";
import { serverLogger } from "@mohasinac/appkit/server";
import { ERROR_MESSAGES } from "@mohasinac/appkit/server";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(
  _request: Request,
  context: RouteContext,
): Promise<Response> {
  const { id: eventId } = await context.params;

  serverLogger.info("Admin fetching event stats", { eventId });

  const events = await eventRepository.list({ filters: `id==${eventId}`, page: "1", pageSize: "1" });
  const event = events.items[0];
  if (!event) {
    return Response.json(
      { success: false, error: ERROR_MESSAGES.GENERIC.NOT_FOUND },
      { status: 404 },
    );
  }

  const [totalEntries, approvedEntries, flaggedEntries] = await Promise.all([
    eventEntryRepository.listForEvent(eventId, { page: 1, pageSize: 1 }),
    eventEntryRepository.listForEvent(eventId, { page: 1, pageSize: 1, filters: "reviewStatus==approved" }),
    eventEntryRepository.listForEvent(eventId, { page: 1, pageSize: 1, filters: "reviewStatus==flagged" }),
  ]);

  return Response.json(successResponse({
    event,
    stats: {
      totalEntries: totalEntries.total ?? 0,
      approvedEntries: approvedEntries.total ?? 0,
      flaggedEntries: flaggedEntries.total ?? 0,
    },
  }));
}
