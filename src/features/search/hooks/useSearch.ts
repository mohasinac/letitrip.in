"use client";

import { useQuery } from "@tanstack/react-query";
import { searchService, categoryService } from "@/services";
import type { CategoryDocument, ProductDocument } from "@/db/schema";

type ProductCardData = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "description"
  | "price"
  | "currency"
  | "mainImage"
  | "images"
  | "video"
  | "status"
  | "featured"
  | "isAuction"
  | "currentBid"
  | "isPromoted"
  | "slug"
  | "availableQuantity"
>;

export interface SearchResponse {
  items: ProductCardData[];
  q: string;
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
  backend: "algolia" | "in-memory";
}

interface UseSearchOptions {
  initialCategories?: CategoryDocument[];
}

/**
 * useSearch
 * Wraps `searchService.query(params)` + `categoryService.list()` for
 * the search page facets. `searchParams` is a pre-built URLSearchParams
 * query string produced by `useUrlTable` / `useMemo` in the component.
 * `options.initialCategories` — server-prefetched category list for filter facets.
 */
export function useSearch(searchParams: string, options?: UseSearchOptions) {
  const { data: catData } = useQuery<CategoryDocument[]>({
    queryKey: ["categories", "flat"],
    queryFn: () => categoryService.list("flat=true"),
    initialData: options?.initialCategories,
  });

  const { data: searchData, isLoading } = useQuery<SearchResponse>({
    queryKey: ["search", searchParams],
    queryFn: () => searchService.query(searchParams),
  });

  return {
    catData: catData ?? [],
    searchData,
    products: searchData?.items ?? [],
    total: searchData?.total ?? 0,
    totalPages: searchData?.totalPages ?? 1,
    isLoading,
  };
}
