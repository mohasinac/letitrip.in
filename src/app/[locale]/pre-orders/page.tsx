import type { Metadata } from "next";
import { PreOrdersListView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const metadata: Metadata = _gm({
  title: "Pre-Order Collectibles — LetiTrip",
  description:
    "Reserve upcoming Pokémon sets, S.H.Figuarts, Gundam kits, and Beyblade X releases before they sell out. Secure yours with a deposit.",
  path: "/pre-orders",
  keywords: ["pokemon pre-order india", "gundam pre-order", "beyblade x pre-order", "shf pre-order india"],
});

export const revalidate = 120;

export default async function Page({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[]>>;
}) {
  const resolvedSearchParams = await searchParams;
  return <PreOrdersListView searchParams={resolvedSearchParams} />;
}
