import { ImageResponse } from "next/og";
import { TABLE_KEYS } from "@mohasinac/appkit/constants/table-keys";
import { meetupCityBySlug } from "@mohasinac/appkit/features/products/constants/meetup-cities";
import { listPublicProducts, renderCityOg, safeRead } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

// Node runtime (the default), not edge: the `@mohasinac/appkit/server` chain
// reaches node:crypto through features/auth — the same reason every other OG
// route here dropped `runtime = "edge"`.
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ city: string }> };

export default async function Image({ params }: Props) {
  const { city } = await params;
  const match = meetupCityBySlug(city);

  /*
   * An OG endpoint must ALWAYS return a PNG, so a failed read degrades to the
   * card with no count rather than throwing — but it is recorded, not
   * swallowed.
   *
   * 🛑 The count is passed as `null` when the read saturated its cap, because
   * then `total` is a floor. A floor burned into an image cannot be corrected
   * on the next request: every platform that scrapes it caches the pixels.
   */
  const result = match
    ? await safeRead(
        () =>
          listPublicProducts({
            listingTypes: ["classified"],
            typeFacets: { [TABLE_KEYS.CITY]: match.city },
            availability: "available",
            page: 1,
            pageSize: 24,
          }),
        { route: "/collectibles/[city]", key: "city.og.count", fallback: null },
      )
    : null;

  return new ImageResponse(
    renderCityOg(
      {
        city: match?.city ?? "Collectibles",
        state: match?.state ?? "India",
        listingCount: !result || result.truncated ? null : result.total,
      },
      SEO_CONFIG.siteName ?? "LetItRip",
    ),
    { ...size },
  );
}
