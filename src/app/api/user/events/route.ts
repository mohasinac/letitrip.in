import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  eventEntryRepository,
  eventRepository,
  sortBy,
  EVENT_ENTRY_FIELDS,
} from "@mohasinac/appkit";
import { safeRead } from "@mohasinac/appkit/server";

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
        ? await Promise.all(
            // Hydration only — the entry rows are the subject and each renders
            // with `event: null` when its parent event cannot be resolved.
            eventIds.map((id) =>
              safeRead(() => eventRepository.findById(id), {
                route: "/user/events",
                key: "events.findById",
                fallback: null,
              }),
            ),
          )
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