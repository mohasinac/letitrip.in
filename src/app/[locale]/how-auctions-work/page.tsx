import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { HowAuctionsWorkView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "How Auctions Work — LetItRip",
  description: "Learn how to bid and win auctions on LetItRip. Understand bidding rules, auto-bid, auction end times and payment for collectibles.",
  path: "/how-auctions-work",
  keywords: ["how auctions work letitrip", "collectibles bidding india", "online auction guide"],
});

export const revalidate = 3600;

export default function Page() {
  return <HowAuctionsWorkView />;
}
