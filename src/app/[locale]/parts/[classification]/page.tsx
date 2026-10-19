import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  PartClassificationPageView,
  PART_SLOT_LABEL,
  partSlotFromSegment,
  ROUTES,
} from "@mohasinac/appkit";
import { listPartsBySlot, safeRead } from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants/seo.server";

/**
 * D12 — every part in one classification.
 *
 * 🛑 `partSlotFromSegment` returns `null` rather than casting, so an unknown
 * segment 404s. A bare `as PartSlot` would turn `/parts/nonsense` into a
 * perfectly successful query for a slot no document has — zero rows, HTTP
 * 200, and an empty page that reads as "we have no attack rings".
 *
 * 🛑 No `generateStaticParams`. Every `[slug]` content detail route in this
 * app is dynamic (measured: none appears in `.next/prerender-manifest.json`),
 * and the cold build already peaks at ~8,100 MB against an 8,192 MB ceiling —
 * prerendering 20 classification pages plus 753 part pages is the one change
 * here that could push it over.
 */
type Props = { params: Promise<{ classification: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { classification } = await params;
  const slot = partSlotFromSegment(classification);
  if (!slot) return {};
  const label = PART_SLOT_LABEL[slot];
  return _gm({
    title: `${label} — Beyblade parts gallery — LetItRip`,
    description: `Every ${label.toLowerCase()} we have a record of, with its code, weight and the models that use it.`,
    path: `/parts/${classification}`,
  });
}

export default async function PartClassificationPage({ params }: Props) {
  const { classification } = await params;
  const slot = partSlotFromSegment(classification);
  if (!slot) notFound();

  /*
   * `safeRead`, because a dynamic segment is still ATTEMPTED during prerender
   * and an unguarded throw there is fatal to the production build (Root Cause
   * #89's caveat). An empty bucket renders the honest "none recorded" state.
   */
  const result = await safeRead(() => listPartsBySlot(slot), {
    route: "/parts/[classification]",
    key: "parts.listBySlot",
    fallback: { parts: [], truncated: false },
  });

  return (
    <PartClassificationPageView
      slot={slot}
      parts={result.parts}
      truncated={result.truncated}
      hrefForPart={(c, code) => String(ROUTES.PUBLIC.PART_DETAIL(c, code))}
      partsIndexHref={String(ROUTES.PUBLIC.PARTS)}
    />
  );
}
