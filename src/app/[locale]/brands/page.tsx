import type { Metadata } from "next";
import { Container, Heading, Main, Section, CategoriesIndexListing } from "@mohasinac/appkit";
import { generateMetadata as _gm } from "@/constants";

export const metadata: Metadata = _gm({
  title: "Collectibles Brands — LetItRip",
  description:
    "Shop by brand: Bandai, Mattel, Pokémon Company, Konami, Funko, NECA, Good Smile, Takara Tomy and more on LetItRip.",
  path: "/brands",
  keywords: ["bandai india", "pokemon company", "funko india", "good smile india", "mattel india", "collectibles brands"],
});

export const revalidate = 300;

export default function Page() {
  return (
    <Main>
      <Section padding="y-2xl">
        <Container size="xl">
          <Heading level={1} className="mb-8" color="primary" size="3xl" weight="semibold">
            Brands
          </Heading>
          <CategoriesIndexListing brandsOnly />
        </Container>
      </Section>
    </Main>
  );
}
