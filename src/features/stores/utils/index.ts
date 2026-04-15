import type { StoreDocument } from "@/db/schema";
import type { StoreListItem } from "@mohasinac/appkit/features/stores";

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
    totalProducts: store.stats?.totalProducts || undefined,
    itemsSold: store.stats?.itemsSold || undefined,
    totalReviews: store.stats?.totalReviews || undefined,
    averageRating: store.stats?.averageRating,
    createdAt: store.createdAt.toISOString(),
  };
}

