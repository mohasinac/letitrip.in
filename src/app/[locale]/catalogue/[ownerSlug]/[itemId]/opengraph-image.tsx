import { ImageResponse } from "next/og";
import { catalogueRepository, userRepository } from "@mohasinac/appkit";
import { renderCatalogueItemOg, safeRead } from "@mohasinac/appkit/server";
import { SEO_CONFIG } from "@/constants";

export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

type Props = { params: Promise<{ ownerSlug: string; itemId: string }> };

export default async function Image({ params }: Props) {
  const { ownerSlug, itemId } = await params;
  // An OG endpoint must always return a PNG, so a failed read degrades to the
  // renderer's generic branded card — but is recorded rather than vanishing.
  const owner = await safeRead(() => userRepository.findById(ownerSlug), {
    route: "/catalogue/[ownerSlug]/[itemId]",
    key: "users.findById",
    fallback: null,
  });
  const item = await safeRead(() => catalogueRepository.findById(itemId), {
    route: "/catalogue/[ownerSlug]/[itemId]",
    key: "catalogue.findById",
    fallback: null,
  });
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
