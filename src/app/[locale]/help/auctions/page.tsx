import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { BuyerAuctionsGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Auctions & Pre-orders Guide — LetItRip",
  description: "How auctions work on LetItRip — bidding, winning, bid retraction policy, pre-orders, and safety tips.",
  path: "/help/auctions",
  keywords: ["letitrip auctions guide", "how to bid on collectibles", "pre-order guide letitrip"],
});

export const revalidate = 3600;

export default function Page() {
  return <BuyerAuctionsGuideView />;
}
