"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getStoreBySlugAction,
  getStoreReviewsAction,
  getStoreProductsAction,
  getStoreAuctionsAction,
} from "@/actions";
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
    queryFn: () =>
      getStoreBySlugAction(storeSlug) as unknown as Promise<StoreDetail>,
    enabled: !!storeSlug,
  });
}

/**
 * Fetches the aggregated reviews for a store.
 */
export function useStoreReviews(storeSlug: string) {
  return useQuery<StoreReviewsData>({
    queryKey: ["stores", "reviews", storeSlug],
    queryFn: () =>
      getStoreReviewsAction(storeSlug) as unknown as Promise<StoreReviewsData>,
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
    queryFn: async () => {
      const sp = new URLSearchParams(params ?? "");
      const result = await getStoreProductsAction(storeSlug, {
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
      return result as unknown as StoreProductsResponse;
    },
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
    queryFn: async () => {
      const sp = new URLSearchParams(params ?? "");
      const result = await getStoreAuctionsAction(storeSlug, {
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
      return result as unknown as StoreAuctionsResponse;
    },
    enabled: !!storeSlug,
  });
}
