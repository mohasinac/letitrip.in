"use client";

import { useApiQuery, useApiMutation, useAuth } from "@/hooks";
import { sellerService } from "@/services";
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

  const { data, isLoading, error, refetch } = useApiQuery<SellerOrdersResult>({
    queryKey: ["seller-orders", params ?? ""],
    queryFn: () => sellerService.listOrders(params),
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
  return useApiMutation<unknown, ShipOrderInput>({
    mutationFn: (data) => sellerService.shipOrder(orderId, data),
    onSuccess,
    onError,
  });
}

// --- Bulk Request Payout ---

export function useBulkRequestPayout(
  onSuccess?: (res: unknown) => void,
  onError?: (err: { message?: string }) => void,
) {
  return useApiMutation<unknown, string[]>({
    mutationFn: (orderIds) =>
      sellerService.bulkOrderAction({ action: "request_payout", orderIds }),
    onSuccess,
    onError,
  });
}
