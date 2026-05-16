import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { HowReviewsWorkView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "How Reviews Work — LetItRip",
  description: "Learn how buyer reviews and seller ratings work on LetItRip. Honest verified reviews help the collectibles community buy with confidence.",
  path: "/how-reviews-work",
  keywords: ["seller reviews india marketplace", "verified reviews collectibles", "letitrip ratings"],
});

export const revalidate = 3600;

export default function Page() {
  return <HowReviewsWorkView />;
}
