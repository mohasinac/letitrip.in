import type { Metadata } from "next";
import { getAdminDb } from "@mohasinac/appkit/providers/db-firebase";
import { searchEverything, SEARCH_SOURCES, safeRead } from "@mohasinac/appkit/server";
import { getSiteSettingsSafe } from "@mohasinac/appkit/server";
import { SearchResultsClient } from "@mohasinac/appkit/features/search/components/SearchResultsClient";
import { SEARCH_GROUP_LABELS } from "./labels";

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
 *
 * ## 🛑 The kill switch decides WHICH TIER PAYS, and the normal case is free
 *
 * With the local index on — the default — this page does **no Firestore
 * search at all**. It reads the settings singleton (one cached read, already
 * needed) and hands the browser an empty envelope; the artifact answers, over
 * every one of the 21 indexed types, with mid-word matching and exact counts.
 *
 * With it off, the server fan-out runs exactly as before: up to ~60 reads
 * across nine collections. That is the whole point of keeping
 * `SEARCH_SOURCES` rather than deleting it — a kill switch needs somewhere to
 * fall back TO, and a flag that merely turns a feature off leaves the page
 * blank.
 *
 * Doing BOTH on every request was the obvious alternative and is the wrong
 * trade: it would spend 60 reads per visit to pre-render a result the client
 * discards a second later.
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
   * 🛑 `!== false`. Default ON: an unseeded document, an absent `search`
   * group and a failed settings read all leave the local index in play.
   * `getSiteSettingsSafe` already returns null rather than throwing, so the
   * optional chain collapsing is the normal path, not an edge case.
   */
  const settings = await getSiteSettingsSafe();
  const indexEnabled = settings?.search?.indexEnabled !== false;

  const empty = { q, terms: [], groups: [], totalHits: 0 };

  /*
   * 🛑 `safeRead` on the fallback branch, because this page is reached by
   * `await searchParams` and is therefore dynamic — but Next still ATTEMPTS
   * to prerender it, and an unguarded throw during that attempt is fatal to
   * the production build (Root Cause #89's caveat). An empty result renders
   * the "nothing matched" state, which is the honest degradation here.
   */
  const initialResult = indexEnabled
    ? empty
    : await safeRead(() => searchEverything(getAdminDb(), q, SEARCH_SOURCES), {
        route: "/search",
        key: "search.everything",
        fallback: empty,
      });

  return (
    <SearchResultsClient
      q={q}
      initialResult={initialResult}
      indexEnabled={indexEnabled}
      labels={SEARCH_GROUP_LABELS}
    />
  );
}
