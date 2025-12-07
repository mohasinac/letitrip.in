"use client";

import AuctionCard from "@/components/cards/AuctionCard";
import { HorizontalScrollContainer } from "@/components/common/HorizontalScrollContainer";
import { logError } from "@/lib/error-logger";
import { analyticsService } from "@/services/analytics.service";
import type { AuctionItemFE } from "@/services/homepage.service";
import { homepageService } from "@/services/homepage.service";
import { useEffect, useState } from "react";

interface FeaturedAuctionsSectionProps {
  limit?: number;
  className?: string;
}

export function FeaturedAuctionsSection({
  limit = 10,
  className = "",
}: FeaturedAuctionsSectionProps) {
  const [auctions, setAuctions] = useState<AuctionItemFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuctions();
  }, [limit]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const data = await homepageService.getFeaturedAuctions(limit);
      setAuctions(data);

      if (data.length > 0) {
        analyticsService.trackEvent("homepage_featured_auctions_viewed", {
          count: data.length,
        });
      }
    } catch (error) {
      logError(error as Error, {
        component: "FeaturedAuctionsSection.loadAuctions",
      });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no auctions
  if (!loading && auctions.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Featured Auctions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: Math.min(limit, 5) }).map((_, i) => (
            <div
              key={i}
              className="h-80 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <HorizontalScrollContainer
      title="Featured Auctions"
      viewAllLink="/auctions?featured=true"
      viewAllText="View All"
      className={className}
    >
      {auctions.map((auction) => (
        <AuctionCard
          key={auction.id}
          auction={{
            id: auction.id,
            name: auction.name,
            slug: auction.slug,
            images: auction.images,
            currentBid: auction.currentBid,
            startingBid: auction.startingBid,
            bidCount: auction.bidCount,
            endTime: auction.endTime,
            status:
              auction.status === "upcoming"
                ? "pending"
                : auction.status === "live"
                ? "active"
                : auction.status,
            featured: true,
            shop: {
              id: auction.shopId,
              name: auction.shopName,
            },
          }}
          variant="compact"
        />
      ))}
    </HorizontalScrollContainer>
  );
}
