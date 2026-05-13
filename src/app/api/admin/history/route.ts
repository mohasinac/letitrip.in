import { withProviders } from "@/providers.config";
import { historyRepository } from "@mohasinac/appkit";
import {
  createRouteHandler,
  successResponse,
  HISTORY_MAX,
} from "@mohasinac/appkit";

/**
 * GET /api/admin/history — one row per user with item count + last visit.
 * Backed by `historyRepository.findAllSummaries()` (top-level `history/` docs).
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: ["admin", "moderator"],
    permission: "admin:sessions:read",
    handler: async ({ request }) => {
      const url = new URL(request.url);
      const limit = Math.min(Number(url.searchParams.get("limit") ?? "200"), 500);
      const summaries = await historyRepository.findAllSummaries();
      const sorted = summaries
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(0, limit)
        .map((s) => ({
          id: `history-${s.userId}`,
          userId: s.userId,
          itemCount: s.itemCount,
          limit: HISTORY_MAX,
          updatedAt: s.updatedAt.toISOString(),
        }));
      return successResponse({ items: sorted, total: sorted.length });
    },
  }),
);
