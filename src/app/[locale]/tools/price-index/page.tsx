import { PriceIndexToolView, searchPriceIndex } from "@mohasinac/appkit";
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
 * `searchParams` makes this route fully dynamic — which is correct here and not
 * an oversight: the response varies per query, and `/api/tools/price-index`
 * carries the 1-hour edge cache that makes the repeat cost nothing.
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
    ? await safeRead(() => searchPriceIndex(q), {
        route: "/tools/price-index",
        key: "searchPriceIndex",
        fallback: null,
      })
    : null;

  return <PriceIndexToolView initialQuery={q} initialData={initialData} />;
}
