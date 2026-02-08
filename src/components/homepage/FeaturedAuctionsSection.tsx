"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useApiQuery } from "@/hooks";
import { API_ENDPOINTS, THEME_CONSTANTS } from "@/constants";
import { Button } from "@/components";

interface Auction {
  id: string;
  title: string;
  slug: string;
  currentBid: number;
  startingBid: number;
  currency: string;
  mainImage: string;
  auctionEndDate: string;
  totalBids: number;
  category: string;
}

export function FeaturedAuctionsSection() {
  const { data, isLoading } = useApiQuery<{ products: Auction[] }>({
    queryKey: ["auctions", "featured"],
    queryFn: () =>
      fetch(
        `${API_ENDPOINTS.PRODUCTS.LIST}?isAuction=true&status=published&isPromoted=true&limit=18`,
      ).then((r) => r.json()),
  });

  if (isLoading) {
    return (
      <section
        className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
      >
        <div className="w-full">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg mb-8 max-w-xs animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {[...Array(18)].map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  const auctions = data?.products || [];

  if (auctions.length === 0) {
    return null;
  }

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section
      className={`${THEME_CONSTANTS.spacing.padding.xl} ${THEME_CONSTANTS.themed.bgPrimary}`}
    >
      <div className="w-full">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2
              className={`${THEME_CONSTANTS.typography.h2} ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
            >
              Live Auctions
            </h2>
            <p
              className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              Bid now on exclusive items
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => (window.location.href = "/auctions")}
          >
            View All Auctions
          </Button>
        </div>

        {/* Auctions Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9 gap-3 md:gap-4">
          {auctions.slice(0, 18).map((auction) => (
            <AuctionCard
              key={auction.id}
              auction={auction}
              formatPrice={formatPrice}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function AuctionCard({
  auction,
  formatPrice,
}: {
  auction: Auction;
  formatPrice: (price: number, currency: string) => string;
}) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = new Date(auction.auctionEndDate).getTime();
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
    <button
      className={`group ${THEME_CONSTANTS.themed.bgSecondary} ${THEME_CONSTANTS.borderRadius.lg} overflow-hidden hover:shadow-xl transition-all`}
      onClick={() => (window.location.href = `/auctions/${auction.slug}`)}
    >
      {/* Auction Image */}
      <div className="relative aspect-square overflow-hidden">
        <Image
          src={auction.mainImage}
          alt={auction.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-300"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        />
        {/* Auction Badge */}
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
              Current Bid
            </span>
            <span
              className={`${THEME_CONSTANTS.typography.body} ${THEME_CONSTANTS.themed.textPrimary} font-bold`}
            >
              {formatPrice(auction.currentBid, auction.currency)}
            </span>
          </div>
          <p
            className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary}`}
          >
            {auction.totalBids || 0} bid{auction.totalBids !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
    </button>
  );
}
