"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type { CategoryDocument } from "@/db/schema";

interface UseCategoriesListOptions {
  initialData?: CategoryDocument[];
}

/**
 * useCategoriesList
 * Fetches flat category list via GET /api/categories?flat=true.
 * `options.initialData` — server-prefetched categories; prevents initial client fetch.
 */
export function useCategoriesList(options?: UseCategoriesListOptions) {
  const { data, isLoading, error } = useQuery<CategoryDocument[]>({
    queryKey: ["categories", "flat"],
    queryFn: () =>
      apiClient.get<CategoryDocument[]>("/api/categories?flat=true"),
    initialData: options?.initialData,
  });

  return { categories: data ?? [], isLoading, error };
}
