"use client";

import { useQuery } from "@tanstack/react-query";
import { sellerService } from "@/services";
import type { ProductDocument } from "@/db/schema";

export interface SellerDashboardProductsResponse {
  items: Pick<
    ProductDocument,
    "id" | "title" | "status" | "isAuction" | "price" | "mainImage"
  >[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * useSellerDashboard
 * Wraps `sellerService.listProducts(userId)` for the seller dashboard stats.
 * Returns all seller products to compute status-based counts.
 */
export function useSellerDashboard(userId: string | undefined) {
  const { data, isLoading, error } = useQuery<SellerDashboardProductsResponse>({
    queryKey: ["seller-products", userId ?? ""],
    queryFn: () => sellerService.listProducts(userId!),
    enabled: !!userId,
  });

  return { productsData: data ?? null, isLoading, error };
}
