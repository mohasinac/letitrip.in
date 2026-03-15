"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type {
  StoreListResponse,
  StoreListParams,
  StoreDetail,
  StoreProductsResponse,
} from "../types";

export function useStores(
  params: StoreListParams = {},
  opts?: { enabled?: boolean },
) {
  const sp = new URLSearchParams();
  if (params.category) sp.set("category", params.category);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params.sort) sp.set("sorts", params.sort);
  if (params.filters) sp.set("filters", params.filters);
  const qs = sp.toString();

  const { data, isLoading, error, refetch } = useQuery<StoreListResponse>({
    queryKey: ["stores", qs],
    queryFn: () =>
      apiClient.get<StoreListResponse>(`/api/stores${qs ? `?${qs}` : ""}`),
    enabled: opts?.enabled ?? true,
  });

  return {
    stores: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    hasMore: data?.hasMore ?? false,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useStoreBySlug(
  storeSlug: string,
  opts?: { enabled?: boolean },
) {
  const { data, isLoading, error, refetch } = useQuery<StoreDetail | null>({
    queryKey: ["store", storeSlug],
    queryFn: () => apiClient.get<StoreDetail>(`/api/stores/${storeSlug}`),
    enabled: (opts?.enabled ?? true) && !!storeSlug,
  });

  return {
    store: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function useStoreProducts(
  storeSlug: string,
  params: { page?: number; pageSize?: number } = {},
  opts?: { enabled?: boolean },
) {
  const sp = new URLSearchParams();
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  const qs = sp.toString();

  const { data, isLoading, error, refetch } = useQuery<StoreProductsResponse>({
    queryKey: ["store-products", storeSlug, qs],
    queryFn: () =>
      apiClient.get<StoreProductsResponse>(
        `/api/stores/${storeSlug}/products${qs ? `?${qs}` : ""}`,
      ),
    enabled: (opts?.enabled ?? true) && !!storeSlug,
  });

  return {
    products: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
