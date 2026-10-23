import type { Metadata } from "next";
import { PublicCatalogueItemDetailView } from "@mohasinac/appkit/features/catalogue/components/PublicCatalogueItemDetailView";
import { generateMetadata as _gm } from "@/constants/seo.server";

type Props = { params: Promise<{ ownerSlug: string; itemId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ownerSlug, itemId } = await params;
  /*
   * This produced `title: "Catalogue Item — mycatalog-user-x-vintage-…-x1y2z3"`
   * — a raw generated id as the page title, with no description and no
   * canonical. A `mycatalog-` id is a slug plus a date plus a random suffix;
   * it is not language, and a search result reading it tells nobody anything.
   *
   * A personal catalogue item is one collector's own photo inventory, so the
   * honest title names the owner and the surface rather than inventing a
   * product name we do not have. Going through `_gm` also gets it the
   * canonical and og:url every other detail route has.
   */
  return _gm({
    title: `${ownerSlug}'s collection — LetItRip`,
    description: `An item from ${ownerSlug}'s personal Beyblade collection on LetItRip.`,
    path: `/catalogue/${ownerSlug}/${itemId}`,
    type: "website",
  });
}

export default async function Page({ params }: Props) {
  const { ownerSlug, itemId } = await params;
  return <PublicCatalogueItemDetailView ownerSlug={ownerSlug} itemId={itemId} />;
}
