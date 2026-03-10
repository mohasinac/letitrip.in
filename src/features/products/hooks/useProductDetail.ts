"use client";

import { useApiQuery } from "@/hooks";
import { productService } from "@/services";
import type { ProductDocument } from "@/db/schema";

interface UseProductDetailOptions {
  initialData?: ProductDocument;
}

/**
 * useProductDetail
 * Wraps `productService.getById(slug)` for the product detail view.
 * `options.initialData` — server-prefetched post data; prevents initial client fetch.
 */
export function useProductDetail(
  slug: string,
  options?: UseProductDetailOptions,
) {
  const { data, isLoading, error } = useApiQuery<ProductDocument>({
    queryKey: ["product", slug],
    queryFn: () => productService.getById(slug),
    enabled: Boolean(slug),
    initialData: options?.initialData,
  });

  return { product: data ?? null, isLoading, error };
}
