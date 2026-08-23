import type { Metadata } from "next";
import { PolicyPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "Code of Conduct — LetItRip",
  description:
    "The rules every LetItRip buyer and seller agrees to: accurate listings, honest reviews, fair bidding, respectful communication, and how enforcement and appeals work.",
  path: "/code-of-conduct",
  keywords: [
    "letitrip code of conduct",
    "community rules",
    "marketplace conduct",
    "seller rules",
  ],
});

export default function Page() {
  return <PolicyPageView policy="conduct" />;
}
