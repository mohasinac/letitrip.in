import type { Metadata } from "next";
import { CategoriesIndexListing } from "@mohasinac/appkit/features/categories/components/CategoriesIndexListing";
import { Container } from "@mohasinac/appkit/ui/components/Layout";
import { Main, Section } from "@mohasinac/appkit/ui/components/Semantic";
import { Heading } from "@mohasinac/appkit/ui/components/Typography";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { PageViewTracker } from "@mohasinac/appkit/client";

export const metadata: Metadata = _gm({
  title: "Collectibles Brands — LetItRip",
  description:
    "Shop Beyblade collectibles by brand — Takara-Tomy and Beyblade — on LetItRip.",
  path: "/brands",
  keywords: ["takara tomy india", "beyblade brand", "collectibles brands"],
});

export const revalidate = 3600;

export default function Page() {
  return (
    <>
      <PageViewTracker entityType="listing" entityId="brands" url="/brands" />
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
    </>
  );
}
