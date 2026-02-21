"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, THEME_CONSTANTS, ROUTES, UI_LABELS } from "@/constants";
import { formatCurrency } from "@/utils";
import { apiClient } from "@/lib/api-client";
import type { ProductDocument } from "@/db/schema";

export function FeaturedAuctionsSection() {
  const { data, isLoading } = useApiQuery<ProductDocument[]>({
    queryKey: ["auctions", "featured"],
    queryFn: () =>
      apiClient.get(
        `${API_ENDPOINTS.PRODUCTS.LIST}?isAuction=true&status=published&isPromoted=true&limit=18`,
      ),
  });

  if (isLoading) {
    return (
      <section
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
          <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-4">
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
      </section>
    );
  }

  const auctions = data || [];

  if (auctions.length === 0) {
    return null;
  }

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2
              className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-1`}
            >
              {UI_LABELS.HOMEPAGE.AUCTIONS.TITLE}
            </h2>
            <p
              className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {UI_LABELS.HOMEPAGE.AUCTIONS.SUBTITLE}
            </p>
          </div>
          <Link
            href={ROUTES.PUBLIC.AUCTIONS}
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hidden sm:block"
          >
            {UI_LABELS.ACTIONS.VIEW_ALL_ARROW}
          </Link>
        </div>

        {/* Mobile: horizontal snap-scroll carousel */}
        <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 md:hidden scrollbar-none">
          {auctions.slice(0, 18).map((auction) => (
            <Link
              key={auction.id}
              href={`/auctions/${auction.id}`}
              className={`group flex-none w-40 snap-start ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden hover:shadow-xl transition-all`}
            >
              <AuctionCardContent auction={auction} sizes="160px" />
            </Link>
          ))}
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
          {auctions.slice(0, 10).map((auction) => (
            <Link
              key={auction.id}
              href={`/auctions/${auction.id}`}
              className={`group ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden hover:shadow-xl transition-all`}
            >
              <AuctionCardContent
                auction={auction}
                sizes="(max-width: 1024px) 33vw, 20vw"
              />
            </Link>
          ))}
        </div>

        {/* Mobile "View all" link */}
        <div className="mt-4 text-center sm:hidden">
          <Link
            href={ROUTES.PUBLIC.AUCTIONS}
            className="text-sm font-medium text-indigo-600 dark:text-indigo-400"
          >
            {UI_LABELS.ACTIONS.VIEW_ALL_ARROW}
          </Link>
        </div>
      </div>
    </section>
  );
}

function AuctionCardContent({
  auction,
  sizes,
}: {
  auction: ProductDocument;
  sizes: string;
}) {
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
      const now = new Date().getTime();
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
        <h3
          className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-medium mb-2 line-clamp-2 min-h-[2.5rem]`}
        >
          {auction.title}
        </h3>
        <div className="space-y-1">
          <div className="flex items-baseline justify-between">
            <span
              className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              {UI_LABELS.HOMEPAGE.AUCTIONS.CURRENT_BID}
            </span>
            <span
              className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-bold`}
            >
              {formatCurrency(auction.currentBid ?? 0, auction.currency)}
            </span>
          </div>
          <p
            className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {auction.bidCount || 0} bid{auction.bidCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </>
  );
}
