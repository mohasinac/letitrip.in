import { ImageResponse } from "next/og";
import { partSlotFromSegment } from "@mohasinac/appkit";
import { getPartByKey, renderPartOg, safeRead } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ classification: string; code: string }> };

export default async function Image({ params }: Props) {
  const { classification, code } = await params;
  const slot = partSlotFromSegment(classification);
  const siteName = SEO_CONFIG.siteName ?? "LetItRip";
  if (!slot) return new ImageResponse(renderPartOg(null, 0, { siteName }), { ...size });

  const part = await safeRead(() => getPartByKey(slot, code), {
    route: "/parts/[classification]/[code]/opengraph-image",
    key: "parts.getPartByKey",
    fallback: null,
  });
  /*
   * `usedBy` is a stored array on the part, so the count is free — no second
   * read, and no `getAll` to hydrate documents the card does not render.
   */
  return new ImageResponse(
    renderPartOg(part, part?.usedBy?.length ?? 0, { siteName }),
    { ...size },
  );
}
