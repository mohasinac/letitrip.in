import { ImageResponse } from "next/og";
import { catalogueRepository, userRepository } from "@mohasinac/appkit";
import { renderCatalogueItemOg } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ ownerSlug: string; itemId: string }> };

export default async function Image({ params }: Props) {
  const { ownerSlug, itemId } = await params;
  const owner = await userRepository.findById(ownerSlug).catch(() => null);
  const item = await catalogueRepository.findById(itemId).catch(() => null);
  const doc = item && owner && item.ownerId === owner.uid && item.visibility === "public" ? item : null;

  return new ImageResponse(
    renderCatalogueItemOg(doc, {
      siteName: SEO_CONFIG.siteName ?? "LetItRip",
      baseUrl: SEO_CONFIG.siteUrl,
      ownerName: owner?.displayName ?? null,
    }),
    { ...size },
  );
}
