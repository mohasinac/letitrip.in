"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { categoryService, productService } from "@/services";
import type { CategoryDocument, ProductDocument } from "@/db/schema";

export type CategoryProductItem = Pick<
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
>;

interface CategoryResponse {
  data: CategoryDocument;
}

interface ProductsResponse {
  data: CategoryProductItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

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
  const { data: catData, isLoading: catLoading } = useQuery<CategoryResponse>({
    queryKey: ["categories", "slug", slug],
    queryFn: () => categoryService.getBySlug(slug),
    enabled: !!slug,
  });

  const category = catData?.data ?? null;

  /* ---- Build products query params from category + options ---- */
  const productsParams = useMemo(() => {
    if (!category) return null;
    const filterParts = ["status==published", `category==${category.id}`];
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
    queryFn: () => productService.list(productsParams!),
    enabled: !!productsParams,
  });

  return {
    category: category ?? null,
    products: prodData?.data ?? [],
    totalProducts: prodData?.meta?.total ?? 0,
    totalPages: prodData?.meta?.totalPages ?? 1,
    catLoading,
    prodLoading,
    isLoading: catLoading || prodLoading,
    error,
  };
}
