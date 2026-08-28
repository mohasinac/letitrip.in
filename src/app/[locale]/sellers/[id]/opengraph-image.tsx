import { ImageResponse } from "next/og";
import { getPublicUserProfile, renderProfileOg, safeRead } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  // An OG endpoint must always return a PNG, so a failed read degrades to the
  // renderer's generic branded card — but is recorded rather than vanishing.
  const doc = await safeRead(() => getPublicUserProfile(id), {
    route: "/sellers/[id]",
    key: "users.getPublicUserProfile",
    fallback: null,
  });
  return new ImageResponse(
    renderProfileOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip" }),
    { ...size },
  );
}
