"use client";

import { useStores } from "@mohasinac/feat-stores";
import type { StoreListItem } from "@/types/stores";

/**
 * useFeaturedStores
 * Fetches top approved stores for the homepage featured stores section.
 * Delegates to @mohasinac/feat-stores.
 */
export function useFeaturedStores() {
  const { stores, total, isLoading, error } = useStores({
    pageSize: 12,
    sort: "-createdAt",
  });

  return {
    data:
      stores.length > 0 || !isLoading
        ? { items: stores as StoreListItem[], total }
        : undefined,
    isLoading,
    error,
  };
}
