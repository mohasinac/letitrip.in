import { Suspense } from "react";
import type { Metadata } from "next";
import { BundlesListView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";
import { buyBundleAction } from "@/actions/bundle.actions";

export const metadata: Metadata = _gm({
  title: "Collectible Bundles — LetItRip",
  description:
    "Shop curated multi-product bundles — Pokémon starter sets, Beyblade tournament packs, Hot Wheels collector boxes and more. One price, one checkout.",
  path: "/bundles",
  keywords: [
    "pokemon bundle india",
    "beyblade bundle",
    "hot wheels collector bundle",
    "collectibles bundle deal",
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
      <BundlesListView searchParams={resolvedSearchParams} onBuyNow={buyBundleAction} />
    </Suspense>
  );
}
