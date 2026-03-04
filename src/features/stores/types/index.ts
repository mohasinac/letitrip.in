import type { ProductDocument } from "@/db/schema";

/**
 * Minimal product shape returned by /api/stores/[storeSlug]/products.
 * Mirrors the fields consumed by ProductCard / ProductGrid.
 */
export type StoreProductItem = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "price"
  | "currency"
  | "mainImage"
  | "video"
  | "status"
  | "featured"
  | "isAuction"
  | "currentBid"
  | "isPromoted"
  | "slug"
>;

/**
 * Minimal auction shape returned by /api/stores/[storeSlug]/auctions.
 * Mirrors the fields consumed by AuctionCard / AuctionGrid.
 */
export type StoreAuctionItem = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "price"
  | "currency"
  | "mainImage"
  | "video"
  | "isAuction"
  | "auctionEndDate"
  | "startingBid"
  | "currentBid"
  | "bidCount"
  | "featured"
>;

/** Sieve page result for store products */
export interface StoreProductsResponse {
  items: StoreProductItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/** Sieve page result for store auctions */
export interface StoreAuctionsResponse {
  items: StoreAuctionItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

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
