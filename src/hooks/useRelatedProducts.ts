"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@mohasinac/appkit/http";
import type {
  ProductItem,
  ProductListResponse,
} from "@mohasinac/appkit/features/products";

type RelatedProduct = ProductItem;
type RelatedProductsResponse = ProductListResponse;

/**
 * useRelatedProducts
 * Fetches products in the same category, excluding a given product.
 *
 * @param category  - Category name/slug to match
 * @param excludeId - Product ID to exclude from results
 * @param limit     - Number of related products to return (default: 8)
 */
export function useRelatedProducts(
  category: string,
  excludeId: string,
  limit = 8,
  isAuction = false,
) {
  const params = new URLSearchParams({
    filters: `status==published,category==${encodeURIComponent(category)},isAuction==${isAuction}`,
    sorts: "-createdAt",
    pageSize: String(limit),
  });

  return useQuery<RelatedProductsResponse>({
    queryKey: ["related-products", category, excludeId, String(isAuction)],
    queryFn: () =>
      apiClient.get<RelatedProductsResponse>(
        `/api/products?${params.toString()}`,
      ),
    enabled: Boolean(category),
    staleTime: 5 * 60 * 1000,
  });
}
