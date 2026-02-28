"use client";

import { useApiQuery } from "./useApiQuery";
import { productService } from "@/services";
import type { ProductDocument } from "@/db/schema";

type RelatedProduct = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "price"
  | "currency"
  | "mainImage"
  | "status"
  | "featured"
  | "isAuction"
  | "currentBid"
  | "isPromoted"
  | "category"
>;

interface RelatedProductsResponse {
  items: RelatedProduct[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

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
) {
  const params = `pageSize=${limit}&filters=status==published,category==${encodeURIComponent(category)}&sorts=-createdAt`;

  return useApiQuery<RelatedProductsResponse>({
    queryKey: ["related-products", category, excludeId],
    queryFn: () => productService.list(params),
    enabled: Boolean(category),
    cacheTTL: 5 * 60 * 1000,
  });
}
