"use client";

import { useQuery } from "@tanstack/react-query";
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
  return useQuery<StoreDetail>({
    queryKey: ["stores", "detail", storeSlug],
    queryFn: () => storeService.getBySlug(storeSlug),
    enabled: !!storeSlug,
  });
}

/**
 * Fetches the aggregated reviews for a store.
 */
export function useStoreReviews(storeSlug: string) {
  return useQuery<StoreReviewsData>({
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
  return useQuery<StoreProductsResponse>({
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
  return useQuery<StoreAuctionsResponse>({
    queryKey: ["stores", "auctions", storeSlug, params ?? ""],
    queryFn: () => storeService.getAuctions(storeSlug, params ?? ""),
    enabled: !!storeSlug,
  });
}
