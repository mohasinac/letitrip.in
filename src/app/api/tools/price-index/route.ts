import { withProviders } from "@/providers.config";
import { createApiHandler, successResponse } from "@mohasinac/appkit";
import { cachedSearchPriceIndex } from "@/lib/cache/price-index";

/**
 * GET /api/tools/price-index?q=… — what things actually sold for, by leaf.
 *
 * 🛑 PUBLIC by decision — `createApiHandler` with no `roles` and no
 * `permission`, which `audit-route-rbac` recognises as exactly that ("omitting
 * = public endpoint"). No `rbac-public:` marker: that escape hatch was removed
 * from the codebase, and `audit-no-suppression-comments` is strict-zero on it.
 *
 * The reasoning is in the module docstring on `searchPriceIndex`; in short, the
 * guest price gate protects live ASKS, and a day-stale aggregate of completed
 * sales is a different object. No individual listing price, seller identity or
 * buyer identity is in the response, and no band below the confidence
 * threshold carries a figure.
 *
 * 🛑 Edge-cached for an hour, and that is not an optimisation — it is what
 * makes the surface affordable. The underlying data is recomputed once a day by
 * `priceIndexRollup`, so a shorter TTL would buy nothing but invocations on a
 * project that was paused for exceeding its allowance (Root Cause #104). `q` is
 * the whole cache key, so a repeat lookup of a popular model costs nothing.
 *
 * 🛑 And behind the edge cache there is now a DATA cache, shared with the
 * `/tools/price-index` PAGE. That page calls the data function directly rather
 * than fetching this route, so it was never covered by the header below — it
 * paid full Firestore cost on every view. Both callers go through
 * `cachedSearchPriceIndex`, so they share one entry per (query, hour).
 *
 * Cost per MISS of BOTH caches: one `searchTxt` push-down query plus one
 * `db.getAll`. Both bounded by `PRICE_INDEX_SEARCH_LIMIT`.
 */
export const GET = withProviders(
  createApiHandler({
    handler: async ({ request }) => {
      const q = new URL(request.url).searchParams.get("q") ?? "";
      const data = await cachedSearchPriceIndex(q);
      const response = successResponse(data);
      /*
       * Set on the response rather than passed to `successResponse`, which
       * takes `(data, message, status, meta)` and has no headers parameter —
       * the same shape `/api/site-settings` uses.
       */
      response.headers.set(
        "Cache-Control",
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      );
      return response;
    },
  }),
);
