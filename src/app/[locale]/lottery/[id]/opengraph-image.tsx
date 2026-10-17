import { ImageResponse } from "next/og";
import {
  getLotteryEventCached,
  renderLotteryOg,
  safeRead,
} from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

/*
 * Node runtime — `getLotteryEventCached` reaches firebase-admin through the
 * `_internal/server` data layer. Matches every other listing OG shim.
 *
 * 🛑 `getLotteryEventCached`, deliberately — NOT `adminGetEventById`. That is
 * the opposite of the rule on the admin EDIT page, and for the same reason:
 * the cached reader runs `toClientLotteryConfig`, an allow-list that strips
 * `price` and `weight` from every slot. On the editor that stripping is a
 * hazard (it would save zeros back); here it is exactly what is wanted, since
 * an OG image is a public URL and must carry no money at all (Root Cause #93).
 */
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ id: string }> };

export default async function Image({ params }: Props) {
  const { id } = await params;
  // An OG endpoint must always return a PNG, so a failed read degrades to the
  // renderer's generic branded card — but is recorded rather than vanishing.
  const event = await safeRead(() => getLotteryEventCached(id), {
    route: "/lottery/[id]",
    key: "lottery.getLotteryEventCached",
    fallback: null,
  });
  return new ImageResponse(
    renderLotteryOg(event, {
      siteName: SEO_CONFIG.siteName ?? "LetItRip",
      baseUrl: SEO_CONFIG.siteUrl,
    }),
    { ...size },
  );
}
