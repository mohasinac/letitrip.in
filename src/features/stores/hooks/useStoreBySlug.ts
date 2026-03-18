"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type {
  StoreDetail,
  StoreReviewsData,
  StoreProductsResponse,
  StoreAuctionsResponse,
} from "../types";

/**
 * Fetches a single store by its storeSlug via GET /api/stores/[storeSlug].
 */
export function useStoreBySlug(storeSlug: string) {
  return useQuery<StoreDetail>({
    queryKey: ["stores", "detail", storeSlug],
    queryFn: () => apiClient.get<StoreDetail>(`/api/stores/${storeSlug}`),
    enabled: !!storeSlug,
  });
}

/**
 * Fetches the aggregated reviews for a store via GET /api/stores/[storeSlug]/reviews.
 */
export function useStoreReviews(storeSlug: string) {
  return useQuery<StoreReviewsData>({
    queryKey: ["stores", "reviews", storeSlug],
    queryFn: () =>
      apiClient.get<StoreReviewsData>(`/api/stores/${storeSlug}/reviews`),
    enabled: !!storeSlug,
  });
}

/**
 * Fetches published products for a store via GET /api/stores/[storeSlug]/products.
 * @param params URLSearchParams string
 */
export function useStoreProducts(storeSlug: string, params?: string) {
  return useQuery<StoreProductsResponse>({
    queryKey: ["stores", "products", storeSlug, params ?? ""],
    queryFn: () =>
      apiClient.get<StoreProductsResponse>(
        `/api/stores/${storeSlug}/products${params ? `?${params}` : ""}`,
      ),
    enabled: !!storeSlug,
  });
}

/**
 * Fetches auction listings for a store via GET /api/stores/[storeSlug]/auctions.
 * @param params URLSearchParams string
 */
export function useStoreAuctions(storeSlug: string, params?: string) {
  return useQuery<StoreAuctionsResponse>({
    queryKey: ["stores", "auctions", storeSlug, params ?? ""],
    queryFn: () =>
      apiClient.get<StoreAuctionsResponse>(
        `/api/stores/${storeSlug}/auctions${params ? `?${params}` : ""}`,
      ),
    enabled: !!storeSlug,
  });
}
