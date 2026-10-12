import type { Metadata } from "next";
import { getAdminDb } from "@mohasinac/appkit/providers/db-firebase";
import { searchEverything, SEARCH_SOURCES, safeRead } from "@mohasinac/appkit/server";
import { SearchResultsPageView } from "@mohasinac/appkit/features/search/components/SearchResultsPageView";

/**
 * D2 Fix 4 — `/search` is a real cross-resource page.
 *
 * It was a pure REDIRECT: a `Record<SearchResourceType, string>` of 15 entries
 * that sent you to one browse route. So there was no cross-resource search at
 * all — a buyer searching "dranzer" could not learn that we have a product, a
 * category, a blog post and an FAQ about it.
 *
 * 🛑 STILL `noindex`, deliberately rather than by inheritance. A search results
 * page is the classic crawl trap — one URL per query string, thin content, no
 * canonical answer to index. The groups link out to the real indexable listing
 * pages, which is where crawl value belongs.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<Record<string, string | string[]>>;
};

export default async function SearchPage({ searchParams }: Props) {
  const params = await searchParams;
  const q = (Array.isArray(params.q) ? params.q[0] : params.q) ?? "";

  /*
   * 🛑 `safeRead`, because this page is reached by `await searchParams` and is
   * therefore dynamic — but Next still ATTEMPTS to prerender it, and an
   * unguarded throw during that attempt is fatal to the production build
   * (Root Cause #89's caveat). An empty result renders the "nothing matched"
   * state, which is the honest degradation for a search page.
   */
  const result = await safeRead(
    () => searchEverything(getAdminDb(), q, SEARCH_SOURCES),
    {
      route: "/search",
      key: "search.everything",
      fallback: { q, terms: [], groups: [], totalHits: 0 },
    },
  );

  return <SearchResultsPageView result={result} />;
}
