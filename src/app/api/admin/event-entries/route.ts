import { withProviders } from "@/providers.config";
import {
  eventEntryRepository,
  createRouteHandler,
  successResponse,
} from "@mohasinac/appkit";

/**
 * GET /api/admin/event-entries — list all event entries (admin).
 * W1-42: switched from eventEntryRepository.findAll(limit) to .list() with
 * Sieve filters (eventId, userId, reviewStatus, submittedAt) so the admin
 * filter UI actually narrows results.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    permission: "admin:event-entries:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const result = await eventEntryRepository.list({
        filters: url.searchParams.get("filters") ?? undefined,
        sorts: url.searchParams.get("sorts") ?? "-submittedAt",
        page: url.searchParams.get("page") ?? 1,
        pageSize: url.searchParams.get("pageSize") ?? 25,
      });
      return successResponse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
    },
  }),
);
