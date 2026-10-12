import { ImageResponse } from "next/og";
import { partSlotFromSegment } from "@mohasinac/appkit";
import { listPartsBySlot, renderPartClassificationOg, safeRead } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

// Node runtime, not edge — the `@mohasinac/appkit/server` chain reaches
// node:crypto, same reason as brands/[slug].
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ classification: string }> };

export default async function Image({ params }: Props) {
  const { classification } = await params;
  const slot = partSlotFromSegment(classification);
  // An OG endpoint must always return a PNG, so an unknown segment degrades to
  // the generic card rather than throwing — the PAGE is what 404s.
  if (!slot) {
    return new ImageResponse(
      renderPartClassificationOg("layer", 0, { siteName: SEO_CONFIG.siteName ?? "LetItRip" }),
      { ...size },
    );
  }
  const result = await safeRead(() => listPartsBySlot(slot), {
    route: "/parts/[classification]/opengraph-image",
    key: "parts.listBySlot",
    fallback: { parts: [], truncated: false },
  });
  return new ImageResponse(
    renderPartClassificationOg(slot, result.parts.length, {
      siteName: SEO_CONFIG.siteName ?? "LetItRip",
    }),
    { ...size },
  );
}
