import { searchPriceIndex } from "@mohasinac/appkit";
import { CACHE_TAGS, cachedPublicRead } from "./cached-read";

/**
 * The cached price-index lookup, shared by the PAGE and the API route.
 *
 * ## 🛑 The page was never getting the API's cache
 *
 * `/tools/price-index`'s own comment claimed `searchParams` being dynamic was
 * fine because "`/api/tools/price-index` carries the 1-hour edge cache that
 * makes the repeat cost nothing". That was wrong in the one way that mattered:
 * the page calls `searchPriceIndex()` DIRECTLY, server-side. It never issues an
 * HTTP request, so the API's `Cache-Control` could not apply to it, and every
 * single page view paid a full render plus a `searchTxt` push-down query and a
 * `db.getAll` — uncached, against a 50K-reads/day Firestore allowance.
 *
 * The API route really was cached. The page just was not the API.
 *
 * ## One cache, two callers
 *
 * Both now call THIS function, so they share one entry per `(query, hour)`:
 *
 *   · a repeat HTTP hit is served by the edge cache and never reaches a lambda;
 *   · a page render, or an edge miss, is served by the data cache and never
 *     reaches Firestore.
 *
 * Keeping the wrapper in one module is what makes that true. Two separate
 * `unstable_cache` wrappers over the same function would be two cache entries
 * doing half the work each — and the key prefix is what distinguishes them, so
 * the mistake would be invisible.
 *
 * ## Safe to cache
 *
 * Checked against `cachedPublicRead`'s rules rather than assumed: the response
 * is a day-stale aggregate of COMPLETED sales, it carries no individual listing
 * price, no seller or buyer identity, and no figure at all for a band below the
 * confidence threshold. It does not vary by viewer, so a shared cache entry
 * cannot leak one visitor's data to the next — the guest price gate protects
 * live asks, which this is not (see `searchPriceIndex`'s own header).
 */
export const cachedSearchPriceIndex = cachedPublicRead(
  searchPriceIndex,
  ["tools", "price-index", "search"],
  { tags: [CACHE_TAGS.PRICE_INDEX] },
);
