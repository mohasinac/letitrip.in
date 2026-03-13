"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductByIdAction } from "@/actions";
import type { ProductDocument } from "@/db/schema";

/**
 * useSellerProductDetail
 * Fetches a product via Server Action for the seller's edit-product form (2-hop).
 * Uses queryKey "seller-product-edit" to avoid collisions with public product cache.
 */
export function useSellerProductDetail(id: string | undefined) {
  const { data, isLoading, error } = useQuery<ProductDocument | null>({
    queryKey: ["seller-product-edit", id ?? ""],
    queryFn: () => getProductByIdAction(id!),
    enabled: !!id,
  });

  return { productData: data ?? null, isLoading, error };
}
