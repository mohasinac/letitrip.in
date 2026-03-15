"use client";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type {
  ProductItem,
  ProductListResponse,
  ProductListParams,
} from "../types";

interface UseProductsOptions {
  initialData?: ProductListResponse;
  enabled?: boolean;
}

export function useProducts(
  params: ProductListParams = {},
  opts?: UseProductsOptions,
) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.category) sp.set("category", params.category);
  if (params.status) sp.set("status", params.status);
  if (params.condition) sp.set("condition", params.condition);
  if (params.minPrice !== undefined)
    sp.set("minPrice", String(params.minPrice));
  if (params.maxPrice !== undefined)
    sp.set("maxPrice", String(params.maxPrice));
  if (params.inStock !== undefined) sp.set("inStock", String(params.inStock));
  if (params.isAuction !== undefined)
    sp.set("isAuction", String(params.isAuction));
  if (params.sellerId) sp.set("sellerId", params.sellerId);
  if (params.sort) sp.set("sort", params.sort);
  if (params.page) sp.set("page", String(params.page));
  if (params.perPage) sp.set("perPage", String(params.perPage));
  if (params.featured !== undefined)
    sp.set("featured", String(params.featured));
  const qs = sp.toString();

  const query = useQuery<ProductListResponse>({
    queryKey: ["products", qs],
    queryFn: () =>
      apiClient.get<ProductListResponse>(`/api/products${qs ? `?${qs}` : ""}`),
    initialData: opts?.initialData,
    enabled: opts?.enabled,
  });

  return {
    products: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    totalPages: query.data?.totalPages ?? 1,
    page: query.data?.page ?? 1,
    isLoading: query.isLoading,
    error: query.error,
  };
}

interface UseProductOptions {
  initialData?: ProductItem;
  enabled?: boolean;
}

export function useProduct(slug: string, opts?: UseProductOptions) {
  const query = useQuery<ProductItem>({
    queryKey: ["products", slug],
    queryFn: () => apiClient.get<ProductItem>(`/api/products/${slug}`),
    initialData: opts?.initialData,
    enabled: opts?.enabled !== false && !!slug,
  });

  return {
    product: query.data,
    isLoading: query.isLoading,
    error: query.error,
  };
}
