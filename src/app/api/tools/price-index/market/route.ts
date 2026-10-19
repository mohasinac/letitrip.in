import { withProviders } from "@/providers.config";
import { createRouteHandler } from "@mohasinac/appkit";
import { getPriceIndexMarketForIds } from "@mohasinac/appkit/server";
import { NextResponse } from "next/server";

/**
 * GET /api/tools/price-index/market?ids=a,b,c — the typical ASK per leaf,
 * from the competitor crawl.
 *
 * 🛑 SIGNED-IN ONLY, and that is the whole reason this is its own route rather
 * than two more fields on the sibling `bands` endpoint.
 *
 * The sold half is public and edge-cached on purpose: a day-stale aggregate of
 * our OWN completed sales is not what the guest price gate protects. The market
 * half is the opposite call, already decided and written down at
 * `categories/api/[id]/price-guidance/route.ts` — publishing a
 * competitor-derived band on an unauthenticated, publicly-cacheable response
 * "would be exactly the 'a neighbouring surface publishes the range' leak that
 * gate exists to close".
 *
 * Had this been merged into `bands`, one signed-in lookup would have populated
 * a shared public cache entry that every guest then reads — which is both the
 * leak and the `cachedPublicRead` rule it breaks.
 *
 * `auth: true` with no `roles` and no `permission`: any signed-in user, which
 * is the gate the owner chose. `audit-route-rbac` wants a known handler factory
 * and treats roles/permission as optional, so this satisfies it without a
 * suppression marker (both of those are banned anyway).
 *
 * Cost: two batched reads via `resolveInheritedGuidanceMany`, bounded by
 * `PRICE_INDEX_SEARCH_LIMIT`. Never N+1 — the ancestor union is fetched once
 * for every leaf in the request together.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ request }): Promise<NextResponse> => {
      const raw = new URL(request.url).searchParams.get("ids") ?? "";
      const ids = raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const results = await getPriceIndexMarketForIds(ids);

      return NextResponse.json(
        { success: true, data: { results } },
        {
          /*
           * 🛑 `private`, never `public`. The response does not vary by viewer
           * today, but the URL is identical for every caller and only the
           * session distinguishes who may have it — so a shared cache entry is
           * the one thing that would undo the gate above. Same posture as
           * `/api/categories/[id]/price-guidance`.
           *
           * An hour is safe: the band is seeded, re-measured only when a crawl
           * is re-run, and `asOf` travels with it.
           */
          headers: { "Cache-Control": "private, max-age=3600" },
        },
      );
    },
  }),
);
