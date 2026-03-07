/**
 * Public store data returned by /api/stores endpoints.
 * Fields are flat-mapped from StoreDocument (server strips sensitive data).
 */
export interface StoreListItem {
  // StoreDocument identity
  id: string; // same as storeSlug
  storeSlug: string;
  ownerId: string;

  storeName: string;
  storeDescription?: string;
  storeCategory?: string;
  storeLogoURL?: string;
  storeBannerURL?: string;
  status: string;
  isPublic: boolean;

  // Flat stats (from StoreDocument.stats)
  totalProducts?: number;
  itemsSold?: number;
  totalReviews?: number;
  averageRating?: number;

  createdAt?: string;

  // Legacy aliases from Firebase Auth — may be present in older store documents
  uid?: string;
  displayName?: string;
  photoURL?: string;
}
