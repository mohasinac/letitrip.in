import { ImageResponse } from "next/og";
import { getReviewById, renderReviewOg, safeRead } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  // An OG endpoint must always return a PNG, so a failed read degrades to the
  // renderer's generic branded card — but is recorded rather than vanishing.
  const doc = await safeRead(() => getReviewById(id), {
    route: "/reviews/[id]",
    key: "reviews.getReviewById",
    fallback: null,
  });
  return new ImageResponse(
    renderReviewOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip" }),
    { ...size },
  );
}
