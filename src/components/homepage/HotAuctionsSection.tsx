/**
 * @fileoverview React Component
 * @module src/components/homepage/HotAuctionsSection
 * @description This file contains the HotAuctionsSection component and its related functionality
 *
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import AuctionCard from "@/components/cards/AuctionCard";
import { FeaturedSection } from "@/components/common/FeaturedSection";
import { analyticsService } from "@/services/analytics.service";
import type { AuctionItemFE } from "@/services/homepage.service";
import { homepageService } from "@/services/homepage.service";
import { Gavel } from "lucide-react";

/**
 * HotAuctionsSectionProps interface
 *
 * @interface
 * @description Defines the structure and contract for HotAuctionsSectionProps
 */
interface HotAuctionsSectionProps {
  /** Limit */
  limit?: number;
  /** Class Name */
  className?: string;
}

/**
 * Function: Hot Auctions Section
 */
/**
 * Performs hot auctions section operation
 *
 * @param {HotAuctionsSectionProps} [{
  limit] - The {
  limit
 *
 * @returns {any} The hotauctionssection result
 *
 * @example
 * HotAuctionsSection({
  limit);
 */

/**
 * Performs hot auctions section operation
 *
 * @param {HotAuctionsSectionProps} [{
  limit] - The {
  limit
 *
 * @returns {any} The hotauctionssection result
 *
 * @example
 * HotAuctionsSection({
  limit);
 */

/**
 * Performs hot auctions section operation
 *
 * @param {HotAuctionsSectionProps} [{
  limit = 10,
  className = "",
}] - The {
  limit = 10,
  classname = "",
}
 *
 * @returns {any} The hotauctionssection result
 *
 * @example
 * HotAuctionsSection({
  limit = 10,
  className = "",
});
 */
export function HotAuctionsSection({
  limit = 10,
  className = "",
}: HotAuctionsSectionProps) {
  return (
    <FeaturedSection<AuctionItemFE>
      title="Hot Auctions"
      icon={Gavel}
      viewAllLink="/auctions"
      viewAllText="View All Auctions"
      fetchData={async () => {
        const data = await homepageService.getHotAuctions(limit);
        if (data.length > 0) {
          analyticsService.trackEvent("homepage_hot_auctions_viewed", {
            count: data.length,
          });
        }
        return data;
      }}
      renderItem={(auction) => (
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
      )}
      itemWidth="280px"
      className={className}
    />
  );
}
