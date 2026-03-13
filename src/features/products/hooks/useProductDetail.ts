"use client";

import { useQuery } from "@tanstack/react-query";
import { getProductByIdAction } from "@/actions";
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
  const { data, isLoading, error } = useQuery<ProductDocument | null>({
    queryKey: ["product", slug],
    queryFn: () => getProductByIdAction(slug),
    enabled: Boolean(slug),
    initialData: options?.initialData ?? undefined,
  });

  return { product: data ?? null, isLoading, error };
}
