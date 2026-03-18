"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
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
 * Fetches paginated auctions via GET /api/products.
 * `params` is a pre-built query string produced by `useUrlTable` and includes
 * `isAuction==true,status==published` in the filters.
 */
export function useAuctions(
  params?: string,
  options?: { initialData?: AuctionsListResult },
) {
  const { data, isLoading, error, refetch } = useQuery<AuctionsListResult>({
    queryKey: ["auctions", params ?? ""],
    queryFn: () =>
      apiClient.get<AuctionsListResult>(
        `/api/products${params ? `?${params}` : ""}`,
      ) as Promise<AuctionsListResult>,
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
