import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { HelpPageView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Help Centre — LetItRip",
  description: "Find answers, guides and support for buying, selling and bidding on LetItRip — India's collectibles marketplace.",
  path: "/help",
  keywords: ["letitrip help", "collectibles marketplace guide", "how to use letitrip"],
});

export const revalidate = 3600;

export default function Page() {
  return <HelpPageView />;
}
