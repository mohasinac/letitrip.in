"use client";

import { useQuery } from "@tanstack/react-query";
import { listAuctionsAction } from "@/actions";
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
  items: AuctionItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * useAuctions
 * Wraps `productService.listAuctions(params)` for the public auctions page.
 * `params` is a pre-built query string produced by `useUrlTable`.
 */
export function useAuctions(
  params?: string,
  options?: { initialData?: AuctionsListResult },
) {
  const { data, isLoading, error, refetch } = useQuery<AuctionsListResult>({
    queryKey: ["auctions", params ?? ""],
    queryFn: async () => {
      const sp = new URLSearchParams(params ?? "");
      return listAuctionsAction({
        filters: sp.get("filters")
          ? decodeURIComponent(sp.get("filters")!)
          : undefined,
        sorts: sp.get("sorts")
          ? decodeURIComponent(sp.get("sorts")!)
          : undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
    },
    initialData: options?.initialData,
  });

  return {
    data,
    auctions: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    refetch,
  };
}
