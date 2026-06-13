/**
 * GET    /api/user/history — list current user's recently-viewed items
 * POST   /api/user/history — track a visit (upsert + re-visit hoist + FIFO 50)
 * DELETE /api/user/history — clear all history for the current user
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  trackHistoryView,
  getHistoryForUser,
  clearHistory,
  HISTORY_MAX,
} from "@mohasinac/appkit";
import { z } from "zod";

const trackSchema = z.object({
  productId: z.string().min(1),
  productType: z.enum(["product", "auction", "preorder"]),
  snapshot: z
    .object({
      title: z.string().optional(),
      thumb: z.string().optional(),
      price: z.number().optional(),
      storeId: z.string().optional(),
      storeName: z.string().optional(),
    })
    .optional(),
});

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const { items, meta } = await getHistoryForUser(user!.uid);
      return successResponse({
        items,
        meta: { ...meta, limit: HISTORY_MAX },
      });
    },
  }),
);

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const POST = withProviders(
  createRouteHandler<(typeof trackSchema)["_output"]>({
    auth: true,
    schema: trackSchema,
    handler: async ({ user, body }) => {
      const { productId, productType, snapshot } = body!;
      const { count } = await trackHistoryView(user!.uid, {
        productId,
        productType,
        snapshot,
      });
      return successResponse({ productId, count, limit: HISTORY_MAX });
    },
  }),
);

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const DELETE = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      await clearHistory(user!.uid);
      return successResponse({ cleared: true });
    },
  }),
);
