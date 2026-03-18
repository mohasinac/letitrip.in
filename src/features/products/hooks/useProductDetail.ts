"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient, ApiClientError } from "@mohasinac/http";
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
  const { data, isLoading, error } = useQuery<ProductDocument | null>({
    queryKey: ["product", slug],
    queryFn: async () => {
      try {
        return await apiClient.get<ProductDocument>(`/api/products/${slug}`);
      } catch (e) {
        if (e instanceof ApiClientError && e.status === 404) return null;
        throw e;
      }
    },
    enabled: Boolean(slug),
    initialData: options?.initialData ?? undefined,
  });

  return { product: data ?? null, isLoading, error };
}
