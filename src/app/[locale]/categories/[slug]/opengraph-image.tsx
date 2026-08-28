import { ImageResponse } from "next/og";
import {
  getCategoryForDetail,
  renderCategoryOg,
  safeRead,
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
  // An OG endpoint must always return a PNG, so a failed read degrades to the
  // renderer's generic branded card — but is recorded rather than vanishing.
  const doc = await safeRead(() => getCategoryForDetail(slug), {
    route: "/categories/[slug]",
    key: "categories.getCategoryForDetail",
    fallback: null,
  });
  return new ImageResponse(
    renderCategoryOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip", baseUrl: SEO_CONFIG.siteUrl }),
    { ...size },
  );
}
