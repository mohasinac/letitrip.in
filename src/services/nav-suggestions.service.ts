/**
 * Nav Suggestions Service
 *
 * Browser-safe service for fetching navigation page suggestions from the
 * Algolia `pages_nav` index. Called from `useNavSuggestions` hook.
 *
 * Uses the public NEXT_PUBLIC_ALGOLIA_SEARCH_API_KEY — safe to call from the
 * browser. Returns an empty array when Algolia is not configured so the search
 * overlay degrades gracefully without it.
 */
import { searchNavPages, type AlgoliaNavRecord } from "@/lib/search/algolia";

export const navSuggestionsService = {
  /**
   * Returns navigation page suggestions matching `query`.
   * @param query - The user's current search input
   * @param limit - Max results (default 6)
   */
  search: (query: string, limit = 6): Promise<AlgoliaNavRecord[]> =>
    searchNavPages(query, limit),
};
