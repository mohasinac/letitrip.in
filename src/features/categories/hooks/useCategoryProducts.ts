"use client";

import { useMemo } from "react";
import { useApiQuery } from "@/hooks";
import { categoryService, productService } from "@/services";
import type { CategoryDocument, ProductDocument } from "@/db/schema";

export type CategoryProductItem = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "price"
  | "currency"
  | "mainImage"
  | "status"
  | "featured"
  | "isAuction"
  | "currentBid"
  | "isPromoted"
>;

interface CategoriesResponse {
  data: CategoryDocument[];
}

interface ProductsResponse {
  data: CategoryProductItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

interface UseCategoryProductsOptions {
  sort: string;
  page: number;
  pageSize: number;
  priceRange?: string;
  /** table.params.toString() — used as cache-key suffix for reactivity */
  cacheKey: string;
}

/**
 * useCategoryProducts
 * Fetches a category by slug (via flat categories list) and then fetches
 * products filtered to that category.  Sort/pagination/price-range are
 * controlled by the caller via `options`.
 */
export function useCategoryProducts(
  slug: string,
  options: UseCategoryProductsOptions,
) {
  const { sort, page, pageSize, priceRange, cacheKey } = options;

  /* ---- Fetch all categories (flat) to resolve slug → category doc ---- */
  const { data: catData, isLoading: catLoading } =
    useApiQuery<CategoriesResponse>({
      queryKey: ["categories", "flat"],
      queryFn: () => categoryService.list("flat=true"),
    });

  const category = useMemo(
    () => (catData?.data ?? []).find((c) => c.slug === slug),
    [catData, slug],
  );

  /* ---- Build products query params from category + options ---- */
  const productsParams = useMemo(() => {
    if (!category) return null;
    const [minPrice, maxPrice] = (() => {
      if (!priceRange) return ["", ""];
      if (priceRange.endsWith("+")) return [priceRange.replace("+", ""), ""];
      const parts = priceRange.split("-");
      return [parts[0] ?? "", parts[1] ?? ""];
    })();
    const filterParts = ["status==published", `category==${category.id}`];
    if (minPrice) filterParts.push(`price>=${minPrice}`);
    if (maxPrice) filterParts.push(`price<=${maxPrice}`);
    return `filters=${encodeURIComponent(filterParts.join(","))}&sorts=${encodeURIComponent(sort)}&page=${String(page)}&pageSize=${String(pageSize)}`;
  }, [category, sort, page, pageSize, priceRange]);

  /* ---- Fetch products ---- */
  const {
    data: prodData,
    isLoading: prodLoading,
    error,
  } = useApiQuery<ProductsResponse>({
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
