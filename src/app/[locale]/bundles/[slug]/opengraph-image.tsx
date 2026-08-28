import { ImageResponse } from "next/og";
import {
  getBundleForDetail,
  renderBundleOg,
  safeRead,
} from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

// Node runtime — getBundleForDetail uses firebase-admin via the
// _internal/server data layer. Matches every other listing OG.
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  // An OG endpoint must always return a PNG, so a failed read degrades to the
  // renderer's generic branded card — but is recorded rather than vanishing.
  const doc = await safeRead(() => getBundleForDetail(slug), {
    route: "/bundles/[slug]",
    key: "categories.getBundleForDetail",
    fallback: null,
  });
  return new ImageResponse(
    renderBundleOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip", baseUrl: SEO_CONFIG.siteUrl }),
    { ...size },
  );
}
