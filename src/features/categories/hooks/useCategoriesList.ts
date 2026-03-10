"use client";

import { useApiQuery } from "@/hooks";
import { categoryService } from "@/services";
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
  const { data, isLoading, error } = useApiQuery<CategoryDocument[]>({
    queryKey: ["categories", "flat"],
    queryFn: () => categoryService.list("flat=true"),
    initialData: options?.initialData,
  });

  return { categories: data ?? [], isLoading, error };
}
