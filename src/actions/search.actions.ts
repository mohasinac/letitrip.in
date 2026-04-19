"use server";

/**
 * Search Server Action — thin wrapper
 *
 * Business logic lives in @mohasinac/appkit/features/search.
 * This wrapper adds Next.js server-action semantics.
 */

import { searchProducts, type SearchProductsResult } from "@mohasinac/appkit/server";
import type { SearchQuery } from "@mohasinac/appkit/server";

export type { SearchQuery, SearchProductsResult };

// Backwards-compat alias
export type SearchParams = SearchQuery;
export type SearchResult = SearchProductsResult;

export async function searchProductsAction(
  params: SearchQuery = {},
): Promise<SearchProductsResult> {
  return searchProducts(params);
}

