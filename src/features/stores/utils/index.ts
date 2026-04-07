import type { StoreDocument } from "@/db/schema";
import type { StoreListItem } from "@mohasinac/feat-stores";

/** Maps a Firestore StoreDocument to the view-layer StoreListItem shape. */
export function mapStoreDocument(store: StoreDocument): StoreListItem {
  return {
    id: store.id,
    storeSlug: store.storeSlug,
    ownerId: store.ownerId,
    storeName: store.storeName,
    storeDescription: store.storeDescription,
    storeCategory: store.storeCategory,
    storeLogoURL: store.storeLogoURL,
    storeBannerURL: store.storeBannerURL,
    status: store.status,
    isPublic: store.isPublic,
    totalProducts: store.stats?.totalProducts ?? 0,
    itemsSold: store.stats?.itemsSold ?? 0,
    totalReviews: store.stats?.totalReviews ?? 0,
    averageRating: store.stats?.averageRating,
    createdAt: store.createdAt.toISOString(),
  };
}
