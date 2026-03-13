"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductByIdAction, listBidsByProductAction } from "@/actions";
import type { ProductDocument, BidDocument } from "@/db/schema";
import type { FirebaseSieveResult } from "@/lib/query";

type BidsListResult = FirebaseSieveResult<BidDocument>;

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
  const productQuery = useQuery<ProductDocument | null>({
    queryKey: ["product", id],
    queryFn: () => getProductByIdAction(id),
  });

  const product = productQuery.data ?? null;

  const bidsQuery = useQuery<BidsListResult>({
    queryKey: ["bids", id],
    queryFn: () => listBidsByProductAction(id),
    enabled: !!product?.isAuction,
    refetchInterval: 60000,
  });

  const bids = bidsQuery.data?.items ?? [];

  return { productQuery, product, bidsQuery, bids };
}
