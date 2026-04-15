"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import type { ProductDocument } from "@/db/schema";

/**
 * useSellerProductDetail
 * Fetches a product via GET /api/products/[id] for the seller's edit-product form.
 * Uses queryKey "seller-product-edit" to avoid collisions with public product cache.
 */
export function useSellerProductDetail(id: string | undefined) {
  const { data, isLoading, error } = useQuery<ProductDocument | null>({
    queryKey: ["seller-product-edit", id ?? ""],
    queryFn: () => apiClient.get<ProductDocument>(`/api/products/${id}`),
    enabled: !!id,
  });

  return { productData: data ?? null, isLoading, error };
}

