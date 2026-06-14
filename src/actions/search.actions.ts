"use server";

import { wrapAction, type ActionResult } from "@mohasinac/appkit/server";
/**
 * Search Server Action â€” thin wrapper
 *
 * Business logic lives in @mohasinac/appkit/features/search.
 * This wrapper adds Next.js server-action semantics.
 */

import { searchProducts, type SearchProductsResult } from "@mohasinac/appkit";
import type { SearchQuery } from "@mohasinac/appkit";


// Backwards-compat alias
export type SearchParams = SearchQuery;
export type SearchResult = SearchProductsResult;

export async function searchProductsAction(
  params: SearchQuery = {},
): Promise<ActionResult<SearchProductsResult>> {
  return wrapAction(async () => {
    return searchProducts(params);
  });
}

