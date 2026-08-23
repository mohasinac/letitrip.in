import type { Metadata } from "next";
import { PolicyPageView } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const revalidate = 3600;

export const metadata: Metadata = _gm({
  title: "Our Ethics — LetItRip",
  description:
    "How LetItRip handles authenticity, honest grading, fair auctions, live-animal welfare, buyer privacy, and proportionate enforcement.",
  path: "/ethics",
  keywords: [
    "letitrip ethics",
    "responsible marketplace",
    "authenticity policy",
    "animal welfare",
  ],
});

export default function Page() {
  return <PolicyPageView policy="ethics" />;
}
