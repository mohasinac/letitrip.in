"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useFeaturedAuctions } from "@/hooks";
import { THEME_CONSTANTS, ROUTES } from "@/constants";
import { formatCurrency, nowMs } from "@/utils";
import type { ProductDocument } from "@/db/schema";
import {
  Heading,
  HorizontalScroller,
  Section,
  Span,
  Text,
  TextLink,
} from "@/components";

const { flex } = THEME_CONSTANTS;

export function FeaturedAuctionsSection() {
  const t = useTranslations("homepage");
  const tActions = useTranslations("actions");
  const { data, isLoading } = useFeaturedAuctions();

  if (isLoading) {
    return (
      <Section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
      >
        <div className="w-full">
          <div
            className={`h-8 ${THEME_CONSTANTS.skeleton.base} mb-8 max-w-xs`}
          />
          {/* Mobile: horizontal scroll skeleton */}
          <div className="flex gap-3 overflow-hidden md:hidden">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex-none w-40 space-y-2">
                <div
                  className={`aspect-square ${THEME_CONSTANTS.skeleton.image}`}
                />
                <div className={`${THEME_CONSTANTS.skeleton.text} w-3/4`} />
                <div className={`${THEME_CONSTANTS.skeleton.text} w-1/2`} />
              </div>
            ))}
          </div>
          {/* Desktop: grid skeleton */}
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div
                  className={`aspect-square ${THEME_CONSTANTS.skeleton.image}`}
                />
                <div className={`${THEME_CONSTANTS.skeleton.text} w-3/4`} />
                <div className={`${THEME_CONSTANTS.skeleton.text} w-1/2`} />
              </div>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  const auctions: ProductDocument[] = Array.isArray(data)
    ? data
    : ((data as any)?.items ?? []);

  if (auctions.length === 0) {
    return null;
  }

  return (
    <Section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className={`${flex.between} mb-6`}>
          <div>
            <Heading
              level={2}
              className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-1`}
            >
              {t("liveAuctions")}
            </Heading>
            <Text
              className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {t("auctionsSubtitle")}
            </Text>
          </div>
          <TextLink
            href={ROUTES.PUBLIC.AUCTIONS}
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {tActions("viewAllArrow")}
          </TextLink>
        </div>

        {/* Mobile: single-row circular carousel */}
        <div className="md:hidden">
          <HorizontalScroller
            items={auctions.slice(0, 20)}
            renderItem={(auction) => (
              <TextLink
                href={`/auctions/${auction.id}`}
                className={`group block ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden hover:shadow-xl transition-all`}
              >
                <AuctionCardContent
                  auction={auction}
                  sizes="(max-width: 640px) 50vw, 33vw"
                />
              </TextLink>
            )}
            perView={{ base: 2, sm: 3 }}
            gap={12}
            autoScroll
            keyExtractor={(a) => a.id}
            className="px-5"
          />
        </div>

        {/* Desktop: 1 or 2-row grid scroller with auto scroll */}
        <div className="hidden md:block">
          <HorizontalScroller
            items={auctions.slice(0, 30)}
            renderItem={(auction) => (
              <TextLink
                href={`/auctions/${auction.id}`}
                className={`group block ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden hover:shadow-xl transition-all`}
              >
                <AuctionCardContent
                  auction={auction}
                  sizes="(max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 20vw"
                />
              </TextLink>
            )}
            perView={{ base: 3, lg: 4, xl: 5, "2xl": 6 }}
            rows={auctions.length > 5 ? 2 : 1}
            gap={12}
            autoScroll
            autoScrollInterval={2500}
            keyExtractor={(a) => a.id}
            className="px-5 pb-1"
          />
        </div>
      </div>
    </Section>
  );
}

function AuctionCardContent({
  auction,
  sizes,
}: {
  auction: ProductDocument;
  sizes: string;
}) {
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
      const endTime = endDate.getTime();
      const now = nowMs();
      const distance = endTime - now;

      if (distance < 0) {
        setTimeLeft("Ended");
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [auction.auctionEndDate]);

  return (
    <>
      {/* Auction Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={auction.mainImage}
          alt={auction.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes={sizes}
        />
        {/* Countdown chip */}
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
          </svg>
          {timeLeft}
        </div>
      </div>

      {/* Auction Info */}
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
