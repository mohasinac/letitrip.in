import { ImageResponse } from "next/og";
import { getPublicUserProfile, renderProfileOg, safeRead } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

// OG-FIX1: removed `export const runtime = "edge"` — the @mohasinac/appkit/server
// chain pulls in node:crypto via features/auth/{token-store,consent-otp}. Node
// runtime is the default; cold start is slightly slower but functional.
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ userId: string }> };

export default async function Image({ params }: Props) {
  const { userId } = await params;
  // An OG endpoint must always return a PNG, so a failed read degrades to the
  // renderer's generic branded card — but is recorded rather than vanishing.
  const doc = await safeRead(() => getPublicUserProfile(userId), {
    route: "/profile/[userId]",
    key: "users.getPublicUserProfile",
    fallback: null,
  });
  return new ImageResponse(
    renderProfileOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip" }),
    { ...size },
  );
}
