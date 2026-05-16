import { Suspense } from "react";
import type { Metadata } from "next";
import { StoresIndexPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

export const metadata: Metadata = _gm({
  title: "Verified Collectibles Stores — LetItRip",
  description:
    "Browse verified stores selling Pokémon TCG, Hot Wheels, anime figures, Beyblades and more on LetItRip.",
  path: "/stores",
  keywords: ["pokemon card store india", "hot wheels store india", "collectibles seller india"],
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
      <StoresIndexPageView searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
