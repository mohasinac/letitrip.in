"use server";

/**
 * Search Server Action
 *
 * Replaces the former searchService → apiClient → /api/search route chain
 * (5 hops → 2 hops). Uses Firestore Sieve search only.
 */

import { productRepository } from "@/repositories";
import { serverLogger } from "@/lib/server-logger";
import type { FirebaseSieveResult } from "@/lib/query";

export interface SearchParams {
  q?: string;
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  isAuction?: boolean;
  isPreOrder?: boolean;
  inStock?: boolean;
  minRating?: number;
  sort?: string;
  page?: number;
  pageSize?: number;
}

export interface SearchResult extends FirebaseSieveResult<
  import("@/db/schema").ProductDocument
> {
  q: string;
  backend: "in-memory";
}

export async function searchProductsAction(
  params: SearchParams = {},
): Promise<SearchResult> {
  const {
    q = "",
    category,
    subcategory,
    minPrice = 0,
    maxPrice = 0,
    condition,
    isAuction,
    isPreOrder,
    inStock,
    minRating = 0,
    sort = "-createdAt",
    page = 1,
    pageSize = 20,
  } = params;

  const filterParts: string[] = ["status==published"];
  if (category) filterParts.push(`category==${category}`);
  if (subcategory) filterParts.push(`subcategory==${subcategory}`);
  if (minPrice > 0) filterParts.push(`price>=${minPrice}`);
  if (maxPrice > 0 && maxPrice >= minPrice)
    filterParts.push(`price<=${maxPrice}`);
  if (condition) filterParts.push(`condition==${condition}`);
  if (isAuction === true) filterParts.push("isAuction==true");
  if (isPreOrder === true) filterParts.push("isPreOrder==true");
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
