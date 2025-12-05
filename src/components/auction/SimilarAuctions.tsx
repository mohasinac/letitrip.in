/**
 * @fileoverview React Component
 * @module src/components/auction/SimilarAuctions
 * @description This file contains the SimilarAuctions component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { Loader2 } from "lucide-react";
import AuctionCard from "@/components/cards/AuctionCard";
import { EmptyState } from "@/components/common/EmptyState";
import type { AuctionCardFE } from "@/types/frontend/auction.types";

/**
 * SimilarAuctionsProps interface
 * 
 * @interface
 * @description Defines the structure and contract for SimilarAuctionsProps
 */
export interface SimilarAuctionsProps {
  /** Auctions */
  auctions: AuctionCardFE[];
  /** Loading */
  loading?: boolean;
  /** Current Auction Id */
  currentAuctionId?: string;
  /** Class Name */
  className?: string;
}

/**
 * SimilarAuctions Component
 *
 * Displays similar ongoing auctions based on category.
 * Used on auction detail pages.
 *
 * Features:
 * - Grid of auction cards
 * - Filters out current auction
 * - Loading state
 * - Empty state
 * - Responsive grid layout
 *
 * @example
 * ```tsx
 * <SimilarAuctions
 *   auctions={similarAuctions}
 *   currentAuctionId="auction123"
 * />
 * ```
 */
/**
 * Performs similar auctions operation
 *
 * @returns {any} The similarauctions result
 *
 * @example
 * SimilarAuctions();
 */

/**
 * Performs similar auctions operation
 *
 * @returns {any} The similarauctions result
 *
 * @example
 * SimilarAuctions();
 */

export function SimilarAuctions({
  auctions,
  loading = false,
  currentAuctionId,
  className = "",
}: SimilarAuctionsProps) {
  // Filter out current auction
  const filteredAuctions = auctions.filter(
    (auction) => auction.id !== currentAuctionId,
  );

  if (loading) {
    return (
      <div className={`${className}`}>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Similar Auctions
        </h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
        </div>
      </div>
    );
  }

  if (filteredAuctions.length === 0) {
    return null;
  }

  return (
    <div className={`${className}`}>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Similar Auctions
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredAuctions.map((auction) => (
          <AuctionCard
            key={auction.id}
            auction={{
              /** Id */
              id: auction.id,
              /** Name */
              name: auction.productName || "",
              /** Slug */
              slug: auction.productSlug || "",
              /** Images */
              images: auction.productImage ? [auction.productImage] : [],
              /** Current Bid */
              currentBid: auction.currentPrice || auction.startingBid || 0,
              /** Starting Bid */
              startingBid: auction.startingBid || 0,
              /** Bid Count */
              bidCount: auction.totalBids || 0,
              /** End Time */
              endTime: auction.endTime,
              /** Status */
              status: auction.status as any,
              /** Featured */
              featured: (auction as any).featured,
              /** Shop */
              shop: auction.shopId
                ? {
                    /** Id */
                    id: auction.shopId,
                    /** Name */
                    name: auction.shopId,
                    /** Is Verified */
                    isVerified: false,
                  }
                : undefined,
            }}
            showShopInfo={true}
          />
        ))}
      </div>
    </div>
  );
}

export default SimilarAuctions;
