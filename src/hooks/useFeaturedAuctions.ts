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
 * useFeaturedAuctions
 * Fetches promoted active auctions for the homepage featured auctions section.
 * If fewer than MIN_COUNT promoted auctions exist, fills the remaining
 * slots with the latest published auctions (deduped).
 */
export function useFeaturedAuctions() {
  return useQuery<ProductItem[]>({
    queryKey: ["auctions", "featured"],
    queryFn: async () => {
      const promotedRes = await apiClient.get<PaginatedResult>(
        "/api/products?filters=isAuction%3D%3Dtrue%2Cstatus%3D%3Dpublished%2CisPromoted%3D%3Dtrue&pageSize=18",
      );
      const promoted = promotedRes?.items ?? [];

      if (promoted.length >= MIN_COUNT) return promoted;

      // Fill remaining slots with latest auctions
      const remaining = MIN_COUNT - promoted.length;
      const latestRes = await apiClient.get<PaginatedResult>(
        `/api/products?filters=isAuction%3D%3Dtrue%2Cstatus%3D%3Dpublished&sorts=-createdAt&pageSize=${remaining + promoted.length}`,
      );
      const latest = latestRes?.items ?? [];

      const existingIds = new Set(promoted.map((a) => a.id));
      const filler = latest
        .filter((a) => !existingIds.has(a.id))
        .slice(0, remaining);

      return [...promoted, ...filler];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes — auctions change more frequently
  });
}
