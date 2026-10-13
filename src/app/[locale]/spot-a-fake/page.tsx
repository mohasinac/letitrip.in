import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { SpotAFakeView } from "@mohasinac/appkit/features/about/components/SpotAFakeView";

export const metadata: Metadata = _gm({
  title: "How to spot a fake Beyblade — LetItRip",
  description:
    "Copies in this market do not claim to be originals — they sell as 'aftermarket'. Six signals worth checking, in order: price against the measured band, the printed code, part weight, print quality, the launcher, and what the seller actually says.",
  path: "/spot-a-fake",
  keywords: ["fake beyblade", "counterfeit beyblade india", "aftermarket beyblade", "genuine takara tomy"],
});

export const revalidate = 3600;

export default function Page() {
  return <SpotAFakeView />;
}
