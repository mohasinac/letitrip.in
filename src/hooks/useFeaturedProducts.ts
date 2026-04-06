"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type {
  ProductItem,
  ProductListResponse,
} from "@mohasinac/feat-products";

type PaginatedResult = ProductListResponse;

const MIN_COUNT = 12;

/**
 * useFeaturedProducts
 * Fetches promoted/featured products for the homepage featured section.
 * If fewer than MIN_COUNT promoted products exist, fills the remaining
 * slots with the latest published products (deduped).
 *
 * Accepts optional `initialData` for SSR hydration — when provided the
 * client skips the first fetch (staleTime covers the cache window).
 */
export function useFeaturedProducts(options?: {
  initialData?: PaginatedResult;
}) {
  return useQuery<PaginatedResult>({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const promotedRes = await apiClient.get<PaginatedResult>(
        "/api/products?filters=isPromoted%3D%3Dtrue%2Cstatus%3D%3Dpublished&pageSize=18",
      );
      const promoted = promotedRes?.items ?? [];

      if (promoted.length >= MIN_COUNT) return promotedRes;

      // Fill remaining slots with latest products
      const remaining = MIN_COUNT - promoted.length;
      const latestRes = await apiClient.get<PaginatedResult>(
        `/api/products?filters=status%3D%3Dpublished&sorts=-createdAt&pageSize=${remaining + promoted.length}`,
      );
      const latest = latestRes?.items ?? [];

      const existingIds = new Set(promoted.map((p) => p.id));
      const filler = latest
        .filter((p) => !existingIds.has(p.id))
        .slice(0, remaining);

      const merged = [...promoted, ...filler];
      return {
        ...promotedRes,
        items: merged,
        total: merged.length,
      };
    },
    initialData: options?.initialData,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
