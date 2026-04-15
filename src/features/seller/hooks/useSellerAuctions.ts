"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
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
 * Fetches seller auction products via GET /api/seller/products.
 * `params` is a pre-built URLSearchParams query string from the component.
 * `enabled` should be `!authLoading && !!user`.
 */
export function useSellerAuctions(params: string, enabled = true) {
  const { data, isLoading } = useQuery<SellerAuctionsResponse>({
    queryKey: ["seller-auctions", params],
    queryFn: () =>
      apiClient.get<SellerAuctionsResponse>(
        `/api/seller/products${params ? `?${params}` : ""}`,
      ),
    enabled,
  });

  return {
    items: data?.products ?? [],
    total: data?.meta?.total ?? 0,
    isLoading,
  };
}

