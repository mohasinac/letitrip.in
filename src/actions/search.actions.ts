"use server";

/**
 * Search Server Action
 *
 * Replaces the former searchService → apiClient → /api/search route chain
 * (5 hops → 2 hops). Calls Algolia or falls back to Firestore Sieve search.
 */

import { productRepository } from "@/repositories";
import { isAlgoliaConfigured, algoliaSearch } from "@/lib/search/algolia";
import { serverLogger } from "@/lib/server-logger";
import type { FirebaseSieveResult } from "@/lib/query";

export interface SearchParams {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResult extends FirebaseSieveResult<
  import("@/db/schema").ProductDocument
> {
  q: string;
  backend: "algolia" | "in-memory";
}

export async function searchProductsAction(
  params: SearchParams = {},
): Promise<SearchResult> {
  const {
    q = "",
    category,
    minPrice = 0,
    maxPrice = 0,
    sort = "-createdAt",
    page = 1,
    pageSize = 20,
  } = params;

  if (isAlgoliaConfigured()) {
    const algoliaResult = await algoliaSearch({
      q,
      category,
      minPrice,
      maxPrice,
      sort,
      page,
      pageSize,
    });

    serverLogger.info("searchProductsAction (Algolia)", {
      q: q || "(empty)",
      total: algoliaResult.total,
    });

    return {
      ...algoliaResult,
      q,
      backend: "algolia",
    } as unknown as SearchResult;
  }

  const filterParts: string[] = ["status==published"];
  if (category) filterParts.push(`category==${category}`);
  if (minPrice > 0) filterParts.push(`price>=${minPrice}`);
  if (maxPrice > 0 && maxPrice >= minPrice)
    filterParts.push(`price<=${maxPrice}`);
  if (q.trim()) filterParts.push(`title_=${q.trim()}`);

  const sieveResult = await productRepository.list({
    filters: filterParts.join(","),
    sorts: sort,
    page,
    pageSize,
  });

  serverLogger.info("searchProductsAction (Firestore-native)", {
    q: q || "(empty)",
    total: sieveResult.total,
  });

  return { ...sieveResult, q, backend: "in-memory" };
}
