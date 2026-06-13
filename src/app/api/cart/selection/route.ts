import { withProviders } from "@/providers.config";
import { z } from "zod";
import { cartRepository, createRouteHandler, successResponse } from "@mohasinac/appkit";

const selectionSchema = z.object({
  /** Item IDs (CartItemDocument.itemId) to select. Pass null or empty array to select all. */
  itemIds: z.array(z.string()).nullable(),
});

// PUT /api/cart/selection — set which items are selected for checkout
// rbac-public: public read endpoint — Firestore rules + payload schema enforce visibility
export const PUT = withProviders(
  createRouteHandler<(typeof selectionSchema)["_output"]>({
    auth: true,
    schema: selectionSchema,
    handler: async ({ user, body }) => {
      const itemIds = body!.itemIds;
      const normalized =
        !itemIds || itemIds.length === 0 ? null : itemIds;
      await cartRepository.setSelectedItems(user!.uid, normalized);
      return successResponse({ selectedItemIds: normalized });
    },
  }),
);
