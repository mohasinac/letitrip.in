"use client";

import {
  useProducts as useFeatureProducts,
  type ProductItem,
  type ProductListResponse,
  type ProductListParams,
} from "@mohasinac/appkit/features/products";

export type { ProductItem };
export type ProductsListResult = ProductListResponse;

interface UseProductsOptions {
  initialData?: ProductsListResult;
}

function parseProductParams(params?: string): ProductListParams {
  if (!params) return {};

  const sp = new URLSearchParams(params);
  const page = Number(sp.get("page") ?? "1");
  const perPage = Number(sp.get("pageSize") ?? "20");
  const minPrice = sp.get("minPrice");
  const maxPrice = sp.get("maxPrice");
  const isAuction = sp.get("isAuction");
  const featured = sp.get("featured");

  return {
    q: sp.get("q") ?? undefined,
    category: sp.get("category") ?? undefined,
    status:
      (sp.get("status") as ProductListParams["status"] | null) ?? undefined,
    condition:
      (sp.get("condition") as ProductListParams["condition"] | null) ??
      undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    isAuction: isAuction ? isAuction === "true" : undefined,
    sellerId: sp.get("sellerId") ?? undefined,
    sort: sp.get("sorts") ?? undefined,
    page: Number.isFinite(page) ? page : 1,
    perPage: Number.isFinite(perPage) ? perPage : 20,
    featured: featured ? featured === "true" : undefined,
  };
}

/**
 * useProducts
 * Fetches the paginated, filtered products list via GET /api/products.
 * `params` is a pre-built URLSearchParams query string produced by `useUrlTable`.
 * `options.initialData` — server-prefetched first page; prevents initial client fetch.
 */
export function useProducts(params?: string, options?: UseProductsOptions) {
  const parsedParams = parseProductParams(params);
  const {
    products: featureProducts,
    total,
    totalPages,
    page,
    hasMore,
    isLoading,
    error,
  } = useFeatureProducts(parsedParams, {
    initialData: options?.initialData,
  });

  const products = featureProducts;

  const data: ProductsListResult = {
    items: products,
    total,
    page,
    pageSize: parsedParams.perPage ?? options?.initialData?.pageSize ?? 20,
    totalPages,
    hasMore,
  };

  return {
    data,
    products,
    total,
    totalPages,
    isLoading,
    error,
    refetch: async () => data,
  };
}

