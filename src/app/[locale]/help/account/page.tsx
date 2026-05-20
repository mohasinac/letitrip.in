import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { BuyerAccountGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Account & Safety Guide — LetItRip",
  description: "Manage your LetItRip profile, understand notifications and wishlists, leave reviews, and stay safe from scams.",
  path: "/help/account",
  keywords: ["letitrip account guide", "collectibles scam awareness", "letitrip safety tips"],
});

export const revalidate = 3600;

export default function Page() {
  return <BuyerAccountGuideView />;
}
