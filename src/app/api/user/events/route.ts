import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  eventEntryRepository,
  eventRepository,
  sortBy,
  EVENT_ENTRY_FIELDS,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));

      const result = await eventEntryRepository.listForUser(user!.uid, {
        page: String(page),
        pageSize: String(pageSize),
        sorts: sortBy(EVENT_ENTRY_FIELDS.SUBMITTED_AT, "DESC"),
      });

      const eventIds = [...new Set(result.items.map((e) => e.eventId))];
      const events = eventIds.length
        ? await Promise.all(eventIds.map((id) => eventRepository.findById(id).catch(() => null)))
        : [];

      const eventMap = Object.fromEntries(
        events.filter(Boolean).map((e) => [e!.id, e!]),
      );

      const items = result.items.map((entry) => ({
        ...entry,
        event: eventMap[entry.eventId] ?? null,
      }));

      return successResponse({
        items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
      });
    },
  }),
);
