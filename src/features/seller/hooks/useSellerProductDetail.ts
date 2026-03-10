"use client";

import { useApiQuery } from "@/hooks";
import { productService } from "@/services";
import type { AdminProduct } from "@/components";

/**
 * useSellerProductDetail
 * Wraps `productService.getById(id)` for the seller's edit-product form.
 * Uses queryKey "seller-product-edit" to avoid collisions with public product cache.
 */
export function useSellerProductDetail(id: string | undefined) {
  const { data, isLoading, error } = useApiQuery<AdminProduct>({
    queryKey: ["seller-product-edit", id ?? ""],
    queryFn: () => productService.getById(id!),
    enabled: !!id,
  });

  return { productData: data ?? null, isLoading, error };
}
