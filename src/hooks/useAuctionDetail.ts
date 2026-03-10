"use client";

import { useQuery } from "@tanstack/react-query";
import { productService, bidService } from "@/services";
import type { ProductDocument, BidDocument } from "@/db/schema";

interface ProductResponse {
  data: ProductDocument;
}

interface BidsResponse {
  data: BidDocument[];
  meta: { total: number };
}

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
  const productQuery = useQuery<ProductResponse>({
    queryKey: ["product", id],
    queryFn: () => productService.getById(id),
  });

  const product = productQuery.data?.data ?? null;

  const bidsQuery = useQuery<BidsResponse>({
    queryKey: ["bids", id],
    queryFn: () => bidService.listByProduct(id),
    enabled: !!product?.isAuction,
    refetchInterval: 60000,
  });

  const bids = bidsQuery.data?.data ?? [];

  return { productQuery, product, bidsQuery, bids };
}
