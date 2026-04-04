"use client";

import { useProductDetail as useFeatProductDetail } from "@mohasinac/feat-products";
import type { ProductDocument } from "@/db/schema";

interface UseProductDetailOptions {
  initialData?: ProductDocument;
}

/**
 * useProductDetail
 * Fetches a single product by ID or slug via GET /api/products/[id].
 * `options.initialData` — server-prefetched post data; prevents initial client fetch.
 */
export function useProductDetail(
  slug: string,
  options?: UseProductDetailOptions,
) {
  return useFeatProductDetail<ProductDocument>(slug, {
    enabled: Boolean(slug),
    endpoint: `/api/products/${slug}`,
    queryKeyPrefix: "product",
    initialData: options?.initialData,
    transform: (item) => item as unknown as ProductDocument,
  });
}
