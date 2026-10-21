import { withProviders } from "@/providers.config";
import { sortBy } from "@mohasinac/appkit/constants/sort";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { eventEntryRepository } from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

/**
 * GET /api/admin/event-entries — list all event entries (admin).
 * W1-42: switched from eventEntryRepository.findAll(limit) to .list() with
 * Sieve filters (eventId, userId, reviewStatus, submittedAt) so the admin
 * filter UI actually narrows results.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const result = await eventEntryRepository.list({
        filters: url.searchParams.get("filters") ?? undefined,
        sorts: url.searchParams.get("sorts") ?? sortBy("submittedAt"),
        page: url.searchParams.get("page") ?? 1,
        pageSize: String(Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 25))),
      });
      /*
       * 🛑 Masked before returning. `userEmail` is an `EVENT_ENTRY_PII_FIELD`
       * and `mapDoc` no longer decrypts, so the raw rows carried `enc:v1:…`
       * into `/admin/event-entries` (1 visible occurrence measured live).
       * Masked rather than revealed: this is an admin list.
       */
      return successResponse({
        items: eventEntryRepository.maskedEntrys(
          result.items as Parameters<typeof eventEntryRepository.maskedEntrys>[0],
        ),
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      });
    },
  }),
);
