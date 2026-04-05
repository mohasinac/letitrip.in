"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type { CategoryItem } from "@mohasinac/feat-categories";

/**
 * useTopCategories
 * Fetches top-level categories (tier 1) for the homepage categories section.
 *
 * @param limit - Maximum number of categories to return (default: 12)
 */
export function useTopCategories(
  limit = 12,
  options?: { initialData?: CategoryItem[] },
) {
  return useQuery<CategoryItem[]>({
    queryKey: ["categories", "top", String(limit)],
    queryFn: () =>
      apiClient.get<CategoryItem[]>(`/api/categories?tier=0&pageSize=${limit}`),
    staleTime: 15 * 60 * 1000, // 15 minutes — categories change infrequently
    initialData: options?.initialData,
  });
}
