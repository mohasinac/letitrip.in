"use client";

import { useApiQuery } from "@/hooks";
import { storeService } from "@/services";
import type {
  StoreDetail,
  StoreReviewsData,
  StoreProductsResponse,
  StoreAuctionsResponse,
} from "../types";

/**
 * Fetches a single store by its storeSlug.
 */
export function useStoreBySlug(storeSlug: string) {
  return useApiQuery<StoreDetail>({
    queryKey: ["stores", "detail", storeSlug],
    queryFn: () => storeService.getBySlug(storeSlug),
    enabled: !!storeSlug,
  });
}

/**
 * Fetches the aggregated reviews for a store.
 */
export function useStoreReviews(storeSlug: string) {
  return useApiQuery<StoreReviewsData>({
    queryKey: ["stores", "reviews", storeSlug],
    queryFn: () => storeService.getReviews(storeSlug),
    enabled: !!storeSlug,
  });
}

/**
 * Fetches published products for a store.
 * @param params URLSearchParams string
 */
export function useStoreProducts(storeSlug: string, params?: string) {
  return useApiQuery<StoreProductsResponse>({
    queryKey: ["stores", "products", storeSlug, params ?? ""],
    queryFn: () => storeService.getProducts(storeSlug, params ?? ""),
    enabled: !!storeSlug,
  });
}

/**
 * Fetches auction listings for a store.
 * @param params URLSearchParams string
 */
export function useStoreAuctions(storeSlug: string, params?: string) {
  return useApiQuery<StoreAuctionsResponse>({
    queryKey: ["stores", "auctions", storeSlug, params ?? ""],
    queryFn: () => storeService.getAuctions(storeSlug, params ?? ""),
    enabled: !!storeSlug,
  });
}
