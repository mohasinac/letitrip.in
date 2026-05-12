import { ImageResponse } from "next/og";
import { getStoreForDetail, renderStoreOg } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ storeSlug: string }> };

export default async function Image({ params }: Props) {
  const { storeSlug } = await params;
  const doc = await getStoreForDetail(storeSlug).catch(() => null);
  return new ImageResponse(
    renderStoreOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip" }),
    { ...size },
  );
}
