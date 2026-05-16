import { ImageResponse } from "next/og";
import { getScammerForDetail, renderScamOg } from "@mohasinac/appkit/server";
import { SCAM_TYPE_LABELS } from "@mohasinac/appkit";
import { SEO_CONFIG } from "@/constants";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  const doc = await getScammerForDetail(id).catch(() => null);
  const scamTypeLabel = doc?.scamType ? (SCAM_TYPE_LABELS[doc.scamType] ?? doc.scamType) : undefined;
  return new ImageResponse(
    renderScamOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip", scamTypeLabel }),
    { ...size },
  );
}
