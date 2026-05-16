import { ImageResponse } from "next/og";
import { renderFaqOg } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ category: string }> };

export default async function Image({ params }: Props) {
  const { category } = await params;
  return new ImageResponse(
    renderFaqOg(category, { siteName: SEO_CONFIG.siteName ?? "LetItRip" }),
    { ...size },
  );
}
