import { withProviders } from "@/providers.config";
import {
  notificationRepository,
  createRouteHandler,
  successResponse,
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
    permission: "admin:notifications:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const result = await notificationRepository.list({
        filters: url.searchParams.get("filters") ?? undefined,
        sorts: url.searchParams.get("sorts") ?? "-createdAt",
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
