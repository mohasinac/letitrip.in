import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { FeesView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Fees & Pricing — LetItRip",
  description: "Transparent fees for buyers and sellers on LetItRip. No hidden costs — see exactly what you pay when listing or purchasing collectibles.",
  path: "/fees",
  keywords: ["letitrip fees", "seller fees india", "marketplace commission collectibles"],
});

export const revalidate = 3600;

export default function Page() {
  return <FeesView />;
}
