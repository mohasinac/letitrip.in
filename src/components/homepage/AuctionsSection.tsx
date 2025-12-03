"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuctionCard from "@/components/cards/AuctionCard";
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
      console.error("Failed to load auctions:", error);
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
    <section className={`py-8 ${className}`}>
      {/* Hot Auctions */}
      {hotAuctions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Hot Auctions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {hotAuctions.slice(0, 10).map((auction) => (
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
                variant="compact"
              />
            ))}
          </div>
        </div>
      )}

      {/* Featured Auctions */}
      {featuredAuctions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Featured Auctions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {featuredAuctions.slice(0, 10).map((auction) => (
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
          </div>
        </div>
      )}

      {/* View All Auctions Button - Centered */}
      <div className="flex justify-center mt-8">
        <Link
          href="/auctions"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          View All Auctions
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14 5l7 7m0 0l-7 7m7-7H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
