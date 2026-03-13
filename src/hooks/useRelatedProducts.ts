"use client";

import { useQuery } from "@tanstack/react-query";
import { listProductsAction } from "@/actions";
import type { ProductDocument } from "@/db/schema";

type RelatedProduct = Pick<
  ProductDocument,
  | "id"
  | "title"
  | "description"
  | "price"
  | "currency"
  | "mainImage"
  | "images"
  | "video"
  | "status"
  | "featured"
  | "isAuction"
  | "currentBid"
  | "isPromoted"
  | "slug"
  | "category"
  | "availableQuantity"
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
  isAuction = false,
) {
  return useQuery<RelatedProductsResponse>({
    queryKey: ["related-products", category, excludeId, String(isAuction)],
    queryFn: () =>
      listProductsAction({
        filters: `status==published,category==${encodeURIComponent(category)},isAuction==${isAuction}`,
        sorts: "-createdAt",
        pageSize: limit,
      }) as unknown as Promise<RelatedProductsResponse>,
    enabled: Boolean(category),
    staleTime: 5 * 60 * 1000,
  });
}
