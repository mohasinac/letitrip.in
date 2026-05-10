import type { Metadata } from "next";
import { SellersListView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const metadata: Metadata = _gm({
  title: "Verified Sellers — LetItRip",
  description: "Browse trusted sellers on LetItRip — India's largest collectibles marketplace for Pokémon TCG, Hot Wheels, anime figures and more.",
  path: "/sellers",
  keywords: ["collectibles sellers india", "verified sellers letitrip", "buy from sellers"],
});

export const revalidate = 120;

export default function Page() {
  return <SellersListView />;
}
