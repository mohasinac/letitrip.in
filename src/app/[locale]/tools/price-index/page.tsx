import { PriceIndexToolView } from "@mohasinac/appkit";
import { cachedSearchPriceIndex } from "@/lib/cache/price-index";
import { safeRead } from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const metadata = _gm({
  title: "What it sold for — realised prices on LetItRip",
  description:
    "Search any Beyblade, part or set to see what it actually sold for on LetItRip: the range, the median, the average and the most recent sale, broken down by condition.",
  path: "/tools/price-index",
});

/**
 * 🛑 SSR'd from `?q=` so a shared link reproduces the lookup, and so the page a
 * crawler sees carries real content rather than an empty search box.
 *
 * `searchParams` makes this route fully dynamic, which is correct here: the
 * response varies per query, and a route-segment `revalidate` on a dynamic
 * route is silently inert (Root Cause #94).
 *
 * 🛑 This comment used to say the cost was covered because
 * "`/api/tools/price-index` carries the 1-hour edge cache". It is not, and that
 * was the bug: this page calls the data function DIRECTLY, server-side, so it
 * never issues an HTTP request and no `Cache-Control` on that route could ever
 * apply to it. Every page view paid a full render plus a `searchTxt` push-down
 * and a `db.getAll`, uncached, against a 50K-reads/day allowance.
 *
 * `cachedSearchPriceIndex` is the fix and is shared with the API route, so both
 * resolve to ONE entry per (query, hour): the render still costs an invocation,
 * and costs zero Firestore reads on a hit.
 */
export default async function PriceIndexToolPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = sp.q;
  const q = (Array.isArray(raw) ? raw[0] : raw) ?? "";

  // A failed lookup must not 500 the page — the search box still works.
  const initialData = q
    ? await safeRead(() => cachedSearchPriceIndex(q), {
        route: "/tools/price-index",
        key: "searchPriceIndex",
        fallback: null,
      })
    : null;

  return <PriceIndexToolView initialQuery={q} initialData={initialData} />;
}
