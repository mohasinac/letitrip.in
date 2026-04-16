"use server";

/**
 * Search Server Action — thin wrapper
 *
 * Business logic lives in @mohasinac/appkit/features/search.
 * This wrapper adds Next.js server-action semantics.
 */

import { searchProducts } from "@mohasinac/appkit/features/search";
import type { SearchQuery } from "@mohasinac/appkit/features/search";
import type { SearchProductsResult } from "@mohasinac/appkit/features/search";

export type { SearchQuery, SearchProductsResult };

// Backwards-compat alias
export type SearchParams = SearchQuery;
export type SearchResult = SearchProductsResult;

export async function searchProductsAction(
  params: SearchQuery = {},
): Promise<SearchProductsResult> {
  return searchProducts(params);
}

