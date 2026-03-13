"use client";

import { useQuery } from "@tanstack/react-query";
import { searchProductsAction, listCategoriesAction } from "@/actions";
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
    queryFn: async () => (await listCategoriesAction({ pageSize: 500 })).items,
    initialData: options?.initialCategories,
  });

  const { data: searchData, isLoading } = useQuery<SearchResponse>({
    queryKey: ["search", searchParams],
    queryFn: async () => {
      const sp = new URLSearchParams(searchParams);
      return searchProductsAction({
        q: sp.get("q") ?? undefined,
        category: sp.get("category") ?? undefined,
        minPrice: sp.has("minPrice") ? Number(sp.get("minPrice")) : undefined,
        maxPrice: sp.has("maxPrice") ? Number(sp.get("maxPrice")) : undefined,
        sort: sp.get("sort") ?? sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
    },
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
