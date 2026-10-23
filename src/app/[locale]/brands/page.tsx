import type { Metadata } from "next";
import { CategoriesIndexListing } from "@mohasinac/appkit/features/categories/components/CategoriesIndexListing";
import { TaxonomyLinkIndex } from "@mohasinac/appkit/features/categories/components/TaxonomyLinkIndex";
import { brandLinks } from "@mohasinac/appkit/server";
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

export default async function Page() {
  /*
   * The grid above is client-filtered, which rendered ZERO brand links into
   * the server HTML — so a crawler landing here found nothing to follow and
   * all 28 brand pages were reachable only from the homepage strip. This
   * index puts them in the markup. A Firestore read in a Server Component
   * does not make the page dynamic, so `revalidate = 3600` still holds.
   */
  const brands = await brandLinks();
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
        <TaxonomyLinkIndex
          heading="All brands"
          blurb="Every brand we stock, in one list."
          items={brands}
        />
      </Main>
    </>
  );
}
