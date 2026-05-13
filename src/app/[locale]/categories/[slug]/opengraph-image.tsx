import { ImageResponse } from "next/og";
import {
  getCategoryForDetail,
  renderCategoryOg,
} from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

// Node runtime (not edge) — getCategoryForDetail uses firebase-admin via the
// _internal/server data layer. Matches every other listing OG (see OG-FIX1
// in brands/[slug]/opengraph-image.tsx).
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const doc = await getCategoryForDetail(slug).catch(() => null);
  return new ImageResponse(
    renderCategoryOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip" }),
    { ...size },
  );
}
