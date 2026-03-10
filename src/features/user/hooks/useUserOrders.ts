"use client";

import { useAuth } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "@/services";
import type { OrderDocument } from "@/db/schema";

interface UserOrdersResult {
  orders: OrderDocument[];
  total: number;
  page: number;
  totalPages: number;
}

/**
 * useUserOrders
 * Wraps `orderService.list(params)` for the user orders list page.
 * `params` is a pre-built URLSearchParams query string produced by `useUrlTable`.
 * Only fetches when the user is authenticated.
 */
export function useUserOrders(params?: string) {
  const { user, loading } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<UserOrdersResult>({
    queryKey: ["user-orders", params ?? ""],
    queryFn: () => orderService.list(params),
    enabled: !loading && !!user,
  });

  return {
    data,
    orders: data?.orders ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    isLoading: loading || isLoading,
    error,
    refetch,
  };
}
