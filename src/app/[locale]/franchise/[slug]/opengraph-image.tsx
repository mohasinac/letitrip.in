import { ImageResponse } from "next/og";
import { getFranchiseForDetail, renderFranchiseOg, safeRead } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

// Node runtime (the default), not edge — the @mohasinac/appkit/server chain
// pulls in node:crypto. Same reasoning as brands/[slug].
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  // An OG endpoint must always return a PNG, so a failed read degrades to the
  // renderer's generic branded card — recorded rather than vanishing.
  const doc = await safeRead(() => getFranchiseForDetail(slug), {
    route: "/franchise/[slug]",
    key: "categories.getFranchiseForDetail",
    fallback: null,
  });
  return new ImageResponse(
    renderFranchiseOg(doc, {
      siteName: SEO_CONFIG.siteName ?? "LetItRip",
      baseUrl: SEO_CONFIG.siteUrl,
    }),
    { ...size },
  );
}
