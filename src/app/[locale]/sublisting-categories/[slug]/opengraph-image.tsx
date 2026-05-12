import { ImageResponse } from "next/og";
import { getSublistingCategoryForDetail, renderSublistingCategoryOg } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const doc = await getSublistingCategoryForDetail(slug).catch(() => null);
  return new ImageResponse(
    renderSublistingCategoryOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip" }),
    { ...size },
  );
}
