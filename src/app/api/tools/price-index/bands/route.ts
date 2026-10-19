import { withProviders } from "@/providers.config";
import { createApiHandler, successResponse } from "@mohasinac/appkit";
import { getPriceIndexBandsForIds } from "@mohasinac/appkit/server";

/**
 * GET /api/tools/price-index/bands?ids=a,b,c — the multi-get half of price
 * search, with resolution already done.
 *
 * ## Tier 1 adoption
 *
 * `searchPriceIndex` (behind `/api/tools/price-index?q=`) is two steps: a
 * `searchTxt` push-down query to resolve a free-text term to category
 * leaves, then one multi-get for their sale bands. The FIRST step is now
 * free — `PriceIndexToolView` resolves candidate leaves from the public
 * search artifact in the browser, at zero Firestore reads — so this route
 * exists to be the second step alone.
 *
 * Same cache posture as the query-based route: public, edge-cached, no
 * individual listing price, seller or buyer identity in the response.
 * `ids` is the whole cache key, same as `q` is on the sibling route.
 *
 * 🛑 PUBLIC by decision, same reasoning as `/api/tools/price-index` — the
 * module docstring on `searchPriceIndex` has the full argument. A day-stale
 * aggregate of completed sales is not the thing the guest price gate exists
 * to protect.
 */
export const GET = withProviders(
  createApiHandler({
    handler: async ({ request }) => {
      const raw = new URL(request.url).searchParams.get("ids") ?? "";
      const ids = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const results = await getPriceIndexBandsForIds(ids);
      const response = successResponse({ results });
      response.headers.set(
        "Cache-Control",
        "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      );
      return response;
    },
  }),
);
