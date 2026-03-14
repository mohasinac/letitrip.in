"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategoryBySlugAction, listProductsAction } from "@/actions";
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
  | "sellerId"
  | "sellerName"
>;

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
  const { data: catData, isLoading: catLoading } =
    useQuery<CategoryDocument | null>({
      queryKey: ["categories", "slug", slug],
      queryFn: () => getCategoryBySlugAction(slug),
      enabled: !!slug,
    });

  const category = catData ?? null;

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
    queryFn: async () => {
      const sp = new URLSearchParams(productsParams!);
      const result = await listProductsAction({
        filters: sp.get("filters")
          ? decodeURIComponent(sp.get("filters")!)
          : undefined,
        sorts: sp.get("sorts")
          ? decodeURIComponent(sp.get("sorts")!)
          : undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
      return {
        data: result.items,
        meta: {
          page: result.page,
          limit: result.pageSize,
          total: result.total,
          totalPages: result.totalPages,
        },
      };
    },
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
