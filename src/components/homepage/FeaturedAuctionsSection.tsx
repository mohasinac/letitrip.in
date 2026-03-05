"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useFeaturedAuctions } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { formatCurrency, nowMs } from "@/utils";
import type { ProductDocument } from "@/db/schema";
import { Heading, Span, Text, TextLink } from "@/components";
import { SectionCarousel } from "./SectionCarousel";

export function FeaturedAuctionsSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { data, isLoading } = useFeaturedAuctions();

  const auctions: ProductDocument[] = Array.isArray(data)
    ? data
    : ((data as unknown as { items?: ProductDocument[] })?.items ?? []);

  // Hide section entirely when there are no auctions and not loading
  if (!isLoading && auctions.length === 0) return null;

  return (
    <SectionCarousel
      title={t("liveAuctions")}
      description={t("auctionsSubtitle")}
      viewMoreHref={ROUTES.PUBLIC.AUCTIONS}
      viewMoreLabel={tActions("viewAllArrow")}
      items={auctions}
      renderItem={(auction) => (
        <TextLink
          href={`/auctions/${auction.id}`}
          className={`group block ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden hover:shadow-xl transition-all`}
        >
          <AuctionCardContent auction={auction} />
        </TextLink>
      )}
      perView={{ base: 2, sm: 3, md: 4, xl: 5, "2xl": 6 }}
      gap={12}
      autoScroll
      autoScrollInterval={4000}
      keyExtractor={(a) => a.id}
      isLoading={isLoading}
      skeletonCount={5}
      className={THEME_CONSTANTS.themed.bgPrimary}
    />
  );
}

function AuctionCardContent({ auction }: { auction: ProductDocument }) {
  const t = useTranslations("homepage");
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!auction.auctionEndDate) {
      setTimeLeft("No end date");
      return;
    }

    const calculateTimeLeft = () => {
      const endDate =
        auction.auctionEndDate instanceof Date
          ? auction.auctionEndDate
          : new Date(auction.auctionEndDate as unknown as string);
      const distance = endDate.getTime() - nowMs();

      if (distance < 0) {
        setTimeLeft("Ended");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) setTimeLeft(`${days}d ${hours}h`);
      else if (hours > 0) setTimeLeft(`${hours}h ${minutes}m`);
      else setTimeLeft(`${minutes}m`);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60_000);
    return () => clearInterval(interval);
  }, [auction.auctionEndDate]);

  return (
    <>
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={auction.mainImage}
          alt={auction.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
        />
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
          </svg>
          {timeLeft}
        </div>
      </div>

      <div className={`${THEME_CONSTANTS.spacing.padding.sm} text-left`}>
        <Heading
          level={3}
          className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-medium mb-2 line-clamp-2 min-h-[2.5rem]`}
        >
          {auction.title}
        </Heading>
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <Span
              className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {t("currentBid")}
            </Span>
            <Span
              className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-bold`}
            >
              {formatCurrency(auction.currentBid ?? 0, auction.currency)}
            </Span>
          </div>
          <Text
            className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {auction.bidCount || 0} bid{auction.bidCount !== 1 ? "s" : ""}
          </Text>
        </div>
      </div>
    </>
  );
}
