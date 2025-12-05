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

import { useEffect, useState } from "react";
import Link from "next/link";
import { logError } from "@/lib/error-logger";
import AuctionCard from "@/components/cards/AuctionCard";
import { homepageService } from "@/services/homepage.service";
import { analyticsService } from "@/services/analytics.service";
import type { AuctionItemFE } from "@/services/homepage.service";

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
  const [auctions, setAuctions] = useState<AuctionItemFE[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuctions();
  }, [limit]);

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const data = await homepageService.getHotAuctions(limit);
      setAuctions(data);

      if (data.length > 0) {
        analyticsService.trackEvent("homepage_hot_auctions_viewed", {
          /** Count */
          count: data.length,
        });
      }
    } catch (error) {
      logError(error as Error, {
        /** Component */
        component: "HotAuctionsSection.loadAuctions",
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
          Hot Auctions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: Math.min(limit, 4) }).map((_, i) => (
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
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Hot Auctions
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {auctions.slice(0, 10).map((auction) => (
          <AuctionCard
            key={auction.id}
            auction={{
              /** Id */
              id: auction.id,
              /** Name */
              name: auction.name,
              /** Slug */
              slug: auction.slug,
              /** Images */
              images: auction.images,
              /** Current Bid */
              currentBid: auction.currentBid,
              /** Starting Bid */
              startingBid: auction.startingBid,
              /** Bid Count */
              bidCount: auction.bidCount,
              /** End Time */
              endTime: auction.endTime,
              /** Status */
              status:
                auction.status === "upcoming"
                  ? "pending"
                  : auction.status === "live"
                    ? "active"
                    : auction.status,
              /** Shop */
              shop: {
                /** Id */
                id: auction.shopId,
                /** Name */
                name: auction.shopName,
              },
            }}
            variant="compact"
          />
        ))}
      </div>

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
