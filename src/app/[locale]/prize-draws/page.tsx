import type { Metadata } from "next";
import { Container, Heading, Text } from "@mohasinac/appkit/client";
import { generateMetadata as _gm } from "@/constants/seo.server";

/**
 * Public Prize Draws listing page (SB4-E).
 *
 * Renders a placeholder until SB4-F `PrizeDrawsListingView` is wired in
 * Phase 4. The route exists today so nav links + sitemap stay valid.
 */

export const metadata: Metadata = _gm({
  title: "Prize Draws — LetItRip",
  description:
    "Enter fair, RNG-verified prize draws for sealed Pokémon, Hot Wheels Super Treasure Hunts, Gundam kits and more. Every winner picked by crypto.randomInt — proof on GitHub.",
  path: "/prize-draws",
  keywords: [
    "pokemon prize draw india",
    "hot wheels treasure hunt draw",
    "fair rng raffle",
    "collectibles mystery box india",
  ],
});

export const revalidate = 120;

export default function Page() {
  return (
    <Container className="px-4 py-8">
      <Heading level={1} className="text-3xl font-bold mb-4">
        Prize Draws
      </Heading>
      <Text className="text-[var(--appkit-color-text-muted)]">
        Listing UI ships with SB4-F — page shim wired so the route resolves.
      </Text>
    </Container>
  );
}
