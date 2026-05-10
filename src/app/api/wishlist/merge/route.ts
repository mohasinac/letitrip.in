import { withProviders } from "@/providers.config";
/**
 * POST /api/wishlist/merge
 *
 * Batch-upserts guest wishlist items into the authenticated user's Firestore
 * wishlist subcollection. Called by useWishlistCount on login and on the 60 s
 * sync interval, and when the user visits /wishlist or /cart.
 *
 * No availability check — wishlists intentionally retain sold-out items so
 * users can be notified when stock returns.
 */

import { z } from "zod";
import { createRouteHandler, successResponse } from "@mohasinac/appkit";
import { wishlistRepository } from "@mohasinac/appkit";
import { serverLogger } from "@mohasinac/appkit";

const mergeWishlistSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1) }))
    .min(1)
    .max(200),
});

export const POST = withProviders(
  createRouteHandler<(typeof mergeWishlistSchema)["_output"]>({
    auth: true,
    schema: mergeWishlistSchema,
    handler: async ({ user, body }) => {
      const { items } = body!;

      // allSettled so one bad doc ref never aborts the whole batch
      await Promise.allSettled(
        items.map((item) => wishlistRepository.addItem(user!.uid, item.productId)),
      );

      serverLogger.info("Guest wishlist merged", {
        uid: user!.uid,
        count: items.length,
      });

      return successResponse({ merged: items.length });
    },
  }),
);
