"use client";

import { useApiQuery } from "@/hooks";
import { productService } from "@/services";
import type { ProductDocument } from "@/db/schema";

export type AuctionItem = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "description"
  | "price"
  | "currency"
  | "mainImage"
  | "images"
  | "video"
  | "isAuction"
  | "auctionEndDate"
  | "startingBid"
  | "currentBid"
  | "bidCount"
  | "featured"
>;

export interface AuctionsListResult {
  data: AuctionItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * useAuctions
 * Wraps `productService.listAuctions(params)` for the public auctions page.
 * `params` is a pre-built query string produced by `useUrlTable`.
 */
export function useAuctions(params?: string) {
  const { data, isLoading, error, refetch } = useApiQuery<AuctionsListResult>({
    queryKey: ["auctions", params ?? ""],
    queryFn: () => productService.listAuctions(params),
  });

  return {
    data,
    auctions: data?.data ?? [],
    total: data?.meta?.total ?? 0,
    totalPages: data?.meta?.totalPages ?? 1,
    isLoading,
    error,
    refetch,
  };
}
