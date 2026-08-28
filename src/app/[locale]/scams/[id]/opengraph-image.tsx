import { ImageResponse } from "next/og";
import { getScammerForDetail, renderScamOg, safeRead } from "@mohasinac/appkit/server";
import { SCAM_TYPE_LABELS } from "@mohasinac/appkit";
import { SEO_CONFIG } from "@/constants";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  // An OG endpoint must always return a PNG, so a failed read degrades to the
  // renderer's generic branded card — but is recorded rather than vanishing.
  const doc = await safeRead(() => getScammerForDetail(id), {
    route: "/scams/[id]",
    key: "scammers.getScammerForDetail",
    fallback: null,
  });
  const scamTypeLabel = doc?.scamType ? (SCAM_TYPE_LABELS[doc.scamType] ?? doc.scamType) : undefined;
  return new ImageResponse(
    renderScamOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip", scamTypeLabel }),
    { ...size },
  );
}
