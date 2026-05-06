import type { Metadata } from "next";
import { AuctionsListView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const metadata: Metadata = _gm({
  title: "Live Collectibles Auctions — LetiTrip",
  description:
    "Bid on rare Pokémon cards, vintage Hot Wheels, 1st edition Yu-Gi-Oh!, and premium collectibles in live auctions on LetiTrip.",
  path: "/auctions",
  keywords: ["pokemon card auction india", "hot wheels auction", "yugioh 1st edition auction", "collectibles auction"],
});

export const revalidate = 60;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  return <AuctionsListView searchParams={resolvedSearchParams} />;
}
