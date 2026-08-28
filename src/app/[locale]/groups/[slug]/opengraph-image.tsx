import { ImageResponse } from "next/og";
import {
  getGroupedListingForDetail,
  renderGroupedListingOg,
  safeRead,
} from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

// Node runtime — the grouped data layer uses firebase-admin. Matches every
// other listing OG shim.
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  // An OG endpoint must always return a PNG, so a failed read degrades to the
  // renderer's generic branded card — but is recorded rather than vanishing.
  const doc = await safeRead(() => getGroupedListingForDetail(slug), {
    route: "/groups/[slug]",
    key: "groupedListings.getGroupedListingForDetail",
    fallback: null,
  });
  return new ImageResponse(
    renderGroupedListingOg(doc, {
      siteName: SEO_CONFIG.siteName ?? "LetItRip",
      baseUrl: SEO_CONFIG.siteUrl,
    }),
    { ...size },
  );
}
