/**
 * DELETE /api/user/history/[productId] — remove a single item from history
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  removeHistoryItem,
} from "@mohasinac/appkit";

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
