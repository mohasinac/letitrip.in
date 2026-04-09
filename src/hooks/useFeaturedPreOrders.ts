"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import type { ProductItem } from "@mohasinac/appkit/features/products";

interface PaginatedResult {
  items: ProductItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

const MIN_COUNT = 12;

/**
 * useFeaturedPreOrders
 * Fetches active pre-orders for the homepage featured section.
 * If fewer than MIN_COUNT pre-orders exist, fills the remaining
 * slots with the latest published pre-orders (deduped).
 */
export function useFeaturedPreOrders() {
  return useQuery<ProductItem[]>({
    queryKey: ["pre-orders", "featured"],
    queryFn: async () => {
      const featuredRes = await apiClient.get<PaginatedResult>(
        "/api/products?filters=isPreOrder%3D%3Dtrue%2Cstatus%3D%3Dpublished&sorts=preOrderDeliveryDate&pageSize=6",
      );
      const featured = featuredRes?.items ?? [];

      if (featured.length >= MIN_COUNT) return featured;

      // Fill remaining slots with latest pre-orders
      const remaining = MIN_COUNT - featured.length;
      const latestRes = await apiClient.get<PaginatedResult>(
        `/api/products?filters=isPreOrder%3D%3Dtrue%2Cstatus%3D%3Dpublished&sorts=-createdAt&pageSize=${remaining + featured.length}`,
      );
      const latest = latestRes?.items ?? [];

      const existingIds = new Set(featured.map((p) => p.id));
      const filler = latest
        .filter((p) => !existingIds.has(p.id))
        .slice(0, remaining);

      return [...featured, ...filler];
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}
