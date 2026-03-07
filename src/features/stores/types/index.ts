import type { ProductDocument } from "@/db/schema";

/**
 * Minimal product shape returned by /api/stores/[storeSlug]/products.
 * Mirrors the fields consumed by ProductCard / ProductGrid.
 */
export type StoreProductItem = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "description"
  | "price"
  | "currency"
  | "mainImage"
  | "images"
  | "video"
  | "status"
  | "featured"
  | "isAuction"
  | "currentBid"
  | "isPromoted"
  | "slug"
  | "availableQuantity"
>;

/**
 * Minimal auction shape returned by /api/stores/[storeSlug]/auctions.
 * Mirrors the fields consumed by AuctionCard / AuctionGrid.
 */
export type StoreAuctionItem = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "description"
  | "price"
  | "currency"
  | "mainImage"
  | "images"
  | "video"
  | "isAuction"
  | "auctionEndDate"
  | "startingBid"
  | "currentBid"
  | "bidCount"
  | "featured"
  | "status"
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

import type { StoreListItem } from "@/types/stores";
export type { StoreListItem };

export interface StoreDetail extends StoreListItem {
  bio?: string;
  location?: string;
  website?: string;
  socialLinks?: {
    twitter?: string;
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
  returnPolicy?: string;
  shippingPolicy?: string;
  isVacationMode?: boolean;
  vacationMessage?: string;
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
