import { Suspense } from "react";
import type { Metadata } from "next";
import { ClassifiedListView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

export const metadata: Metadata = _gm({
  title: "Classifieds — LetItRip",
  description:
    "Browse second-hand and C2C collectible listings on LetItRip — Pokémon cards, action figures, diecast vehicles, vintage rare and more. Negotiate directly with sellers.",
  path: "/classified",
  keywords: [
    "collectibles classifieds india",
    "second hand pokemon cards",
    "buy sell action figures india",
    "vintage collectibles marketplace",
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
      <ClassifiedListView searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
