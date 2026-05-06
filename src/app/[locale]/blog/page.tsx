import type { Metadata } from "next";
import { BlogIndexPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const metadata: Metadata = _gm({
  title: "Collectibles Blog — LetiTrip",
  description:
    "Guides, tips and news for Pokémon TCG, Hot Wheels collectors, Gundam builders, and Beyblade enthusiasts on the LetiTrip blog.",
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
  return <BlogIndexPageView searchParams={resolvedSearchParams} />;
}
