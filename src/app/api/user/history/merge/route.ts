/**
 * POST /api/user/history/merge — batch-merge guest localStorage history into Firestore.
 * Called on the null→uid transition (useHistoryMergeOnLogin).
 */
import { withProviders } from "@/providers.config";
import {
  createRouteHandler,
  successResponse,
  mergeGuestHistory,
  HISTORY_MAX,
  serverLogger,
} from "@mohasinac/appkit";
import { z } from "zod";

const mergeSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        productType: z.enum(["product", "auction", "preorder"]),
        viewedAt: z.string().optional(),
        productSnapshot: z
          .object({
            title: z.string().optional(),
            thumb: z.string().optional(),
            price: z.number().optional(),
            storeId: z.string().optional(),
            storeName: z.string().optional(),
          })
          .optional(),
      }),
    )
    .max(HISTORY_MAX * 4),
});

// rbac-scope-enforced-in-handler: user section — handler scopes queries by actor uid
export const POST = withProviders(
  createRouteHandler<(typeof mergeSchema)["_output"]>({
    auth: true,
    schema: mergeSchema,
    handler: async ({ user, body }) => {
      const { items } = body!;
      const { count } = await mergeGuestHistory(
        user!.uid,
        items.map((i) => ({
          productId: i.productId,
          productType: i.productType,
          viewedAt: i.viewedAt,
          snapshot: i.productSnapshot,
        })),
      );
      serverLogger.info("Guest history merged", {
        uid: user!.uid,
        attempted: items.length,
        count,
      });
      return successResponse({ count, attempted: items.length, limit: HISTORY_MAX });
    },
  }),
);
