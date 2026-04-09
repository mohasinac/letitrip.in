"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiClientError } from "@mohasinac/appkit/http";
import type {
  ProductItem,
  ProductListResponse,
} from "@mohasinac/appkit/features/products";
import type { CategoryItem } from "@mohasinac/appkit/features/categories";

export type CategoryProductItem = ProductItem;

interface ProductsResponse extends ProductListResponse {}

interface UseCategoryProductsOptions {
  sort: string;
  page: number;
  pageSize: number;
  /** Minimum price filter (numeric string, e.g. "500") */
  minPrice?: string;
  /** Maximum price filter (numeric string, e.g. "10000") */
  maxPrice?: string;
  search?: string;
  /** table.params.toString() — used as cache-key suffix for reactivity */
  cacheKey: string;
}

/**
 * useCategoryProducts
 * Fetches a category by slug (via slug API query) and then fetches
 * products filtered to that category.  Sort/pagination/price-range are
 * controlled by the caller via `options`.
 */
export function useCategoryProducts(
  slug: string,
  options: UseCategoryProductsOptions,
) {
  const { sort, page, pageSize, minPrice, maxPrice, search, cacheKey } =
    options;

  /* ---- Fetch category by slug ---- */
  const { data: catData, isLoading: catLoading } =
    useQuery<CategoryItem | null>({
      queryKey: ["categories", "slug", slug],
      queryFn: async () => {
        try {
          return await apiClient.get<CategoryItem>(
            `/api/categories?slug=${encodeURIComponent(slug)}`,
          );
        } catch (e) {
          if (e instanceof ApiClientError && e.status === 404) return null;
          throw e;
        }
      },
      enabled: !!slug,
    });

  const category = catData ?? null;

  /* ---- Build products query params from category + options ---- */
  const productsParams = useMemo(() => {
    if (!category) return null;
    // Products store the category display name in the `category` field (e.g. "Home & Kitchen"),
    // NOT the Firestore document ID. Use category.name for the Sieve filter.
    const filterParts = ["status==published", `category==${category.name}`];
    if (minPrice) filterParts.push(`price>=${minPrice}`);
    if (maxPrice) filterParts.push(`price<=${maxPrice}`);
    if (search) filterParts.push(`title_=${search}`);
    return `filters=${encodeURIComponent(filterParts.join(","))}&sorts=${encodeURIComponent(sort)}&page=${String(page)}&pageSize=${String(pageSize)}`;
  }, [category, sort, page, pageSize, minPrice, maxPrice, search]);

  /* ---- Fetch products ---- */
  const {
    data: prodData,
    isLoading: prodLoading,
    error,
  } = useQuery<ProductsResponse>({
    queryKey: ["products", "by-category", category?.id ?? "", cacheKey],
    queryFn: () =>
      apiClient.get<ProductsResponse>(
        `/api/products?${productsParams!}`,
      ) as Promise<ProductsResponse>,
    enabled: !!productsParams,
  });

  return {
    category: category ?? null,
    products: prodData?.items ?? [],
    totalProducts: prodData?.total ?? 0,
    totalPages: prodData?.totalPages ?? 1,
    catLoading,
    prodLoading,
    isLoading: catLoading || prodLoading,
    error,
  };
}
