import type { Metadata } from "next";
import { HelpPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "Support & Help Centre — LetItRip",
  description:
    "Get help with buying, shipping, payments, auctions, pre-orders and selling on LetItRip. Browse FAQs or contact our support team.",
  path: "/support",
  keywords: ["letitrip support", "collectibles marketplace help", "contact letitrip"],
});

export default function Page() {
  return <HelpPageView />;
}
