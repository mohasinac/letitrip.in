import type { Metadata } from "next";
import { PublicCatalogueItemDetailView } from "@mohasinac/appkit";

type Props = { params: Promise<{ ownerSlug: string; itemId: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { itemId } = await params;
  return { title: `Catalogue Item — ${itemId}` };
}

export default async function Page({ params }: Props) {
  const { ownerSlug, itemId } = await params;
  return <PublicCatalogueItemDetailView ownerSlug={ownerSlug} itemId={itemId} />;
}
