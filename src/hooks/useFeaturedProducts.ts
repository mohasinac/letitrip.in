"use client";

import { useQuery } from "@tanstack/react-query";
import { listProductsAction, getLatestProductsAction } from "@/actions";
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
 * useFeaturedProducts
 * Fetches promoted/featured products for the homepage featured section.
 * If fewer than MIN_COUNT promoted products exist, fills the remaining
 * slots with the latest published products (deduped).
 */
export function useFeaturedProducts() {
  return useQuery<PaginatedResult>({
    queryKey: ["products", "featured"],
    queryFn: async () => {
      const promotedRes = await listProductsAction({
        filters: "isPromoted==true,status==published",
        pageSize: 18,
      });
      const promoted = promotedRes?.items ?? [];

      if (promoted.length >= MIN_COUNT) return promotedRes;

      // Fill remaining slots with latest products
      const remaining = MIN_COUNT - promoted.length;
      const latestRes = await getLatestProductsAction(
        remaining + promoted.length,
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
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
