import { Suspense } from "react";
import type { Metadata } from "next";
import { productFeaturesRepository } from "@mohasinac/appkit/features/products/repository/product-features.repository";
import { AuctionsListView } from "@mohasinac/appkit";
import { ProductFeaturesProvider } from "@mohasinac/appkit/client";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { PageViewTracker } from "@mohasinac/appkit/client";
import { safeRead } from "@mohasinac/appkit/server";

/*
 * No `keywords`, and no franchise name-dropping in the description.
 *
 * Both were stale in the way Recurrent Root Cause #26 describes: this page
 * advertised "Pokémon cards, vintage Hot Wheels, 1st edition Yu-Gi-Oh!" to
 * search engines while the catalogue has been narrowed to Beyblade for a long
 * time (see `categories-seed-data.ts`'s own header). The live page body reads
 * "Beyblade X AeroPegasus 3-70A" — so the markup and the content disagreed,
 * which is the thing a description is not allowed to do.
 *
 * `keywords` is dropped rather than rewritten: Google has ignored the meta
 * keywords tag since 2009, so it earned nothing and was pure drift surface —
 * a second list of franchises to keep in step with the catalogue, which it had
 * already failed to do. Same reasoning as the homepage's note above `_gm`.
 */
export const metadata: Metadata = _gm({
  title: "Live Collectibles Auctions — LetItRip",
  description:
    "Bid on Beyblade tops, parts and sealed collectibles in live auctions on LetItRip. Real-time bidding, verified sellers, buyer protection.",
  path: "/auctions",
});

export const revalidate = 60;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  const platformFeatures = await safeRead(
    () => productFeaturesRepository.listPlatform(),
    {
      route: "/auctions",
      key: "productFeatures.listPlatform",
      fallback: [],
    },
  );
  return (
    <>
      <PageViewTracker entityType="listing" entityId="auctions" url="/auctions" />
      <Suspense>
        <ProductFeaturesProvider features={platformFeatures}>
          <AuctionsListView searchParams={resolvedSearchParams} />
        </ProductFeaturesProvider>
      </Suspense>
    </>
  );
}
