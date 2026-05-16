import { ImageResponse } from "next/og";
import { getPreOrderForDetail, renderPreOrderOg } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

// OG-FIX1: removed `export const runtime = "edge"` — the @mohasinac/appkit/server
// chain pulls in node:crypto via features/auth/{token-store,consent-otp}. Node
// runtime is the default; cold start is slightly slower but functional.
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  const doc = await getPreOrderForDetail(id).catch(() => null);
  return new ImageResponse(
    renderPreOrderOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip", baseUrl: SEO_CONFIG.siteUrl }),
    { ...size },
  );
}
