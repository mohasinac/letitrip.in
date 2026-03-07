"use client";

import { useApiQuery } from "@/hooks";
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

/**
 * useSearch
 * Wraps `searchService.query(params)` + `categoryService.list()` for
 * the search page facets. `searchParams` is a pre-built URLSearchParams
 * query string produced by `useUrlTable` / `useMemo` in the component.
 */
export function useSearch(searchParams: string) {
  const { data: catData } = useApiQuery<CategoryDocument[]>({
    queryKey: ["categories", "flat"],
    queryFn: () => categoryService.list("flat=true"),
  });

  const { data: searchData, isLoading } = useApiQuery<SearchResponse>({
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
