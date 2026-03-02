/**
 * Public store data returned by /api/stores endpoints.
 * Sensitive fields (email, phone, etc.) are stripped server-side.
 */
export interface StoreListItem {
  uid: string;
  storeSlug: string;
  displayName: string;
  /** From publicProfile.storeName — falls back to displayName */
  storeName: string;
  storeDescription?: string;
  storeCategory?: string;
  storeLogoURL?: string;
  storeBannerURL?: string;
  photoURL?: string;
  totalProducts?: number;
  totalReviews?: number;
  averageRating?: number;
  createdAt?: string;
}

export interface StoreDetail extends StoreListItem {
  bio?: string;
  location?: string;
  website?: string;
}

export interface StoreReviewsData {
  reviews: StoreReview[];
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

export interface StoreReview {
  id: string;
  productId: string;
  productTitle?: string;
  productMainImage?: string | null;
  userId: string;
  userName?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}
