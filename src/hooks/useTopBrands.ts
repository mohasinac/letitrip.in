"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type { CategoryItem } from "@mohasinac/feat-categories";

/**
 * useTopBrands
 * Fetches brand categories (isBrand = true) for the homepage brands section.
 *
 * @param limit - Maximum number of brands to return (default: 12)
 */
export function useTopBrands(limit = 12) {
  return useQuery<CategoryItem[]>({
    queryKey: ["categories", "brands", String(limit)],
    queryFn: () =>
      apiClient.get<CategoryItem[]>(
        `/api/categories?isBrand=true&pageSize=${limit}`,
      ),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
