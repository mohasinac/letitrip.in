import { Suspense } from "react";
import type { Metadata } from "next";
import { BlogIndexPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

export const metadata: Metadata = _gm({
  title: "Collectibles Blog — LetItRip",
  description:
    "Guides, tips and news for Pokémon TCG, Hot Wheels collectors, Gundam builders, and Beyblade enthusiasts on the LetItRip blog.",
  path: "/blog",
  keywords: ["pokemon card guide", "hot wheels collector", "gundam model guide", "beyblade tips", "collectibles blog india"],
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
      <BlogIndexPageView searchParams={resolvedSearchParams} />
    </Suspense>
  );
}
