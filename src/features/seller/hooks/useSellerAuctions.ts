"use client";

import { useQuery } from "@tanstack/react-query";
import { listSellerMyProductsAction } from "@/actions";
import type { AdminProduct } from "@/components";

export interface SellerAuctionsResponse {
  products: AdminProduct[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * useSellerAuctions
 * Fetches seller auction products via Server Action (2-hop).
 * `params` is a pre-built URLSearchParams query string from the component.
 * `enabled` should be `!authLoading && !!user`.
 */
export function useSellerAuctions(params: string, enabled = true) {
  const { data, isLoading } = useQuery<SellerAuctionsResponse>({
    queryKey: ["seller-auctions", params],
    queryFn: async () => {
      const sp = new URLSearchParams(params);
      const result = await listSellerMyProductsAction({
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
      return {
        products: result.items as unknown as AdminProduct[],
        meta: {
          page: result.page,
          limit: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
          hasMore: result.hasMore,
        },
      };
    },
    enabled,
  });

  return {
    items: data?.products ?? [],
    total: data?.meta?.total ?? 0,
    isLoading,
  };
}
