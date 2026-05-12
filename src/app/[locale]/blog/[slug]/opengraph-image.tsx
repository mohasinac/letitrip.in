import { ImageResponse } from "next/og";
import { getBlogPostForDetail, renderBlogOg } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ slug: string }> };

export default async function Image({ params }: Props) {
  const { slug } = await params;
  const doc = await getBlogPostForDetail(slug).catch(() => null);
  return new ImageResponse(
    renderBlogOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip" }),
    { ...size },
  );
}
