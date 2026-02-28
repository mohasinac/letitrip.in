"use client";

import { useApiQuery } from "./useApiQuery";
import { productService } from "@/services";
import type { ProductDocument } from "@/db/schema";

/**
 * useFeaturedAuctions
 * Fetches promoted active auctions for the homepage featured auctions section.
 * Returns up to 18 published, promoted auction products.
 */
export function useFeaturedAuctions() {
  return useApiQuery<ProductDocument[]>({
    queryKey: ["auctions", "featured"],
    queryFn: async () => {
      const res = await productService.list(
        "isAuction=true&status=published&isPromoted=true&pageSize=18",
      );
      // products API returns a paginated envelope { items, total, ... }
      return (res as any)?.items ?? res ?? [];
    },
    cacheTTL: 2 * 60 * 1000, // 2 minutes — auctions change more frequently
  });
}
