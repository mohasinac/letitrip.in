"use client";

import { useQuery } from "@tanstack/react-query";
import { listCategoriesAction } from "@/actions";
import type { CategoryDocument } from "@/db/schema";

interface UseCategoriesListOptions {
  initialData?: CategoryDocument[];
}

/**
 * useCategoriesList
 * Wraps `categoryService.list("flat=true")` for the categories listing page.
 * `options.initialData` — server-prefetched categories; prevents initial client fetch.
 */
export function useCategoriesList(options?: UseCategoriesListOptions) {
  const { data, isLoading, error } = useQuery<CategoryDocument[]>({
    queryKey: ["categories", "flat"],
    queryFn: async () => (await listCategoriesAction({ pageSize: 500 })).items,
    initialData: options?.initialData,
  });

  return { categories: data ?? [], isLoading, error };
}
