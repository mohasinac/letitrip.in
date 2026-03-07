"use client";

import { useApiQuery } from "./useApiQuery";
import { productService } from "@/services";
import type { ProductDocument } from "@/db/schema";

interface PaginatedResult {
  items: ProductDocument[];
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
  return useApiQuery<ProductDocument[]>({
    queryKey: ["pre-orders", "featured"],
    queryFn: async () => {
      const featuredRes = await productService.getFeaturedPreOrders();
      const featured =
        (featuredRes as unknown as PaginatedResult)?.items ??
        (featuredRes as unknown as ProductDocument[]) ??
        [];

      if (featured.length >= MIN_COUNT) return featured;

      // Fill remaining slots with latest pre-orders
      const remaining = MIN_COUNT - featured.length;
      const latestRes = await productService.getLatestPreOrders(
        remaining + featured.length,
      );
      const latest =
        (latestRes as unknown as PaginatedResult)?.items ??
        (latestRes as unknown as ProductDocument[]) ??
        [];

      const existingIds = new Set(featured.map((p) => p.id));
      const filler = latest
        .filter((p) => !existingIds.has(p.id))
        .slice(0, remaining);

      return [...featured, ...filler];
    },
    cacheTTL: 3 * 60 * 1000, // 3 minutes
  });
}
