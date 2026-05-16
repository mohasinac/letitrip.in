import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  notificationRepository,
  sortBy,
  NOTIFICATION_FIELDS,
} from "@mohasinac/appkit";

const DEFAULT_SORTS = sortBy(NOTIFICATION_FIELDS.CREATED_AT);

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
      // Accept generic sieve `?filters=` param (used by all other listing endpoints)
      // and fall back to the dedicated `?isRead=` / `?type=` convenience params.
      const filtersParam = url.searchParams.get("filters");
      const isRead = url.searchParams.get("isRead");
      const type = url.searchParams.get("type");
      const sorts = url.searchParams.get("sorts") || DEFAULT_SORTS;

      let resolvedFilters: string | undefined;
      if (filtersParam) {
        resolvedFilters = filtersParam;
      } else {
        const parts: string[] = [];
        if (isRead === "true" || isRead === "false") parts.push(`isRead==${isRead}`);
        if (type) parts.push(`type==${type}`);
        resolvedFilters = parts.length ? parts.join(",") : undefined;
      }

      const result = await notificationRepository.listForUser(user!.uid, {
        filters: resolvedFilters,
        sorts,
        page: String(page),
        pageSize: String(pageSize),
      });

      const unreadCount = await notificationRepository.getUnreadCount(user!.uid);

      return successResponse({
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasMore: result.hasMore,
        unreadCount,
      });
    },
  }),
);
