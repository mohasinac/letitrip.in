"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { API_ENDPOINTS } from "@/constants";
import { listPreOrdersAction } from "@/actions";
import type { ProductDocument } from "@/db/schema";

export type PreOrderItem = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "description"
  | "price"
  | "currency"
  | "mainImage"
  | "images"
  | "video"
  | "isPreOrder"
  | "preOrderDeliveryDate"
  | "preOrderDepositPercent"
  | "preOrderDepositAmount"
  | "preOrderMaxQuantity"
  | "preOrderCurrentCount"
  | "preOrderProductionStatus"
  | "preOrderCancellable"
  | "featured"
  | "stockQuantity"
  | "availableQuantity"
>;

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
    queryFn: async () => {
      const sp = new URLSearchParams(params ?? "");
      return listPreOrdersAction({
        filters: sp.get("filters")
          ? decodeURIComponent(sp.get("filters")!)
          : undefined,
        sorts: sp.get("sorts")
          ? decodeURIComponent(sp.get("sorts")!)
          : undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      });
    },
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
