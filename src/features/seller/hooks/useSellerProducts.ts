"use client";

import { useMemo } from "react";
import { useUrlTable } from "@/hooks";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
  listSellerMyProductsAction,
  createSellerProductAction,
  sellerUpdateProductAction,
  sellerDeleteProductAction,
} from "@/actions";
import type { AdminProduct } from "@/components";

const PAGE_SIZE = 25;

/**
 * useSellerProducts
 *
 * Handles data fetching and CRUD mutations for the seller products page.
 * Uses productService — no direct apiClient calls.
 */
export function useSellerProducts(
  userId: string | undefined,
  table: ReturnType<typeof useUrlTable>,
) {
  const searchParam = table.get("q");
  const statusParam = table.get("status");
  const categoryParam = table.get("category");
  const conditionParam = table.get("condition");
  const minPriceParam = table.get("minPrice");
  const maxPriceParam = table.get("maxPrice");
  const page = table.getNumber("page", 1);
  const sortParam = table.get("sort") || "-createdAt";

  const queryParams = useMemo(() => {
    if (!userId) return null;
    const filtersArr = [`sellerId==${userId}`];
    if (searchParam) filtersArr.push(`title@=*${searchParam}`);
    if (statusParam) filtersArr.push(`status==${statusParam}`);
    if (categoryParam) filtersArr.push(`category==${categoryParam}`);
    if (conditionParam) filtersArr.push(`condition==${conditionParam}`);
    if (minPriceParam) filtersArr.push(`price>=${minPriceParam}`);
    if (maxPriceParam) filtersArr.push(`price<=${maxPriceParam}`);
    return new URLSearchParams({
      filters: filtersArr.join(","),
      pageSize: String(PAGE_SIZE),
      page: String(page),
      sorts: sortParam,
    }).toString();
  }, [
    userId,
    searchParam,
    page,
    sortParam,
    statusParam,
    categoryParam,
    conditionParam,
    minPriceParam,
    maxPriceParam,
  ]);

  const { data, isLoading, refetch } = useQuery<{
    items: AdminProduct[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasMore: boolean;
  }>({
    queryKey: ["seller-products-list", table.params.toString(), userId ?? ""],
    queryFn: async () => {
      const sp = new URLSearchParams(queryParams!);
      return listSellerMyProductsAction({
        filters: sp.get("filters") ?? undefined,
        sorts: sp.get("sorts") ?? undefined,
        page: sp.has("page") ? Number(sp.get("page")) : undefined,
        pageSize: sp.has("pageSize") ? Number(sp.get("pageSize")) : undefined,
      }) as any;
    },
    enabled: !!queryParams,
  });

  const deleteMutation = useMutation<void, Error, string>({
    mutationFn: (id) => sellerDeleteProductAction(id),
  });

  const createMutation = useMutation<void, Error, Partial<AdminProduct>>({
    mutationFn: (product) =>
      createSellerProductAction(product) as unknown as Promise<void>,
  });

  const updateMutation = useMutation<
    void,
    Error,
    Partial<AdminProduct> & { id: string }
  >({
    mutationFn: ({ id, ...rest }) =>
      sellerUpdateProductAction(id, rest) as unknown as Promise<void>,
  });

  return {
    data,
    isLoading,
    refetch,
    deleteMutation,
    createMutation,
    updateMutation,
    PAGE_SIZE,
  };
}

// --- Standalone mutations for create/edit pages ---

export function useCreateSellerProduct(
  onSuccess?: () => void,
  onError?: () => void,
) {
  return useMutation<void, Error, Partial<AdminProduct>>({
    mutationFn: (product) => createSellerProductAction(product),
    onSuccess,
    onError,
  });
}

export function useUpdateSellerProduct(id: string, onSuccess?: () => void) {
  return useMutation<void, Error, Partial<AdminProduct>>({
    mutationFn: (data) =>
      sellerUpdateProductAction(id, data) as unknown as Promise<void>,
    onSuccess,
  });
}
