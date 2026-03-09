"use client";

import { useApiQuery } from "@/hooks";
import { productService } from "@/services";
import type { ProductDocument } from "@/db/schema";

export type ProductItem = Pick<
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
  | "category"
>;

export interface ProductsListResult {
  items: ProductItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

interface UseProductsOptions {
  initialData?: ProductsListResult;
}

/**
 * useProducts
 * Wraps `productService.list(params)` for the public products list page.
 * `params` is a pre-built URLSearchParams query string produced by `useUrlTable`.
 * `options.initialData` — server-prefetched first page; prevents initial client fetch.
 */
export function useProducts(params?: string, options?: UseProductsOptions) {
  const { data, isLoading, error, refetch } = useApiQuery<ProductsListResult>({
    queryKey: ["products", params ?? ""],
    queryFn: () => productService.list(params),
    initialData: options?.initialData,
  });

  return {
    data,
    products: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    refetch,
  };
}
