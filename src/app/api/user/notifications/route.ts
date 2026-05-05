import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  notificationRepository,
} from "@mohasinac/appkit";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, request }) => {
      const url = new URL(request.url);
      const page = Math.max(1, Number(url.searchParams.get("page")) || 1);
      const pageSize = Math.min(50, Math.max(1, Number(url.searchParams.get("pageSize")) || 20));
      const isRead = url.searchParams.get("isRead");
      const type = url.searchParams.get("type");
      const sorts = url.searchParams.get("sorts") || "-createdAt";

      const filters: string[] = [];
      if (isRead === "true" || isRead === "false") filters.push(`isRead==${isRead}`);
      if (type) filters.push(`type==${type}`);

      const result = await notificationRepository.listForUser(user!.uid, {
        filters: filters.length ? filters.join(",") : undefined,
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
