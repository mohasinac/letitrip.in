/**
 * DELETE /api/user/history/[productId] — remove a single item from history
 */
import { withProviders } from "@/providers.config";
import { removeHistoryItem } from "@mohasinac/appkit/features/history/actions/history-actions";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";

export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user, params }) => {
      const productId = (params as { productId: string }).productId;
      await removeHistoryItem(user!.uid, productId);
      return successResponse({ productId, removed: true });
    },
  }),
);
