"use client";

import { useTranslations } from "next-intl";
import { useFeaturedAuctions } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import type { ProductDocument } from "@/db/schema";
import { AuctionCard } from "@/components";
import { SectionCarousel } from "./SectionCarousel";

export function FeaturedAuctionsSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { data, isLoading } = useFeaturedAuctions();

  const auctions: ProductDocument[] = data ?? [];

  // Hide section entirely when there are no auctions and not loading
  if (!isLoading && auctions.length === 0) return null;

  return (
    <SectionCarousel
      title={t("liveAuctions")}
      description={t("auctionsSubtitle")}
      headingVariant="editorial"
      pillLabel={t("auctionsPill")}
      viewMoreHref={ROUTES.PUBLIC.AUCTIONS}
      viewMoreLabel={tActions("viewAllArrow")}
      items={auctions}
      renderItem={(auction) => <AuctionCard product={auction} />}
      perView={{ base: 2, sm: 3, md: 4, xl: 5 }}
      gap={12}
      autoScroll
      autoScrollInterval={4000}
      keyExtractor={(a) => a.id}
      isLoading={isLoading}
      skeletonCount={5}
      className="bg-gradient-to-b from-amber-500/5 dark:from-amber-900/10"
    />
  );
}
