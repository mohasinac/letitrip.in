"use client";

import { useAuth } from "@/contexts/SessionContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import { shipOrderAction } from "@/actions";
import type { OrderDocument } from "@/db/schema";

interface SellerOrdersResult {
  orders: OrderDocument[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * useSellerOrders
 * Wraps `sellerService.listOrders(params)` for the seller orders list view.
 * `params` is a pre-built URLSearchParams query string produced by `useUrlTable`.
 * Only fetches when the seller is authenticated.
 */
export function useSellerOrders(params?: string) {
  const { user, loading } = useAuth();

  const { data, isLoading, error, refetch } = useQuery<SellerOrdersResult>({
    queryKey: ["seller-orders", params ?? ""],
    queryFn: () =>
      apiClient.get<SellerOrdersResult>(
        `/api/seller/orders${params ? `?${params}` : ""}`,
      ),
    enabled: !loading && !!user,
  });

  return {
    data,
    orders: data?.orders ?? [],
    meta: data?.meta,
    isLoading: loading || isLoading,
    error,
    refetch,
  };
}

// --- Ship Order (custom shipping) ---

interface ShipOrderInput {
  shippingCarrier: string;
  trackingNumber: string;
  trackingUrl: string;
  method: "custom";
}

export function useShipOrder(
  orderId: string,
  onSuccess?: () => void,
  onError?: (err: { message?: string }) => void,
) {
  return useMutation<unknown, Error, ShipOrderInput>({
    mutationFn: (data) =>
      shipOrderAction(orderId, data as Parameters<typeof shipOrderAction>[1]),
    onSuccess,
    onError,
  });
}

// --- Bulk Request Payout ---

import { bulkSellerOrderAction } from "@/actions";

export function useBulkRequestPayout(
  onSuccess?: (res: unknown) => void,
  onError?: (err: { message?: string }) => void,
) {
  return useMutation<unknown, Error, string[]>({
    mutationFn: (orderIds) => bulkSellerOrderAction(orderIds),
    onSuccess,
    onError,
  });
}

