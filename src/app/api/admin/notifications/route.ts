import { withProviders } from "@/providers.config";
import {
  notificationRepository,
  createRouteHandler,
  successResponse,
  sortBy,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_MOD } from "@/constants";

/**
 * GET /api/admin/notifications — list all notifications.
 * W1-42: switched from notificationRepository.findAll(limit) (which ignored the
 * filter UI) to .list() with Sieve filters/sorts/page/pageSize from URL params.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_MOD],
    handler: async ({ request }) => {
      const url = new URL(request.url);
      // The toolbar search box emitted `q` and this handler never read it, so it
      // was inert. `q` is treated as an exact userId lookup: `title` is not in
      // NotificationRepository.SIEVE_FIELDS, and Sieve→Firestore cannot OR across
      // two different fields (see the incompatibility notes in
      // providers/db-firebase/sieve.ts), so a combined title-or-user search is not
      // expressible here. The placeholder was corrected to match.
      const q = (url.searchParams.get("q") || "").trim();
      const rawFilters = url.searchParams.get("filters") ?? undefined;
      const effectiveFilters =
        [rawFilters, q ? `userId==${q}` : null].filter(Boolean).join(",") || undefined;

      const result = await notificationRepository.list({
        filters: effectiveFilters,
        sorts: url.searchParams.get("sorts") ?? sortBy("createdAt"),
        page: url.searchParams.get("page") ?? 1,
        pageSize: String(Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 25))),
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
