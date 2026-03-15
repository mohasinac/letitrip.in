"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import type {
  PreOrderListResponse,
  PreOrderListParams,
  PreOrderItem,
} from "../types";

export function usePreOrders(
  params: PreOrderListParams = {},
  opts?: { enabled?: boolean },
) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.customerId) sp.set("customerId", params.customerId);
  if (params.sellerId) sp.set("sellerId", params.sellerId);
  if (params.page) sp.set("page", String(params.page));
  if (params.pageSize) sp.set("pageSize", String(params.pageSize));
  if (params.sort) sp.set("sorts", params.sort);
  if (params.filters) sp.set("filters", params.filters);
  const qs = sp.toString();

  const { data, isLoading, error, refetch } = useQuery<PreOrderListResponse>({
    queryKey: ["pre-orders", qs],
    queryFn: () =>
      apiClient.get<PreOrderListResponse>(
        `/api/pre-orders${qs ? `?${qs}` : ""}`,
      ),
    enabled: opts?.enabled ?? true,
  });

  return {
    preOrders: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 0,
    hasMore: data?.hasMore ?? false,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}

export function usePreOrder(id: string, opts?: { enabled?: boolean }) {
  const { data, isLoading, error, refetch } = useQuery<PreOrderItem | null>({
    queryKey: ["pre-order", id],
    queryFn: () => apiClient.get<PreOrderItem>(`/api/pre-orders/${id}`),
    enabled: (opts?.enabled ?? true) && !!id,
  });

  return {
    preOrder: data ?? null,
    isLoading,
    error: error instanceof Error ? error.message : null,
    refetch,
  };
}
