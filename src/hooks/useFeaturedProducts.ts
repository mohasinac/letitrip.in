"use client";

import { useApiQuery } from "./useApiQuery";
import { productService } from "@/services";
import type { ProductDocument } from "@/db/schema";

/**
 * useFeaturedProducts
 * Fetches promoted/featured products for the homepage featured section.
 * Returns up to 18 published, promoted products sorted by newest.
 */
export function useFeaturedProducts() {
  return useApiQuery<ProductDocument[]>({
    queryKey: ["products", "featured"],
    queryFn: () =>
      productService.list("isPromoted=true&status=published&pageSize=18"),
    cacheTTL: 5 * 60 * 1000, // 5 minutes
  });
}
