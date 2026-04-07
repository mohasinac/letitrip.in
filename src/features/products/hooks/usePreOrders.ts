"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/http";
import { API_ENDPOINTS } from "@/constants";
import type { ProductItem } from "@mohasinac/feat-products";

/** Pre-order cards show products with isPreOrder==true — they are ProductItems */
export type PreOrderItem = ProductItem;

/**
 * The /api/products endpoint returns successResponse({ items, total, page, pageSize, totalPages, hasMore }).
 * apiClient unwraps the `data` field, so the resolved value is this shape directly.
 */
export interface PreOrdersListResult {
  items: PreOrderItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * usePreOrders
 * Wraps `productService.listPreOrders(params)` for the public pre-orders page.
 * `params` is a pre-built query string produced by `useUrlTable`.
 *
 * Accepts optional `initialData` for SSR hydration.
 */
export function usePreOrders(
  params?: string,
  options?: { initialData?: PreOrdersListResult },
) {
  const { data, isLoading, error, refetch } = useQuery<PreOrdersListResult>({
    queryKey: ["pre-orders", params ?? ""],
    queryFn: () =>
      apiClient.get<PreOrdersListResult>(
        `/api/products${params ? `?${params}` : ""}`,
      ) as Promise<PreOrdersListResult>,
    initialData: options?.initialData,
  });

  return {
    data,
    preOrders: data?.items ?? [],
    total: data?.total ?? 0,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    refetch,
  };
}

/**
 * usePreOrderPayment
 * Exposes mutations for creating a Razorpay order and verifying the pre-order deposit.
 */
export function usePreOrderPayment() {
  const createPaymentOrderMutation = useMutation({
    mutationFn: (data: unknown) =>
      apiClient.post(API_ENDPOINTS.PAYMENT.CREATE_ORDER, data),
  });

  const verifyDepositMutation = useMutation({
    mutationFn: (data: unknown) =>
      apiClient.post(API_ENDPOINTS.PAYMENT.PREORDER, data),
  });

  return { createPaymentOrderMutation, verifyDepositMutation };
}
