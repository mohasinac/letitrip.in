import { ImageResponse } from "next/og";
import { getPublicUserProfile, renderProfileOg } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export const runtime = "edge";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ userId: string }> };

export default async function Image({ params }: Props) {
  const { userId } = await params;
  const doc = await getPublicUserProfile(userId).catch(() => null);
  return new ImageResponse(
    renderProfileOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip" }),
    { ...size },
  );
}
