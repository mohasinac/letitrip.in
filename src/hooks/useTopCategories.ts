"use client";

import { useQuery } from "@tanstack/react-query";
import { listTopLevelCategoriesAction } from "@/actions";
import type { CategoryDocument } from "@/db/schema";

/**
 * useTopCategories
 * Fetches top-level categories (tier 1) for the homepage categories section.
 *
 * @param limit - Maximum number of categories to return (default: 12)
 */
export function useTopCategories(
  limit = 12,
  options?: { initialData?: CategoryDocument[] },
) {
  return useQuery<CategoryDocument[]>({
    queryKey: ["categories", "top", String(limit)],
    queryFn: () => listTopLevelCategoriesAction(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes — categories change infrequently
    initialData: options?.initialData,
  });
}
