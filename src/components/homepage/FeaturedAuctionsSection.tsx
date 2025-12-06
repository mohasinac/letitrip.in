/**
 * @fileoverview Featured Auctions Section (Using Generic FeaturedSection Pattern)
 * @module src/components/homepage/FeaturedAuctionsSection
 * @description Specialized featured auctions section using the generic FeaturedSection pattern
 * 
 * @created 2025-12-05
 * @updated 2025-12-06
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import AuctionCard from "@/components/cards/AuctionCard";
import { homepageService } from "@/services/homepage.service";
import { analyticsService } from "@/services/analytics.service";
import type { AuctionItemFE } from "@/services/homepage.service";

/**
 * FeaturedAuctionsSectionProps interface
 * 
 * @interface
 * @description Props for featured auctions section
 */
interface FeaturedAuctionsSectionProps {
  /** Number of auctions to display */
  limit?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Function: Featured Auctions Section
 */
/**
 * Performs featured auctions section operation
 *
 * @param {FeaturedAuctionsSectionProps} [{
  limit] - The {
  limit
 *
 * @returns {any} The featuredauctionssection result
 *
 * @example
 * FeaturedAuctionsSection({
  limit);
 */

/**
 * Performs featured auctions section operation
 *
 * @param {FeaturedAuctionsSectionProps} [{
  limit] - The {
  limit
 *
 * @returns {any} The featuredauctionssection result
 *
 * @example
 * FeaturedAuctionsSection({
  limit);
 */

/**
 * Performs featured auctions section operation
 *
 * @param {FeaturedAuctionsSectionProps} [{
  limit = 10,
  className = "",
}] - The {
  limit = 10,
  classname = "",
}
 *
 * @returns {any} The featuredauctionssection result
 *
 * @example
 * FeaturedAuctionsSection({
  limit = 10,
  className = "",
});
 */
/**
 * Featured Auctions Section Component
 * 
 * Displays featured auctions using the generic FeaturedSection pattern.
 * Automatically tracks auction impressions for analytics.
 * 
 * @param {FeaturedAuctionsSectionProps} props - Component props
 * @returns {JSX.Element} Rendered component
 * 
 * @example
 * <FeaturedAuctionsSection limit={10} />
 */
export function FeaturedAuctionsSection({
  limit = 10,
  className = "",
}: FeaturedAuctionsSectionProps) {
  /**
   * Fetch featured auctions
   */
  const fetchAuctions = async (): Promise<AuctionItemFE[]> => {
    const auctions = await homepageService.getFeaturedAuctions(limit);
    
    // Track impressions for analytics
    if (auctions.length > 0) {
      analyticsService.trackEvent("homepage_featured_auctions_viewed", {
        count: auctions.length,
      });
    }
    
    return auctions;
  };

  return (
    <FeaturedSection<AuctionItemFE>
      title="Featured Auctions"
      subtitle="Live auctions ending soon"
      fetchFn={fetchAuctions}
      renderCard={(auction) => (
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
      )}
      viewAllLink="/auctions?featured=true"
      viewAllText="View All Auctions"
      columns={4}
      emptyMessage="No featured auctions available at the moment"
      className={className}
      skeletonCount={Math.min(limit, 5)}
    />
  );
}
