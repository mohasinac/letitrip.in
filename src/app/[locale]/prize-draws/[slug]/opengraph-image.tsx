import { ImageResponse } from "next/og";
import {
  getPrizeDrawForDetail,
  renderPrizeDrawOg,
} from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

// Node runtime — getPrizeDrawForDetail uses firebase-admin via the
// _internal/server data layer. Matches every other listing OG.
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const doc = await getPrizeDrawForDetail(slug).catch(() => null);
  return new ImageResponse(
    renderPrizeDrawOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip", baseUrl: SEO_CONFIG.siteUrl }),
    { ...size },
  );
}
