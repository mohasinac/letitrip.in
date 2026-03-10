"use client";

import { useQuery } from "@tanstack/react-query";
import { sellerService } from "@/services";
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
 * Wraps `sellerService.listMyProducts(params)` for the seller auctions list.
 * `params` is a pre-built URLSearchParams query string from the component.
 * `enabled` should be `!authLoading && !!user`.
 */
export function useSellerAuctions(params: string, enabled = true) {
  const { data, isLoading } = useQuery<SellerAuctionsResponse>({
    queryKey: ["seller-auctions", params],
    queryFn: () => sellerService.listMyProducts(params),
    enabled,
  });

  return {
    items: data?.products ?? [],
    total: data?.meta?.total ?? 0,
    isLoading,
  };
}
