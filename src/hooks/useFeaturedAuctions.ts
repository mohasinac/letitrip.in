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
 * useFeaturedAuctions
 * Fetches promoted active auctions for the homepage featured auctions section.
 * If fewer than MIN_COUNT promoted auctions exist, fills the remaining
 * slots with the latest published auctions (deduped).
 */
export function useFeaturedAuctions() {
  return useApiQuery<ProductDocument[]>({
    queryKey: ["auctions", "featured"],
    queryFn: async () => {
      const promotedRes = await productService.list(
        "isAuction=true&status=published&isPromoted=true&pageSize=18",
      );
      const promoted =
        (promotedRes as unknown as PaginatedResult)?.items ??
        (promotedRes as unknown as ProductDocument[]) ??
        [];

      if (promoted.length >= MIN_COUNT) return promoted;

      // Fill remaining slots with latest auctions
      const remaining = MIN_COUNT - promoted.length;
      const latestRes = await productService.getLatestAuctions(
        remaining + promoted.length,
      );
      const latest =
        (latestRes as unknown as PaginatedResult)?.items ??
        (latestRes as unknown as ProductDocument[]) ??
        [];

      const existingIds = new Set(promoted.map((a) => a.id));
      const filler = latest
        .filter((a) => !existingIds.has(a.id))
        .slice(0, remaining);

      return [...promoted, ...filler];
    },
    cacheTTL: 2 * 60 * 1000, // 2 minutes — auctions change more frequently
  });
}
