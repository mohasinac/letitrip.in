import { withProviders } from "@/providers.config";
import { EVENT_FIELDS } from "@/constants";
import {
  eventRepository,
  eventEntryRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
  sieveFilter,
  SIEVE_OP,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    permission: "admin:events:read",
    handler: async ({ params }) => {
      const eventId = (params as { id: string }).id;
      const events = await eventRepository.list({ filters: sieveFilter(EVENT_FIELDS.ID, SIEVE_OP.EQ, eventId), page: "1", pageSize: "1" });
      const event = events.items[0];
      if (!event) return errorResponse("Event not found", 404);

      const [totalEntries, approvedEntries, flaggedEntries] = await Promise.all([
        eventEntryRepository.listForEvent(eventId, { page: 1, pageSize: 1 }),
        eventEntryRepository.listForEvent(eventId, { page: 1, pageSize: 1, filters: sieveFilter("reviewStatus", SIEVE_OP.EQ, "approved") }),
        eventEntryRepository.listForEvent(eventId, { page: 1, pageSize: 1, filters: sieveFilter("reviewStatus", SIEVE_OP.EQ, "flagged") }),
      ]);

      return successResponse({
        event,
        stats: {
          totalEntries: totalEntries.total ?? 0,
          approvedEntries: approvedEntries.total ?? 0,
          flaggedEntries: flaggedEntries.total ?? 0,
        },
      });
    },
  }),
);
