import { withProviders } from "@/providers.config";
import {
  eventRepository,
  eventEntryRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    handler: async ({ params }) => {
      const eventId = (params as { id: string }).id;
      const events = await eventRepository.list({ filters: `id==${eventId}`, page: "1", pageSize: "1" });
      const event = events.items[0];
      if (!event) return errorResponse("Event not found", 404);

      const [totalEntries, approvedEntries, flaggedEntries] = await Promise.all([
        eventEntryRepository.listForEvent(eventId, { page: 1, pageSize: 1 }),
        eventEntryRepository.listForEvent(eventId, { page: 1, pageSize: 1, filters: "reviewStatus==approved" }),
        eventEntryRepository.listForEvent(eventId, { page: 1, pageSize: 1, filters: "reviewStatus==flagged" }),
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
