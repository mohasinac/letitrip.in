import { ImageResponse } from "next/og";
import {
  getItemRequestForDetail,
  renderItemRequestOg,
  safeRead,
} from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

// Node runtime — getItemRequestForDetail uses firebase-admin via the
// _internal/server data layer. Matches every other listing OG.
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  // An OG endpoint must always return a PNG, so a failed read degrades to the
  // renderer's generic branded card — but is recorded rather than vanishing.
  const doc = await safeRead(() => getItemRequestForDetail(id), {
    route: "/item-requests/[id]",
    key: "itemRequests.getItemRequestForDetail",
    fallback: null,
  });
  return new ImageResponse(
    renderItemRequestOg(doc, { siteName: SEO_CONFIG.siteName ?? "LetItRip", baseUrl: SEO_CONFIG.siteUrl }),
    { ...size },
  );
}
