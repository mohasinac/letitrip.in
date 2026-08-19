import { withFeatureGuard } from "@/lib/features";
import { withProviders } from "@/providers.config";
import { ROLES_ADMIN_MOD } from "@/constants";
import {
  eventRepository,
  eventEntryRepository,
  createRouteHandler,
  errorResponse,
} from "@mohasinac/appkit";

/**
 * Markdown export of an event's entries — "Download Report" button on
 * AdminEventEntriesView. Mirrors the read-only RBAC shape of the sibling
 * GET /api/admin/events/[id] and /stats routes (roles-only, no separate
 * permission string, wrapped by the EVENTS feature guard).
 */
const __GET__g = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ params }) => {
      const eventId = (params as { id: string }).id;
      const event = await eventRepository.findById(eventId);
      if (!event) return errorResponse("Event not found", 404);

      const markdown = await eventEntryRepository.getExportReport(eventId, {
        title: event.title,
        type: event.type,
        pollOptions: event.pollConfig?.options,
      });
      const date = new Date().toISOString().slice(0, 10);

      return new Response(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition": `attachment; filename="event-entries-${eventId}-${date}.md"`,
        },
      }) as unknown as ReturnType<typeof Response.json>;
    },
  }),
);

export const GET = withFeatureGuard("EVENTS", __GET__g);
