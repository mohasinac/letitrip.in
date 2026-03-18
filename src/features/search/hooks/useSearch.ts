"use client";

import {
  useSearch as _useSearch,
  type SearchCategoryOption,
  type SearchResponse,
} from "@mohasinac/feat-search";
import type { CategoryDocument } from "@/db/schema";

export type { SearchResponse } from "@mohasinac/feat-search";

interface UseSearchOptions {
  initialCategories?: CategoryDocument[] | SearchCategoryOption[];
}

/**
 * useSearch
 * Fetches search results via GET /api/search and category facets via GET /api/categories?flat=true.
 * Delegates to @mohasinac/feat-search.
 */
export function useSearch(searchParams: string, options?: UseSearchOptions) {
  const { results, items, total, totalPages, isLoading, categories } =
    _useSearch(searchParams, {
      initialCategories: options?.initialCategories as
        | SearchCategoryOption[]
        | undefined,
    });

  return {
    catData: categories,
    searchData: results,
    products: items,
    total,
    totalPages,
    isLoading,
  };
}
