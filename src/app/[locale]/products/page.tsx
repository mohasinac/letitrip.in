import type { Metadata } from "next";
import { ProductsIndexPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const metadata: Metadata = _gm({
  title: "Collectibles for Sale — LetItRip",
  description:
    "Shop Pokémon cards, Hot Wheels diecast, anime figures, Beyblades and more. New arrivals daily on LetItRip.",
  path: "/products",
  keywords: ["pokemon cards", "hot wheels", "anime figures", "beyblades", "collectibles india"],
});

export const revalidate = 120;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  return <ProductsIndexPageView searchParams={resolvedSearchParams} />;
}
