import { Suspense } from "react";
import type { Metadata } from "next";
import { PrizeDrawsListingView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { noindexWhenListingTypeDisabled } from "@/lib/seo/disabled-listing-type";
import { PageViewTracker } from "@mohasinac/appkit/client";

/**
 * Public Prize Draws listing page (SB4-E + SB4-F).
 *
 * Server-fetched sieve list of published sieveFilter("listingType", SIEVE_OP.EQ, "= "prize-draw"")
 * products. The view component lives in appkit so brand/icon overrides
 * stay in `appkit.config.js` / token CSS.
 */
const BASE_METADATA: Metadata = _gm({
  title: "Prize Draws — LetItRip",
  description:
    "Enter fair, RNG-verified prize draws for sealed Beyblade sets, rare tops and collector bundles. Every winner picked by crypto.randomInt — proof on GitHub.",
  path: "/prize-draws",
});

/*
 * Same two corrections as `/auctions`, for the same two reasons.
 *
 * The description named Pokémon, Hot Wheels Super Treasure Hunts and Gundam
 * kits — none of which this catalogue stocks (Root Cause #26) — and the
 * `keywords` list repeated them; meta keywords have been ignored by Google
 * since 2009, so it was drift surface that earned nothing.
 *
 * `generateMetadata` so the page stops advertising itself while
 * `listings.listingTypes.prize-draw` is off, which it is in production.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    ...BASE_METADATA,
    ...(await noindexWhenListingTypeDisabled("prize-draw", "/prize-draws")),
  };
}

export const revalidate = 120;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <>
      <PageViewTracker entityType="listing" entityId="prize-draws" url="/prize-draws" />
      <Suspense>
        <PrizeDrawsListingView searchParams={resolvedSearchParams} />
      </Suspense>
    </>
  );
}
