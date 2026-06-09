import { Suspense } from "react";
import type { Metadata } from "next";
import { PrizeDrawsListingView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

/**
 * Public Prize Draws listing page (SB4-E + SB4-F).
 *
 * Server-fetched sieve list of published sieveFilter("listingType", SIEVE_OP.EQ, "= "prize-draw"")
 * products. The view component lives in appkit so brand/icon overrides
 * stay in `appkit.config.js` / token CSS.
 */
export const metadata: Metadata = _gm({
  title: "Prize Draws — LetItRip",
  description:
    "Enter fair, RNG-verified prize draws for sealed Pokémon, Hot Wheels Super Treasure Hunts, Gundam kits and more. Every winner picked by crypto.randomInt — proof on GitHub.",
  path: "/prize-draws",
  keywords: [
    "pokemon prize draw india",
    "hot wheels treasure hunt draw",
    "fair rng raffle",
    "collectibles mystery box india",
  ],
});

export const revalidate = 120;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense>
      <PrizeDrawsListingView searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
