"use client";

import { useApiQuery } from "@/hooks";
import { productService } from "@/services";
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

export interface PreOrdersListResult {
  data: PreOrderItem[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

/**
 * usePreOrders
 * Wraps `productService.listPreOrders(params)` for the public pre-orders page.
 * `params` is a pre-built query string produced by `useUrlTable`.
 */
export function usePreOrders(params?: string) {
  const { data, isLoading, error, refetch } = useApiQuery<PreOrdersListResult>({
    queryKey: ["pre-orders", params ?? ""],
    queryFn: () => productService.listPreOrders(params),
  });

  return {
    data,
    preOrders: data?.data ?? [],
    total: data?.meta?.total ?? 0,
    totalPages: data?.meta?.totalPages ?? 1,
    isLoading,
    error,
    refetch,
  };
}
