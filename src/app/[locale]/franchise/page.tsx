import type { Metadata } from "next";
import { FranchisesIndexView } from "@mohasinac/appkit/features/categories/components/FranchisesIndexView";
import { TaxonomyLinkIndex } from "@mohasinac/appkit/features/categories/components/TaxonomyLinkIndex";
import { franchiseLinks } from "@mohasinac/appkit/server";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { PageViewTracker } from "@mohasinac/appkit/client";

export const metadata: Metadata = _gm({
  title: "Franchises — LetItRip",
  description:
    "Browse collectibles by franchise — the universes we stock, from Beyblade onward.",
  path: "/franchise",
  keywords: ["beyblade franchise", "collectibles by franchise", "anime collectibles india"],
});

export const revalidate = 3600;

export default async function Page() {
  /*
   * This hub rendered exactly ONE outbound link (measured 2026-10-24), which
   * is why no franchise detail page was reachable by crawl from anywhere on
   * the site and none was ever submitted to the sitemap.
   */
  const franchises = await franchiseLinks();
  return (
    <>
      <PageViewTracker entityType="listing" entityId="franchises" url="/franchise" />
      <FranchisesIndexView />
      <TaxonomyLinkIndex
        heading="All franchises"
        blurb="The universes we stock."
        items={franchises}
      />
    </>
  );
}
