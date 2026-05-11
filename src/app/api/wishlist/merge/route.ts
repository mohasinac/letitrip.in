import { withProviders } from "@/providers.config";
/**
 * POST /api/wishlist/merge
 *
 * Batch-upserts guest wishlist items into the authenticated user's
 * top-level `wishlists/wishlist-{uid}` doc. Called on login + 60s sync.
 *
 * Cap-aware: stops merging once the wishlist reaches WISHLIST_MAX.
 * No availability check — wishlists intentionally retain sold-out items so
 * users can be notified when stock returns.
 */

import { z } from "zod";
import {
  createRouteHandler,
  successResponse,
  wishlistRepository,
  WishlistFullError,
  WISHLIST_MAX,
  serverLogger,
} from "@mohasinac/appkit";

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
      const uid = user!.uid;

      let merged = 0;
      let skippedFull = 0;
      let capReached = false;

      for (const item of items) {
        if (capReached) {
          skippedFull++;
          continue;
        }
        try {
          await wishlistRepository.addItem(uid, item.productId);
          merged++;
        } catch (e) {
          if (e instanceof WishlistFullError) {
            capReached = true;
            skippedFull++;
            continue;
          }
          // swallow per-item failures so one bad doc ref doesn't abort the batch
          serverLogger.warn("wishlist.merge item failed", {
            uid,
            productId: item.productId,
            error: e,
          });
        }
      }

      serverLogger.info("Guest wishlist merged", {
        uid,
        merged,
        skippedFull,
        attempted: items.length,
      });

      return successResponse({
        merged,
        skippedFull,
        attempted: items.length,
        limit: WISHLIST_MAX,
        capReached,
      });
    },
  }),
);
