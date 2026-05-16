import { Suspense } from "react";
import type { Metadata } from "next";
import { EventsListPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

export const metadata: Metadata = _gm({
  title: "Collectibles Events & Sales — LetItRip",
  description:
    "Pokémon tournaments, Hot Wheels swap meets, anime figure showcases and Yu-Gi-Oh! regionals. Discover collectibles events on LetItRip.",
  path: "/events",
  keywords: ["pokemon tournament india", "collectibles event india", "hot wheels swap meet", "yugioh regional india"],
});

export const revalidate = 60;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <Suspense>
      <EventsListPageView searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
