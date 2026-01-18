"use client";

import { useEffect, useState } from "react";
import { logError } from "@/lib/error-logger";
import AuctionCard from "@/components/cards/AuctionCard";
import { AuctionCardSkeleton, HorizontalScrollContainer } from "@letitrip/react-library";
import { homepageService } from "@/services/homepage.service";
import { analyticsService } from "@/services/analytics.service";
import type { AuctionItemFE } from "@/services/homepage.service";

interface AuctionsSectionProps {
  hotLimit?: number;
  featuredLimit?: number;
  className?: string;
}

export function AuctionsSection({
  hotLimit = 8,
  featuredLimit = 8,
  className = "",
}: AuctionsSectionProps) {
  const [hotAuctions, setHotAuctions] = useState<AuctionItemFE[]>([]);
  const [featuredAuctions, setFeaturedAuctions] = useState<AuctionItemFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuctions();
  }, [hotLimit, featuredLimit]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const [hot, featured] = await Promise.all([
        homepageService.getHotAuctions(hotLimit),
        homepageService.getFeaturedAuctions(featuredLimit),
      ]);

      setHotAuctions(hot);
      setFeaturedAuctions(featured);

      if (hot.length > 0 || featured.length > 0) {
        analyticsService.trackEvent("homepage_auctions_viewed", {
          hotCount: hot.length,
          featuredCount: featured.length,
        });
      }
    } catch (error) {
      logError(error as Error, { component: "AuctionsSection.loadAuctions" });
    } finally {
      setLoading(false);
    }
  };

  // Don't render if no auctions
  if (!loading && hotAuctions.length === 0 && featuredAuctions.length === 0) {
    return null;
  }

  if (loading) {
    return (
      <section className={`py-8 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Auctions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <AuctionCardSkeleton key={i} />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className={`py-8 ${className}`}>
      {/* Hot Auctions */}
      {hotAuctions.length > 0 && (
        <HorizontalScrollContainer
          title="Hot Auctions"
          viewAllLink="/auctions?sort=hot"
          viewAllText="View All"
          className="mb-8"
        >
          {hotAuctions.map((auction) => (
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
                shop: {
                  id: auction.shopId,
                  name: auction.shopName,
                },
              }}
              variant="public"
            />
          ))}
        </HorizontalScrollContainer>
      )}

      {/* Featured Auctions */}
      {featuredAuctions.length > 0 && (
        <HorizontalScrollContainer
          title="Featured Auctions"
          viewAllLink="/auctions?featured=true"
          viewAllText="View All"
          className="mb-8"
        >
          {featuredAuctions.map((auction) => (
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
              variant="public"
            />
          ))}
        </HorizontalScrollContainer>
      )}
    </section>
  );
}
