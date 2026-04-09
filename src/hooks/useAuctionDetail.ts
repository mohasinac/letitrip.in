"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import type { ProductItem } from "@mohasinac/appkit/features/products";
import type { FirebaseSieveResult } from "@/lib/query";

export interface PublicBid {
  id: string;
  productId: string;
  productTitle: string;
  userId: string;
  userName: string;
  bidAmount: number;
  currency: string;
  status: string;
  isWinning: boolean;
  bidDate: Date | string;
  autoMaxBid?: number;
}
type BidsListResult = FirebaseSieveResult<PublicBid>;

/**
 * useAuctionDetail
 *
 * Bundles the product query and bids query for an auction detail page.
 * The bids query is enabled only when the product is confirmed as an auction,
 * and auto-refreshes every 60 seconds.
 *
 * @example
 * const { productQuery, product, bidsQuery, bids } = useAuctionDetail(id);
 */
export function useAuctionDetail(id: string) {
  const productQuery = useQuery<ProductItem | null>({
    queryKey: ["product", id],
    queryFn: () => apiClient.get<ProductItem | null>(`/api/products/${id}`),
  });

  const product = productQuery.data ?? null;

  const bidsQuery = useQuery<BidsListResult>({
    queryKey: ["bids", id],
    queryFn: async () => {
      const bids = await apiClient.get<PublicBid[]>(
        `/api/bids?productId=${id}`,
      );
      return {
        items: bids,
        total: bids.length,
        page: 1,
        pageSize: bids.length,
        totalPages: 1,
        hasMore: false,
      } as BidsListResult;
    },
    enabled: !!product?.isAuction,
    refetchInterval: 60000,
  });

  const bids = bidsQuery.data?.items ?? [];

  return { productQuery, product, bidsQuery, bids };
}
