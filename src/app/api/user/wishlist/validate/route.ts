import {
  wishlistRepository,
  productRepository,
  ProductStatusValues,
  successResponse,
  createRouteHandler,
} from "@mohasinac/appkit";
import { withProviders } from "@/providers.config";

export const POST = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      const uid = user!.uid;

      const items = await wishlistRepository.getWishlistItems(uid);
      if (items.length === 0) {
        return successResponse({ removedCount: 0, removedProductIds: [] });
      }

      const results = await Promise.allSettled(
        items.map((item) => productRepository.findById(item.productId)),
      );

      const staleProductIds: string[] = [];
      items.forEach((item, i) => {
        const result = results[i];
        if (result.status === "rejected" || result.value === null) {
          // Doc deleted from DB â€” gone for good.
          staleProductIds.push(item.productId);
          return;
        }
        const { status } = result.value;
        // Only remove truly unpublished listings. Sold/OOS items may come back
        // (restock, relist after auction, pre-order reopened) so we keep them.
        if (
          status === ProductStatusValues.ARCHIVED ||
          status === ProductStatusValues.DRAFT ||
          status === ProductStatusValues.IN_REVIEW
        ) {
          staleProductIds.push(item.productId);
        }
      });

      if (staleProductIds.length > 0) {
        await Promise.allSettled(
          staleProductIds.map((productId) =>
            wishlistRepository.removeItem(uid, productId),
          ),
        );
      }

      // "Sync all" — refresh the stored productSnapshot (title/thumb/price)
      // for every surviving item against its live product doc, so the
      // persisted snapshot never drifts from what's actually being shown.
      const staleSet = new Set(staleProductIds);
      const snapshotUpdates = items.reduce<
        { productId: string; snapshot: { title: string; thumb?: string; currentPrice: number } }[]
      >((acc, item, i) => {
        if (staleSet.has(item.productId)) return acc;
        const result = results[i];
        if (result.status !== "fulfilled" || !result.value) return acc;
        const product = result.value;
        acc.push({
          productId: item.productId,
          snapshot: { title: product.title, thumb: product.images?.[0], currentPrice: product.price },
        });
        return acc;
      }, []);

      if (snapshotUpdates.length > 0) {
        await wishlistRepository.syncSnapshots(uid, snapshotUpdates);
      }

      return successResponse({
        removedCount: staleProductIds.length,
        removedProductIds: staleProductIds,
        syncedCount: snapshotUpdates.length,
      });
    },
  }),
);