import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { GuidesHubView } from "@mohasinac/appkit/features/about/components/GuidesHubView";

export const metadata: Metadata = _gm({
  title: "Guides — buying, selling and spotting fakes on LetItRip",
  description:
    "Every LetItRip explainer in one place: how auctions, offers, pre-orders, EMI and payouts work, what the fees and GST are, and how to tell a genuine release from an aftermarket copy.",
  path: "/guides",
  keywords: ["letitrip guides", "how to buy collectibles india", "beyblade buying guide"],
});

export const revalidate = 3600;

export default function Page() {
  return <GuidesHubView />;
}
