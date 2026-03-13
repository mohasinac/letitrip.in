"use client";

import { useQuery } from "@tanstack/react-query";
import { listStoresAction } from "@/actions";
import type { StoreListItem } from "@/types/stores";

interface PaginatedResult<T = unknown> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * useFeaturedStores
 * Fetches top approved stores for the homepage featured stores section.
 */
export function useFeaturedStores() {
  return useQuery<PaginatedResult<StoreListItem>>({
    queryKey: ["stores", "featured"],
    queryFn: () =>
      listStoresAction({
        pageSize: 12,
        sorts: "-createdAt",
      }) as unknown as Promise<PaginatedResult<StoreListItem>>,
  });
}
