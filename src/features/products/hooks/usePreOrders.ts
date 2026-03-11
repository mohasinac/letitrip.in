"use client";

import { useQuery } from "@tanstack/react-query";
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
    queryFn: () => productService.listPreOrders(params),
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
