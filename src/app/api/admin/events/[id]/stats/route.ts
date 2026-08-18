import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import {
  ROLES_ADMIN_MOD,
} from "@/constants";
import {
  eventRepository,
  eventEntryRepository,
  createRouteHandler,
  successResponse,
  errorResponse,
  sieveFilter,
  SIEVE_OP,
} from "@mohasinac/appkit";

const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    permission: "admin:events:read",
    handler: async ({ params }) => {
      const eventId = (params as { id: string }).id;
      const event = await eventRepository.findById(eventId);
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

export const GET = withFeatureGuard("EVENTS", __GET__g);
