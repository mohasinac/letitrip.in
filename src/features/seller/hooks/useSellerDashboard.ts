"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import { API_ENDPOINTS } from "@/constants";
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

interface SellerProductsApiResult {
  products: SellerDashboardProductsResponse["items"];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * useSellerDashboard
 * Fetches the seller's products via GET /api/seller/products for dashboard stats.
 * Returns all seller products (up to 200) to compute status-based counts.
 */
export function useSellerDashboard(userId: string | undefined) {
  const { data, isLoading, error } = useQuery<SellerDashboardProductsResponse>({
    queryKey: ["seller-products", userId ?? ""],
    queryFn: async () => {
      const result = await apiClient.get<SellerProductsApiResult>(
        `${API_ENDPOINTS.SELLER.PRODUCTS}?pageSize=200`,
      );
      return {
        items: result.products,
        total: result.meta.total,
        page: result.meta.page,
        pageSize: result.meta.limit,
        totalPages: result.meta.totalPages,
        hasMore: result.meta.hasMore,
      };
    },
    enabled: !!userId,
  });

  return { productsData: data ?? null, isLoading, error };
}
