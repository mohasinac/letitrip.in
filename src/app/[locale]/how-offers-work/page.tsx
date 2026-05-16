import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { HowOffersWorkView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "How Offers Work — LetItRip",
  description: "Make and receive offers on collectibles at LetItRip. Negotiate prices directly with sellers on Pokémon cards, figures, diecast and more.",
  path: "/how-offers-work",
  keywords: ["make offer collectibles", "negotiate price india marketplace", "letitrip offers"],
});

export const revalidate = 3600;

export default function Page() {
  return <HowOffersWorkView />;
}
