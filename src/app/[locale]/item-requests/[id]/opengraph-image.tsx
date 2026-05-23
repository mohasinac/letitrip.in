import { ImageResponse } from "next/og";
import {
  getItemRequestForDetail,
  renderItemRequestOg,
} from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

// Node runtime — getItemRequestForDetail uses firebase-admin via the
// _internal/server data layer. Matches every other listing OG.
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  const doc = await getItemRequestForDetail(id).catch(() => null);
  return new ImageResponse(
    renderItemRequestOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip", baseUrl: SEO_CONFIG.siteUrl }),
    { ...size },
  );
}
