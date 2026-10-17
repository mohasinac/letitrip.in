import { unstable_cache } from "next/cache";

/**
 * A CROSS-REQUEST data cache for expensive public reads.
 *
 * ## The gap this fills
 *
 * Before this, the only caching primitive in use was `React.cache`, which
 * memoises within ONE render pass — it stops a page and its `generateMetadata`
 * from issuing the same query twice and does nothing at all for the next
 * visitor. There was no cross-request data cache anywhere: `CacheManager` /
 * `withCache()` exist but `withCache` has zero call sites, and `CacheManager`
 * is a per-lambda `Map` that never touched Next's cache (Root Cause #104).
 *
 * So a dynamic page did its Firestore work on every single request.
 *
 * ## Why `unstable_cache` and not a route-segment `revalidate`
 *
 * `revalidate` caches the RENDER, and a route that reads `searchParams` is
 * dynamic — the declaration is then silently inert (Root Cause #94: 14 of the
 * app's 33 short-window declarations were dead for exactly this reason). This
 * caches the DATA instead, keyed on the arguments, so a page that legitimately
 * varies per query still pays one function invocation but ZERO Firestore reads
 * on a hit.
 *
 * That is the right trade for this project: the binding constraint is Firestore
 * (50K reads/day on the Blaze free tier) and Vercel invocations, and a read
 * that is cached here costs neither on a repeat.
 *
 * 🛑 `cacheComponents` is OFF (verified in `next.config.js`), which is what
 * makes `unstable_cache` the correct API rather than `"use cache"`. Turning
 * that flag on would remove `revalidate`/`dynamic`/`fetchCache` across all 80
 * declarations at once — see CLAUDE.md § "Caching semantics". Do not enable it
 * to tidy this up.
 *
 * ## Rules for anything wrapped here
 *
 * 1. **Public, non-personalised reads only.** The cache key is the arguments —
 *    it does NOT include the session. Wrapping a per-viewer read would serve
 *    one user's data to the next, which is the worst bug this file could cause.
 *    Anything that varies by `getServerSessionUser()` is disqualified.
 * 2. **No `Encrypted` / PII in the return value.** Same reason, plus a cached
 *    payload outlives the request that authorised it.
 * 3. **Name the tag** so a writer can invalidate deliberately rather than
 *    waiting out the TTL.
 */

/** Tags, so an invalidating writer has a name to call rather than a string. */
export const CACHE_TAGS = {
  /**
   * Realised-sale aggregates. Recomputed once a day by the `priceIndexRollup`
   * scheduled Function, which is why the TTL below is an hour and not a minute:
   * a shorter window cannot surface fresher data than exists, so it would buy
   * nothing but invocations.
   */
  PRICE_INDEX: "price-index",
} as const;

/** One hour, matching `/api/tools/price-index`'s edge cache. */
export const PUBLIC_READ_TTL_SECONDS = 3600;

/**
 * Wrap a public read so repeat calls across requests cost nothing.
 *
 * `keyParts` is the cache-key PREFIX — the arguments are appended by Next, so
 * two different queries never collide. Pass something stable and specific; a
 * prefix reused by two different functions merges their caches.
 */
export function cachedPublicRead<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  keyParts: string[],
  opts: { tags: string[]; revalidate?: number },
): (...args: TArgs) => Promise<TResult> {
  return unstable_cache(fn, keyParts, {
    tags: opts.tags,
    revalidate: opts.revalidate ?? PUBLIC_READ_TTL_SECONDS,
  });
}
