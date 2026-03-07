"use client";

import { useApiQuery } from "./useApiQuery";
import { storeService } from "@/services";
import type { StoreListItem } from "@/features/stores";

interface PaginatedResult {
  items: StoreListItem[];
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
  return useApiQuery<PaginatedResult>({
    queryKey: ["stores", "featured"],
    queryFn: () =>
      storeService.listStores(
        "pageSize=12&sorts=-createdAt",
      ) as Promise<PaginatedResult>,
  });
}
