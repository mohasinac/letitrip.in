"use client";

import { useQuery } from "@tanstack/react-query";
import { categoryService } from "@/services";
import type { CategoryDocument } from "@/db/schema";

/**
 * useTopBrands
 * Fetches brand categories (isBrand = true) for the homepage brands section.
 *
 * @param limit - Maximum number of brands to return (default: 12)
 */
export function useTopBrands(limit = 12) {
  return useQuery<CategoryDocument[]>({
    queryKey: ["categories", "brands", String(limit)],
    queryFn: () => categoryService.listBrands(limit),
    staleTime: 15 * 60 * 1000, // 15 minutes
  });
}
